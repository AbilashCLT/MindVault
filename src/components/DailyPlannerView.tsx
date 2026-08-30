import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Zap,
  Coffee,
  Brain,
  Smile,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Target,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import type { DailyPlan, DailyTimeBlock, GoalItem, ReflectionEntry } from '../types';

interface DailyPlannerViewProps {
  goals: GoalItem[];
  entries: ReflectionEntry[];
  onSaveDailyPlan: (plan: DailyPlan) => Promise<void>;
  onNavigateToGoals: () => void;
  onNavigateToReflect: (entry?: ReflectionEntry) => void;
  userId: string;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
  'Deep Work': { bg: 'bg-[#1E3A8A]/30 border-[#3B82F6]/40', text: 'text-[#93C5FD]', icon: Brain },
  'Mindfulness': { bg: 'bg-[#064E3B]/30 border-[#10B981]/40', text: 'text-[#6EE7B7]', icon: Smile },
  'Admin & Comms': { bg: 'bg-[#4C1D95]/30 border-[#8B5CF6]/40', text: 'text-[#C4B5FD]', icon: Clock },
  'Health & Rest': { bg: 'bg-[#831843]/30 border-[#EC4899]/40', text: 'text-[#F9A8D4]', icon: Coffee },
  'Goal Focus': { bg: 'bg-[#78350F]/30 border-[#F59E0B]/40', text: 'text-[#FCD34D]', icon: Target },
};

