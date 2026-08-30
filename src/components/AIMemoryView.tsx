import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  RefreshCw,
  Search,
  Filter,
  Eye,
  EyeOff,
  Flame,
  Lightbulb,
  Heart,
  Target,
  Compass,
  Zap,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';
import type { AIMemoryItem, ReflectionEntry, UserProfile } from '../types';

interface AIMemoryViewProps {
  user: UserProfile | null;
  memories: AIMemoryItem[];
  reflections: ReflectionEntry[];
  onSaveMemory: (memory: AIMemoryItem) => Promise<void>;
  onDeleteMemory: (memoryId: string) => Promise<void>;
  onStartReflectionWithTopic?: (topic: string) => void;
}

const CATEGORIES: Array<{
  id: AIMemoryItem['category'] | 'all';
  label: string;
  icon: any;
  color: string;
}> = [
  { id: 'all', label: 'All Insights', icon: Brain, color: '#C0A080' },
  { id: 'Core Value', label: 'Core Values', icon: Heart, color: '#F43F5E' },
  { id: 'Recurring Pattern', label: 'Recurring Patterns', icon: RefreshCw, color: '#8B5CF6' },
  { id: 'Growth Goal', label: 'Growth Goals', icon: Target, color: '#10B981' },
  { id: 'Life Context', label: 'Life Context', icon: Compass, color: '#3B82F6' },
  { id: 'Communication Preference', label: 'Communication Style', icon: MessageSquare, color: '#F59E0B' },
  { id: 'Emotional Trigger', label: 'Emotional Triggers', icon: Zap, color: '#EC4899' },
];

