import React, { useState, useEffect } from 'react';
import {
  Target,
  Sparkles,
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Calendar,
  AlertCircle,
  ArrowRight,
  Trash2,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import type { GoalItem, GoalMilestone, ReflectionEntry } from '../types';

interface GoalsManagerViewProps {
  goals: GoalItem[];
  entries: ReflectionEntry[];
  onSaveGoal: (goal: GoalItem) => Promise<void>;
  onDeleteGoal: (goalId: string) => Promise<void>;
  onNavigateToReflect: (entry?: ReflectionEntry) => void;
  onNavigateToPlanner: () => void;
  userId: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Career & Work': { bg: 'bg-[#1E3A8A]/30', text: 'text-[#93C5FD]', border: 'border-[#3B82F6]/40' },
  'Mindfulness & Health': { bg: 'bg-[#064E3B]/30', text: 'text-[#6EE7B7]', border: 'border-[#10B981]/40' },
  'Personal Growth': { bg: 'bg-[#4C1D95]/30', text: 'text-[#C4B5FD]', border: 'border-[#8B5CF6]/40' },
  'Creative Craft': { bg: 'bg-[#831843]/30', text: 'text-[#F9A8D4]', border: 'border-[#EC4899]/40' },
  'Productivity': { bg: 'bg-[#78350F]/30', text: 'text-[#FCD34D]', border: 'border-[#F59E0B]/40' },
};

export const GoalsManagerView: React.FC<GoalsManagerViewProps> = ({
  goals,
  entries,
  onSaveGoal,
  onDeleteGoal,
  onNavigateToReflect,
  onNavigateToPlanner,
  userId,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isExtractingFromReflection, setIsExtractingFromReflection] = useState(false);
  const [selectedReflectionForExtraction, setSelectedReflectionForExtraction] = useState<string>(
    entries.length > 0 ? entries[0].id : ''
  );
  const [candidateGoals, setCandidateGoals] = useState<any[]>([]);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual Goal creation state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState<GoalItem['category']>('Personal Growth');
  const [newTimeframe, setNewTimeframe] = useState<GoalItem['timeframe']>('Monthly');
  const [newMilestonesText, setNewMilestonesText] = useState('');

  // Extract candidate goals using Gemini from selected reflection
  const handleExtractGoals = async () => {
    if (!selectedReflectionForExtraction) return;
    const targetEntry = entries.find((e) => e.id === selectedReflectionForExtraction);
    if (!targetEntry) return;

    setIsExtractingFromReflection(true);
    try {
      const fullDialogue = targetEntry.messages.map((m) => `${m.sender}: ${m.text}`).join('\n') || targetEntry.summary || targetEntry.title;
      const res = await fetch('/api/extract-goals-from-reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: fullDialogue,
          reflectionTitle: targetEntry.title,
        }),
      });

      if (!res.ok) throw new Error('Failed to extract goals');
      const data = await res.json();
      setCandidateGoals(data.extractedGoals || []);
    } catch (err) {
      console.error('Error extracting goals:', err);
    } finally {
      setIsExtractingFromReflection(false);
    }
  };

  // Convert an AI Candidate Goal into an active Goal item
  const handleAdoptCandidateGoal = async (cand: any) => {
    const targetEntry = entries.find((e) => e.id === selectedReflectionForExtraction);
    const newGoal: GoalItem = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: cand.title || 'Untitled Strategic Goal',
      description: cand.description || '',
      category: cand.category || 'Personal Growth',
      timeframe: cand.timeframe || 'Monthly',
      status: 'active',
      progress: 0,
      milestones: (cand.milestones || []).map((m: any, idx: number) => ({
        id: `ms_${Date.now()}_${idx}`,
        title: typeof m === 'string' ? m : m.title,
        completed: false,
        estimatedMinutes: m.estimatedMinutes || 30,
      })),
      sourceReflectionId: targetEntry?.id,
      sourceReflectionTitle: targetEntry?.title,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveGoal(newGoal);
    setCandidateGoals((prev) => prev.filter((c) => c !== cand));
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (goal: GoalItem, milestoneId: string) => {
    const updatedMilestones = goal.milestones.map((m) =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    const completedCount = updatedMilestones.filter((m) => m.completed).length;
    const progress = updatedMilestones.length > 0 ? Math.round((completedCount / updatedMilestones.length) * 100) : 0;
    const status = progress === 100 ? 'completed' : goal.status === 'completed' ? 'active' : goal.status;

    await onSaveGoal({
      ...goal,
      milestones: updatedMilestones,
      progress,
      status,
      updatedAt: Date.now(),
    });
  };

  // Create manual goal
  const handleCreateManualGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const milestones: GoalMilestone[] = newMilestonesText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .map((s, idx) => ({
        id: `ms_${Date.now()}_${idx}`,
        title: s.replace(/^[-*•\d.]+\s*/, ''),
        completed: false,
        estimatedMinutes: 30,
      }));

    const newGoal: GoalItem = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      timeframe: newTimeframe,
      status: 'active',
      progress: 0,
      milestones: milestones.length > 0 ? milestones : [
        { id: `ms_${Date.now()}_0`, title: 'Define initial action step', completed: false, estimatedMinutes: 30 }
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveGoal(newGoal);
    setShowManualModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewMilestonesText('');
  };

  const filteredGoals = goals.filter((g) => {
    if (activeTab === 'active' && g.status !== 'active') return false;
    if (activeTab === 'completed' && g.status !== 'completed') return false;
    if (selectedCategory !== 'all' && g.category !== selectedCategory) return false;
    return true;
  });

  const totalMilestones = goals.reduce((acc, g) => acc + g.milestones.length, 0);
  const completedMilestones = goals.reduce((acc, g) => acc + g.milestones.filter((m) => m.completed).length, 0);
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A080]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
            <Target className="w-3.5 h-3.5" />
            <span>Reflective Goal Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
            Strategic Goals & Milestones
          </h1>
          <p className="text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
            Turn your Socratic reflections and insights into actionable, high-leverage milestones automatically synthesized by Gemini.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={onNavigateToPlanner}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] font-medium text-sm transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C0A080]" />
            <span>Daily Planner</span>
          </button>
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] font-semibold text-sm transition-all shadow-lg shadow-[#C0A080]/15 active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#0A0A0B]" />
            <span>Custom Goal</span>
          </button>
        </div>
      </div>

      {/* Goal Generation from Reflection Card (The Core Workflow) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1A1612] via-[#141417] to-[#121214] border border-[#C0A080]/30 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#C0A080]/20 border border-[#C0A080]/40 flex items-center justify-center text-[#C0A080]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F4F4F5]">
                Synthesize Goals From Reflection
              </h2>
              <p className="text-xs text-[#A1A1AA]">
                Gemini will scan your reflection dialogue to formulate structured strategic goals & micro-milestones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <select
              value={selectedReflectionForExtraction}
              onChange={(e) => setSelectedReflectionForExtraction(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
            >
              {entries.length === 0 ? (
                <option value="">No reflections available</option>
              ) : (
                entries.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title || 'Untitled'} ({new Date(e.createdAt).toLocaleDateString()})
                  </option>
                ))
              )}
            </select>

            <button
              onClick={handleExtractGoals}
              disabled={isExtractingFromReflection || !selectedReflectionForExtraction}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-semibold disabled:opacity-50 transition-all cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isExtractingFromReflection ? 'animate-spin' : ''}`} />
              <span>{isExtractingFromReflection ? 'Synthesizing...' : 'Extract Goals'}</span>
            </button>
          </div>
        </div>

        {/* Candidate goals generated by AI ready to be adopted */}
        {candidateGoals.length > 0 && (
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#C0A080]">
              Suggested Strategic Goals Extracted from Reflection:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidateGoals.map((cand, idx) => {
                const catStyle = CATEGORY_COLORS[cand.category] || CATEGORY_COLORS['Personal Growth'];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[#141417] border border-[#C0A080]/40 space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                          {cand.category}
                        </span>
                        <span className="text-[11px] text-[#A1A1AA]">{cand.timeframe}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-[#F4F4F5]">{cand.title}</h4>
                      <p className="text-xs text-[#A1A1AA] leading-relaxed">{cand.description}</p>

                      <div className="pt-2 space-y-1.5">
                        <p className="text-[10px] uppercase font-bold text-[#71717A]">Suggested Milestones:</p>
                        <ul className="space-y-1 text-xs text-[#D4D4D8]">
                          {(cand.milestones || []).map((m: any, mIdx: number) => (
                            <li key={mIdx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C0A080]" />
                              <span>{typeof m === 'string' ? m : m.title}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAdoptCandidateGoal(cand)}
                      className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-semibold transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Adopt to Active Goals</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Metrics Row: Overall Progress, Total Goals, Active, Completed */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
          <p className="text-xs text-[#A1A1AA] font-medium">Overall Progress</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-semibold text-[#F4F4F5]">{overallProgress}%</span>
            <span className="text-xs text-[#34D399] font-medium">{completedMilestones}/{totalMilestones} steps</span>
          </div>
          <div className="w-full h-1.5 bg-[#18181B] rounded-full overflow-hidden mt-2">
            <div className="h-full bg-[#C0A080] rounded-full transition-all duration-500" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
          <p className="text-xs text-[#A1A1AA] font-medium">Active Goals</p>
          <span className="text-2xl font-semibold text-[#F4F4F5]">
            {goals.filter((g) => g.status === 'active').length}
          </span>
          <p className="text-[11px] text-[#A1A1AA]">In active execution</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
          <p className="text-xs text-[#A1A1AA] font-medium">Completed</p>
          <span className="text-2xl font-semibold text-[#34D399]">
            {goals.filter((g) => g.status === 'completed').length}
          </span>
          <p className="text-[11px] text-[#34D399]">Accomplished milestones</p>
        </div>

        <div className="p-4 rounded-xl bg-[#121214] border border-[#27272A] space-y-1">
          <p className="text-xs text-[#A1A1AA] font-medium">Linked Reflections</p>
          <span className="text-2xl font-semibold text-[#60A5FA]">
            {goals.filter((g) => g.sourceReflectionId).length}
          </span>
          <p className="text-[11px] text-[#A1A1AA]">Grounded in journal notes</p>
        </div>
      </div>

      {/* Filter Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#27272A]">
          {(['active', 'all', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5]'
              }`}
            >
              {tab} Goals ({goals.filter((g) => tab === 'all' || g.status === tab).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'Career & Work', 'Mindfulness & Health', 'Personal Growth', 'Creative Craft', 'Productivity'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#18181B] border-[#C0A080] text-[#D4B996]'
                  : 'bg-[#121214] border-[#27272A] text-[#71717A] hover:text-[#A1A1AA]'
              }`}
            >
              {cat === 'all' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121214] border border-[#27272A] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#18181B] text-[#71717A] mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif font-semibold text-[#F4F4F5]">No goals found in this view</h3>
          <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
            Extract goals from your recent reflections above, or create a custom goal with clear milestones.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => {
            const catStyle = CATEGORY_COLORS[goal.category] || CATEGORY_COLORS['Personal Growth'];
            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] hover:border-[#3F3F46] transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top tags + Delete button */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${catStyle.bg} ${catStyle.text} border ${catStyle.border}`}>
                        {goal.category}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-[#18181B] text-[#A1A1AA] border border-[#27272A]">
                        {goal.timeframe}
                      </span>
                    </div>

                    <button
                      onClick={() => onDeleteGoal(goal.id)}
                      className="p-1 text-[#71717A] hover:text-[#FB7185] transition-colors cursor-pointer"
                      title="Delete goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#F4F4F5]">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">{goal.description}</p>
                    )}
                  </div>

                  {/* Source Reflection link if extracted */}
                  {goal.sourceReflectionTitle && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#C0A080] bg-[#1C1814] px-2.5 py-1 rounded-lg border border-[#C0A080]/20">
                      <Compass className="w-3 h-3 shrink-0" />
                      <span className="truncate">Grounded in: "{goal.sourceReflectionTitle}"</span>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A1A1AA]">Milestones</span>
                      <span className="font-semibold text-[#F4F4F5]">{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#18181B] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C0A080] to-[#34D399] rounded-full transition-all duration-500"
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones Checklist */}
                  <div className="space-y-2 pt-2 border-t border-[#27272A]">
                    {goal.milestones.map((ms) => (
                      <div
                        key={ms.id}
                        onClick={() => handleToggleMilestone(goal, ms.id)}
                        className="group flex items-start gap-2.5 p-2 rounded-lg hover:bg-[#18181B] transition-colors cursor-pointer"
                      >
                        <button className="mt-0.5 text-[#C0A080] group-hover:scale-110 transition-transform">
                          {ms.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#71717A]" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs leading-relaxed ${ms.completed ? 'line-through text-[#71717A]' : 'text-[#E4E4E7]'}`}>
                            {ms.title}
                          </p>
                          {ms.estimatedMinutes && (
                            <span className="text-[10px] text-[#71717A] flex items-center gap-1 mt-0.5">
                              <Clock className="w-2.5 h-2.5" /> ~{ms.estimatedMinutes} mins
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-3 border-t border-[#27272A] flex items-center justify-between">
                  <span className="text-[10px] text-[#71717A]">
                    Created {new Date(goal.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={onNavigateToPlanner}
                    className="flex items-center gap-1 text-xs font-semibold text-[#C0A080] hover:text-[#D4B996] transition-colors cursor-pointer"
                  >
                    <span>Schedule in Daily Planner</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Goal Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#121214] border border-[#27272A] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <h3 className="text-lg font-serif font-semibold text-[#F4F4F5]">Add Strategic Goal</h3>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-[#A1A1AA] hover:text-[#F4F4F5] text-lg cursor-pointer"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleCreateManualGoal} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">Goal Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Master Full-Stack Architecture & Security"
                  className="w-full p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-sm text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">Why This Matters (Context)</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="The strategic impact and intrinsic motivation behind this goal..."
                  rows={2}
                  className="w-full p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[#A1A1AA] font-medium">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
                  >
                    <option value="Career & Work">Career & Work</option>
                    <option value="Mindfulness & Health">Mindfulness & Health</option>
                    <option value="Personal Growth">Personal Growth</option>
                    <option value="Creative Craft">Creative Craft</option>
                    <option value="Productivity">Productivity</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[#A1A1AA] font-medium">Horizon</label>
                  <select
                    value={newTimeframe}
                    onChange={(e: any) => setNewTimeframe(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
                  >
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Long-term">Long-term</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[#A1A1AA] font-medium">Milestones (One per line)</label>
                <textarea
                  value={newMilestonesText}
                  onChange={(e) => setNewMilestonesText(e.target.value)}
                  placeholder="Phase 1: Draft system boundary&#10;Phase 2: Implement security models&#10;Phase 3: Deploy and review metrics"
                  rows={3}
                  className="w-full p-2.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#18181B] text-[#A1A1AA] hover:text-[#F4F4F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] font-semibold cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