export const DailyPlannerView: React.FC<DailyPlannerViewProps> = ({
  goals,
  entries,
  onSaveDailyPlan,
  onNavigateToGoals,
  onNavigateToReflect,
  userId,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [energyLevel, setEnergyLevel] = useState<number>(4);
  const [focusIntention, setFocusIntention] = useState<string>('');
  const [priorities, setPriorities] = useState<Array<{ id: string; text: string; completed: boolean }>>([]);
  const [timeBlocks, setTimeBlocks] = useState<DailyTimeBlock[]>([]);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Load existing daily plan for selected date from localStorage or state
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`reflect_ai_daily_plan_${userId}_${selectedDate}`);
      if (stored) {
        const parsed: DailyPlan = JSON.parse(stored);
        setFocusIntention(parsed.focusIntention || '');
        setPriorities(parsed.topPriorities || []);
        setTimeBlocks(parsed.timeBlocks || []);
        setEnergyLevel(parsed.energyLevel || 4);
      } else {
        // Default initial template
        setFocusIntention('Maintain intentional focus on core strategic milestones.');
        setPriorities([
          { id: 'p1', text: 'Advance active strategic goal milestone', completed: false },
          { id: 'p2', text: 'Dedicated 90m deep focus session', completed: false },
          { id: 'p3', text: 'Mindful pause & evening reflection in Lumina Vault', completed: false }
        ]);
        setTimeBlocks([
          { id: 'tb1', timeSlot: '09:00 - 09:30', title: 'Morning Calibration & Daily Intention', category: 'Mindfulness', completed: false },
          { id: 'tb2', timeSlot: '09:30 - 11:30', title: 'Deep Work: High-Leverage Strategic Goal', category: 'Deep Work', completed: false },
          { id: 'tb3', timeSlot: '12:00 - 13:00', title: 'Mindful Restoration & Lunch', category: 'Health & Rest', completed: false },
          { id: 'tb4', timeSlot: '14:00 - 15:30', title: 'Milestone Execution & Collaboration', category: 'Goal Focus', completed: false },
          { id: 'tb5', timeSlot: '17:00 - 17:30', title: 'Daily Wrap & Socratic Journal Entry', category: 'Mindfulness', completed: false }
        ]);
      }
    } catch {
      // ignore
    }
  }, [selectedDate, userId]);

  // Persist plan changes
  const persistCurrentPlan = async (
    newIntention: string,
    newPriorities: Array<{ id: string; text: string; completed: boolean }>,
    newBlocks: DailyTimeBlock[],
    newEnergy: number
  ) => {
    setSaveStatus('saving');
    const plan: DailyPlan = {
      id: `plan_${selectedDate}`,
      userId,
      dateKey: selectedDate,
      focusIntention: newIntention,
      topPriorities: newPriorities,
      timeBlocks: newBlocks,
      energyLevel: newEnergy,
      updatedAt: Date.now(),
    };
    await onSaveDailyPlan(plan);
    setSaveStatus('saved');
  };

  // AI-powered daily plan generation based on energy level and active goals
  const handleGenerateAIPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch('/api/generate-daily-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goals,
          recentReflections: entries.slice(0, 5),
          energyLevel,
          dateKey: selectedDate,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate daily plan');
      const data = await res.json();

      const newIntention = data.focusIntention || focusIntention;
      const newPriorities = (data.topPriorities || []).map((p: any, idx: number) => ({
        id: `p_${Date.now()}_${idx}`,
        text: p.text,
        completed: false,
      }));
      const newBlocks = (data.timeBlocks || []).map((b: any, idx: number) => ({
        id: `tb_${Date.now()}_${idx}`,
        timeSlot: b.timeSlot,
        title: b.title,
        category: b.category || 'Deep Work',
        completed: false,
        notes: b.notes || '',
      }));

      setFocusIntention(newIntention);
      setPriorities(newPriorities);
      setTimeBlocks(newBlocks);
      await persistCurrentPlan(newIntention, newPriorities, newBlocks, energyLevel);
    } catch (err) {
      console.error('Error generating AI plan:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleTogglePriority = async (id: string) => {
    const updated = priorities.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p));
    setPriorities(updated);
    await persistCurrentPlan(focusIntention, updated, timeBlocks, energyLevel);
  };

  const handleToggleBlock = async (id: string) => {
    const updated = timeBlocks.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b));
    setTimeBlocks(updated);
    await persistCurrentPlan(focusIntention, priorities, updated, energyLevel);
  };

  // Navigate date
  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const completedPrioritiesCount = priorities.filter((p) => p.completed).length;
  const completedBlocksCount = timeBlocks.filter((b) => b.completed).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner with Date Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A080]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5" />
            <span>Energy-Aligned Daily Architecture</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
            Daily Focus & Time Blocking
          </h1>
          <p className="text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
            Calibrate your daily agenda to your energy capacity and active strategic goals.
          </p>
        </div>

        {/* Date Navigator & AI Synthesizer button */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <div className="flex items-center gap-1 bg-[#18181B] border border-[#27272A] rounded-xl p-1">
            <button
              onClick={() => changeDate(-1)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-[#F4F4F5]">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </span>
            <button
              onClick={() => changeDate(1)}
              className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleGenerateAIPlan}
            disabled={isGeneratingPlan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] font-semibold text-xs transition-all shadow-lg shadow-[#C0A080]/15 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isGeneratingPlan ? 'animate-spin' : ''}`} />
            <span>{isGeneratingPlan ? 'Calibrating Day...' : 'AI Synthesize Day'}</span>
          </button>
        </div>
      </div>

      {/* Energy Level Check-in Bar */}
      <div className="p-4 rounded-xl bg-[#141417] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[#A1A1AA]">
          <Zap className="w-4 h-4 text-[#F59E0B]" />
          <span>Calibrate Energy Capacity for Today:</span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              onClick={() => {
                setEnergyLevel(lvl);
                persistCurrentPlan(focusIntention, priorities, timeBlocks, lvl);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                energyLevel === lvl
                  ? 'bg-[#C0A080] border-[#C0A080] text-[#0A0A0B]'
                  : 'bg-[#18181B] border-[#27272A] text-[#A1A1AA] hover:text-[#F4F4F5]'
              }`}
            >
              {lvl === 1 ? '1 - Low' : lvl === 3 ? '3 - Balanced' : lvl === 5 ? '5 - High Peak' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* 2 Columns: Priorities & Intention (Left) | Time Blocking Timeline (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Intention + Top 3 Priorities */}
        <div className="space-y-6">
          {/* Daily Intention */}
          <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C0A080]">
                Daily Focus Intention
              </h3>
              <span className="text-[10px] text-[#34D399] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Auto-Persisted
              </span>
            </div>
            <textarea
              value={focusIntention}
              onChange={(e) => {
                setFocusIntention(e.target.value);
                persistCurrentPlan(e.target.value, priorities, timeBlocks, energyLevel);
              }}
              placeholder="What anchor intention defines your presence today?"
              rows={2}
              className="w-full p-3 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] leading-relaxed focus:outline-none focus:border-[#C0A080]"
            />
          </div>

          {/* Top 3 Non-Negotiable Priorities */}
          <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#C0A080]">
                Top 3 Daily Priorities
              </h3>
              <span className="text-xs text-[#A1A1AA]">
                {completedPrioritiesCount}/{priorities.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {priorities.map((p, idx) => (
                <div
                  key={p.id}
                  onClick={() => handleTogglePriority(p.id)}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border transition-all cursor-pointer ${
                    p.completed
                      ? 'bg-[#18181B]/50 border-[#27272A]'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                  }`}
                >
                  <button className="mt-0.5 text-[#C0A080]">
                    {p.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                    ) : (
                      <Circle className="w-4 h-4 text-[#71717A]" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#71717A] uppercase mr-1">#{idx + 1}</span>
                    <span className={`text-xs leading-relaxed ${p.completed ? 'line-through text-[#71717A]' : 'text-[#E4E4E7]'}`}>
                      {p.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Goals Quick Bridge */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#1C1814] to-[#121214] border border-[#C0A080]/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-[#D4B996]">Active Strategic Goals</span>
              <button
                onClick={onNavigateToGoals}
                className="text-[11px] text-[#C0A080] hover:underline cursor-pointer"
              >
                Manage Goals →
              </button>
            </div>
            <div className="space-y-2">
              {goals.slice(0, 3).map((g) => (
                <div key={g.id} className="p-2 rounded-lg bg-[#141417] border border-[#27272A] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[#F4F4F5] truncate">{g.title}</span>
                    <span className="text-[10px] text-[#34D399] font-bold">{g.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Time-Blocking Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div>
                <h3 className="text-base font-serif font-semibold text-[#F4F4F5]">
                  Chronological Time Blocks
                </h3>
                <p className="text-xs text-[#A1A1AA]">
                  Structured focus windows mapped to your daily biological energy rhythm.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#34D399]">
                {completedBlocksCount}/{timeBlocks.length} Completed
              </span>
            </div>

            <div className="space-y-3">
              {timeBlocks.map((block) => {
                const style = CATEGORY_STYLES[block.category] || CATEGORY_STYLES['Deep Work'];
                const Icon = style.icon;
                return (
                  <div
                    key={block.id}
                    onClick={() => handleToggleBlock(block.id)}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer ${
                      block.completed
                        ? 'bg-[#141417]/40 border-[#27272A] opacity-60'
                        : 'bg-[#18181B] border-[#27272A] hover:border-[#C0A080]/50 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start sm:items-center gap-3">
                      <button className="mt-0.5 sm:mt-0 text-[#C0A080]">
                        {block.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[#71717A]" />
                        )}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-semibold text-[#C0A080]">
                            {block.timeSlot}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${style.bg} ${style.text}`}>
                            <Icon className="w-3 h-3" />
                            <span>{block.category}</span>
                          </span>
                        </div>
                        <h4 className={`text-sm font-medium ${block.completed ? 'line-through text-[#71717A]' : 'text-[#F4F4F5]'}`}>
                          {block.title}
                        </h4>
                        {block.notes && (
                          <p className="text-xs text-[#A1A1AA]">{block.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="self-end sm:self-auto">
                      {block.completed ? (
                        <span className="text-[11px] px-2 py-0.5 rounded bg-[#064E3B]/40 text-[#34D399] border border-[#059669]/40 font-medium">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#71717A] group-hover:text-[#F4F4F5]">
                          Mark Done
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Evening Reflection Trigger Button */}
            <div className="p-4 rounded-xl bg-[#141417] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
              <div className="space-y-0.5">
                <h4 className="text-xs font-semibold text-[#F4F4F5]">Ready for Evening Retrospective?</h4>
                <p className="text-[11px] text-[#A1A1AA]">
                  Bridge your completed daily plan into a Socratic reflection note in Lumina Vault.
                </p>
              </div>
              <button
                onClick={() => onNavigateToReflect()}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-semibold transition-all cursor-pointer shrink-0"
              >
                <span>Launch Evening Reflection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