export const AIMemoryView: React.FC<AIMemoryViewProps> = ({
  user,
  memories,
  reflections,
  onSaveMemory,
  onDeleteMemory,
  onStartReflectionWithTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<AIMemoryItem['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [selectedReflectionId, setSelectedReflectionId] = useState<string>(
    reflections[0]?.id || ''
  );
  const [extractedCandidates, setExtractedCandidates] = useState<AIMemoryItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMemory, setEditingMemory] = useState<AIMemoryItem | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState<AIMemoryItem['category']>('Core Value');
  const [formKey, setFormKey] = useState('');
  const [formStatement, setFormStatement] = useState('');
  const [formConfidence, setFormConfidence] = useState(90);

  const filteredMemories = memories.filter((mem) => {
    const matchesCategory = selectedCategory === 'all' || mem.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      mem.statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCount = memories.filter((m) => m.isActive).length;

  const handleExtractMemories = async () => {
    const targetReflect = reflections.find((r) => r.id === selectedReflectionId) || reflections[0];
    if (!targetReflect) return;

    setIsExtracting(true);
    try {
      const fullText = `${targetReflect.title}\n\n${targetReflect.summary}\n\n${targetReflect.messages.map((m) => m.text).join('\n')}`;
      const res = await fetch('/api/extract-memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: targetReflect.title,
          reflectionText: fullText,
          existingMemories: memories.map((m) => ({ category: m.category, statement: m.statement })),
        }),
      });

      if (!res.ok) throw new Error('Extraction failed');
      const data = await res.json();
      if (Array.isArray(data.memories)) {
        const candidateItems: AIMemoryItem[] = data.memories.map((m: any) => ({
          id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          userId: user?.uid || 'guest_local',
          category: m.category || 'Core Value',
          key: m.key || 'personal_insight',
          statement: m.statement || '',
          confidence: m.confidence || 88,
          sourceReflectionId: targetReflect.id,
          sourceReflectionTitle: targetReflect.title,
          isActive: true,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }));
        setExtractedCandidates(candidateItems);
      }
    } catch (err) {
      console.error('Error extracting memories:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAdoptCandidate = async (cand: AIMemoryItem) => {
    await onSaveMemory(cand);
    setExtractedCandidates((prev) => prev.filter((c) => c.id !== cand.id));
  };

  const handleAdoptAllCandidates = async () => {
    for (const cand of extractedCandidates) {
      await onSaveMemory(cand);
    }
    setExtractedCandidates([]);
  };

  const handleToggleActive = async (memory: AIMemoryItem) => {
    await onSaveMemory({
      ...memory,
      isActive: !memory.isActive,
      updatedAt: Date.now(),
    });
  };

  const handleOpenAddModal = (mem?: AIMemoryItem) => {
    if (mem) {
      setEditingMemory(mem);
      setFormCategory(mem.category);
      setFormKey(mem.key);
      setFormStatement(mem.statement);
      setFormConfidence(mem.confidence);
    } else {
      setEditingMemory(null);
      setFormCategory('Core Value');
      setFormKey('');
      setFormStatement('');
      setFormConfidence(90);
    }
    setShowAddModal(true);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStatement.trim()) return;

    const newKey = formKey.trim() || formStatement.slice(0, 24).toLowerCase().replace(/[^a-z0-9]+/g, '_');

    const memoryItem: AIMemoryItem = {
      id: editingMemory ? editingMemory.id : `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid || 'guest_local',
      category: formCategory,
      key: newKey,
      statement: formStatement.trim(),
      confidence: formConfidence,
      sourceReflectionId: editingMemory?.sourceReflectionId,
      sourceReflectionTitle: editingMemory?.sourceReflectionTitle,
      isActive: editingMemory ? editingMemory.isActive : true,
      createdAt: editingMemory ? editingMemory.createdAt : Date.now(),
      updatedAt: Date.now(),
    };

    await onSaveMemory(memoryItem);
    setShowAddModal(false);
  };

  const getCategoryColor = (cat: AIMemoryItem['category']) => {
    const found = CATEGORIES.find((c) => c.id === cat);
    return found ? found.color : '#C0A080';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5" />
              <span>Cognitive Profile & Long-Term Memory</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
              AI Memory Bank
            </h1>
            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-2xl">
              Everything Gemini has synthesized and remembered across your reflections: your core values, behavioral patterns, growth intentions, and communication preferences.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenAddModal()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-semibold transition-all shadow-md shadow-[#C0A080]/15 active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#0A0A0B]" />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-[#27272A]/80">
          <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block">Total Memories</span>
            <span className="text-xl font-bold text-[#F4F4F5]">{memories.length}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block">Active in Socratic AI</span>
            <span className="text-xl font-bold text-[#34D399]">{activeCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block">Core Values</span>
            <span className="text-xl font-bold text-[#F43F5E]">
              {memories.filter((m) => m.category === 'Core Value').length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
            <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider block">Patterns & Triggers</span>
            <span className="text-xl font-bold text-[#8B5CF6]">
              {memories.filter((m) => m.category === 'Recurring Pattern' || m.category === 'Emotional Trigger').length}
            </span>
          </div>
        </div>
      </div>

      {/* Synthesize Memories from Journal Reflection Section */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080]">
              <Sparkles className="w-4 h-4 text-[#C0A080]" />
              <span>Auto-Extract Memories From Recent Reflections</span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Have Gemini analyze past journal entries to uncover hidden values, communication tendencies, or repeating themes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedReflectionId}
              onChange={(e) => setSelectedReflectionId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#121214] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080] max-w-[200px] truncate cursor-pointer"
            >
              {reflections.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || 'Untitled Entry'}
                </option>
              ))}
            </select>

            <button
              onClick={handleExtractMemories}
              disabled={isExtracting || reflections.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#F4F4F5] text-xs font-medium transition-all disabled:opacity-50 cursor-pointer shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C0A080] ${isExtracting ? 'animate-spin' : ''}`} />
              <span>{isExtracting ? 'Synthesizing...' : 'Synthesize Insights'}</span>
            </button>
          </div>
        </div>

        {/* Candidate Proposals */}
        {extractedCandidates.length > 0 && (
          <div className="p-4 rounded-xl bg-[#121214] border border-[#C0A080]/30 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#D4B996]">
                <Lightbulb className="w-4 h-4 text-[#C0A080]" />
                <span>Found {extractedCandidates.length} New Cognitive Insights</span>
              </div>
              <button
                onClick={handleAdoptAllCandidates}
                className="text-xs font-semibold text-[#C0A080] hover:underline cursor-pointer"
              >
                Adopt All to Memory
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extractedCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-3 rounded-xl bg-[#18181B] border border-[#27272A] space-y-2 flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{
                          backgroundColor: `${getCategoryColor(cand.category)}20`,
                          color: getCategoryColor(cand.category),
                        }}
                      >
                        {cand.category}
                      </span>
                      <span className="text-[10px] text-[#71717A] font-mono">{cand.confidence}% match</span>
                    </div>
                    <p className="text-xs text-[#F4F4F5] leading-relaxed">{cand.statement}</p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleAdoptCandidate(cand)}
                      className="px-2.5 py-1 rounded-lg bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Adopt to Memory
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold shadow-sm'
                    : 'bg-[#18181B] text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A] border border-[#27272A]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memories..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#C0A080]"
          />
        </div>
      </div>

      {/* Memory Cards Grid */}
      {filteredMemories.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#121214] border border-[#27272A] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#27272A] flex items-center justify-center mx-auto text-[#71717A]">
            <Brain className="w-6 h-6" />
          </div>
          <h3 className="text-base font-serif text-[#F4F4F5]">No memories found</h3>
          <p className="text-xs text-[#A1A1AA] max-w-md mx-auto">
            Extract insights from your reflections above or click "Add Memory" to tell Gemini your personal core values and preferences directly.
          </p>
          <button
            onClick={() => handleOpenAddModal()}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C0A080] text-[#0A0A0B] text-xs font-semibold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create First Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMemories.map((mem) => {
            const catColor = getCategoryColor(mem.category);
            return (
              <div
                key={mem.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  mem.isActive
                    ? 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                    : 'bg-[#121214] border-[#27272A]/50 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      style={{
                        backgroundColor: `${catColor}20`,
                        color: catColor,
                      }}
                    >
                      {mem.category}
                    </span>

                    <button
                      onClick={() => handleToggleActive(mem)}
                      title={mem.isActive ? 'Active in Gemini AI Context' : 'Muted (Excluded from AI context)'}
                      className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        mem.isActive
                          ? 'bg-[#064E3B]/40 text-[#34D399] border border-[#059669]/40'
                          : 'bg-[#27272A] text-[#71717A]'
                      }`}
                    >
                      {mem.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{mem.isActive ? 'Active' : 'Muted'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#F4F4F5] leading-relaxed font-medium">{mem.statement}</p>
                </div>

                <div className="pt-2 border-t border-[#27272A] flex items-center justify-between text-[11px] text-[#71717A]">
                  <div className="flex items-center gap-1.5 truncate max-w-[150px]">
                    {mem.sourceReflectionTitle ? (
                      <span className="truncate text-[10px] text-[#A1A1AA]" title={mem.sourceReflectionTitle}>
                        Ref: {mem.sourceReflectionTitle}
                      </span>
                    ) : (
                      <span className="text-[10px]">Manual Entry</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenAddModal(mem)}
                      className="p-1 rounded-md text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A] transition-colors cursor-pointer"
                      title="Edit Memory"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMemory(mem.id)}
                      className="p-1 rounded-md text-[#71717A] hover:text-[#FB7185] hover:bg-[#27272A] transition-colors cursor-pointer"
                      title="Delete Memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#121214] border border-[#27272A] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#C0A080]" />
                <h3 className="font-semibold text-base text-[#F4F4F5]">
                  {editingMemory ? 'Edit Memory Insight' : 'Add New Cognitive Memory'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#71717A] hover:text-[#F4F4F5] text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A1A1AA]">Insight Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080] cursor-pointer"
                >
                  <option value="Core Value">Core Value (Principles & Non-negotiables)</option>
                  <option value="Recurring Pattern">Recurring Pattern (Habits & Tendencies)</option>
                  <option value="Growth Goal">Growth Goal (Aspirations & Intentions)</option>
                  <option value="Life Context">Life Context (Roles, Projects & Life)</option>
                  <option value="Communication Preference">Communication Style (How you think best)</option>
                  <option value="Emotional Trigger">Emotional Trigger (Stressors & Motivators)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#A1A1AA]">Memory Statement</label>
                <textarea
                  rows={3}
                  value={formStatement}
                  onChange={(e) => setFormStatement(e.target.value)}
                  placeholder="e.g. Needs at least 90 minutes of uninterrupted morning focus for creative output."
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#C0A080]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-bold transition-all cursor-pointer"
                >
                  {editingMemory ? 'Update Memory' : 'Save Memory'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
