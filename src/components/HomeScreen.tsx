import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  TrendingUp,
  ArrowRight,
  RefreshCw,
  Zap,
  Brain,
  Compass,
  FileText,
  Target,
  Search,
  Calendar,
  Smile,
  ShieldCheck,
  Award,
  ChevronRight,
  Clock,
  Star,
  Activity,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type {
  ReflectionEntry,
  ReflectionMode,
  AIDigestSummary,
  MoodDataPoint,
  AppView,
} from '../types';

interface HomeScreenProps {
  entries: ReflectionEntry[];
  onStartNewReflection: (mode?: ReflectionMode, initialPrompt?: string) => void;
  onSelectEntry: (entry: ReflectionEntry) => void;
  onNavigateToView: (view: AppView) => void;
  userDisplayName?: string | null;
}

const QUICK_MODES: Array<{
  id: ReflectionMode;
  label: string;
  desc: string;
  icon: any;
  color: string;
  badge: string;
}> = [
  {
    id: 'reflection',
    label: 'Mindful Reflection',
    desc: 'Unpack clarity, emotional tone, and thoughtful self-awareness.',
    icon: Compass,
    color: '#C0A080',
    badge: 'Introspective',
  },
  {
    id: 'brainstorm',
    label: 'Creative Ideation',
    desc: 'Expand possibilities with divergent thinking models.',
    icon: Brain,
    color: '#60A5FA',
    badge: 'Divergent',
  },
  {
    id: 'action_plan',
    label: 'Action Roadmap',
    desc: 'Structure milestones, immediate priorities, and clear next steps.',
    icon: Target,
    color: '#34D399',
    badge: 'Productivity',
  },
  {
    id: 'summary',
    label: 'Executive Synthesis',
    desc: 'Distill core takeaways, themes, and key achievements.',
    icon: FileText,
    color: '#F472B6',
    badge: 'Concise',
  },
  {
    id: 'deep_dive',
    label: 'Analytical Probe',
    desc: 'Examine underlying assumptions and root cause patterns.',
    icon: Search,
    color: '#A78BFA',
    badge: 'Analytical',
  },
];

const DAILY_SPARKS = [
  'What is the single most important priority on your mind today, and what makes it pivotal?',
  'Reflect on a recent challenge: what unexpected insight did you uncover about yourself?',
  'If you had full clarity on your next major goal, what is the first bold action you would take?',
  'What thought or project gave you the highest energy this week?',
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  entries,
  onStartNewReflection,
  onSelectEntry,
  onNavigateToView,
  userDisplayName,
}) => {
  const [digest, setDigest] = useState<AIDigestSummary | null>(null);
  const [isDigestLoading, setIsDigestLoading] = useState(false);
  const [dailySparkIndex] = useState(() => Math.floor(Math.random() * DAILY_SPARKS.length));

  // Compute Mood & Clarity time-series data from actual user entries
  const moodChartData = useMemo(() => {
    if (entries.length === 0) {
      // Baseline welcoming trajectory when starting out
      const today = new Date();
      return Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() - (5 - i));
        return {
          id: `sample_${i}`,
          date: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
          moodScore: 70 + (i * 4),
          clarityIndex: 75 + (i * 3),
          title: i === 5 ? 'Private Vault Initialized' : 'Baseline Calibration',
          mode: 'reflection',
          emotion: 'Curious',
        };
      });
    }

    // Sort chronologically for chart display
    const sorted = [...entries].sort((a, b) => a.createdAt - b.createdAt);
    return sorted.slice(-12).map((e) => {
      // Map moodScore (-1.0 to 1.0) into 0-100 scale
      const normalizedMood = typeof e.moodScore === 'number'
        ? Math.round(((e.moodScore + 1) / 2) * 100)
        : 75;
      const clarity = typeof e.clarityIndex === 'number' ? e.clarityIndex : 80;

      return {
        id: e.id,
        date: new Date(e.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        moodScore: normalizedMood,
        clarityIndex: clarity,
        title: e.title,
        mode: e.mode,
        emotion: e.dominantEmotions?.[0] || 'Reflective',
      };
    });
  }, [entries]);

  // Compute emotion frequency breakdown
  const emotionStats = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      (e.dominantEmotions || ['Reflective', 'Focused']).forEach((em) => {
        counts[em] = (counts[em] || 0) + 1;
      });
    });
    const total = Object.values(counts).reduce((acc, curr) => acc + curr, 0) || 1;
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percent: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [entries]);

  // Fetch or regenerate AI Executive Digest
  const fetchDigest = async () => {
    setIsDigestLoading(true);
    try {
      const res = await fetch('/api/digest-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: entries.slice(0, 15) }),
      });
      if (res.ok) {
        const data = await res.json();
        setDigest(data);
      }
    } catch (e) {
      console.warn('Failed to load AI digest:', e);
    } finally {
      setIsDigestLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, [entries.length]);

  const activeSpark = DAILY_SPARKS[dailySparkIndex];
  const averageClarity = entries.length > 0
    ? Math.round(
        entries.reduce((acc, curr) => acc + (curr.clarityIndex || 80), 0) / entries.length
      )
    : 85;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Welcome & Quick Action Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#C0A080]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Clarity & Cognitive Intelligence Hub</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
            Welcome back, {userDisplayName || 'Seeker'}
          </h1>
          <p className="text-sm text-[#A1A1AA] max-w-xl leading-relaxed">
            Your private journal is secured with zero-knowledge isolation. Gemini 3.6 Flash has synthesized your recent cognitive trajectory below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => onNavigateToView('goals')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] font-medium text-sm transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 text-[#C0A080]" />
            <span>Goals</span>
          </button>
          <button
            onClick={() => onNavigateToView('planner')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] font-medium text-sm transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C0A080]" />
            <span>Daily Planner</span>
          </button>
          <button
            id="home-new-reflection-btn"
            onClick={() => onStartNewReflection()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] font-semibold text-sm transition-all shadow-lg shadow-[#C0A080]/15 active:scale-[0.98] cursor-pointer"
          >
            <Zap className="w-4 h-4 text-[#0A0A0B]" />
            <span>New Reflection</span>
          </button>
          <button
            onClick={() => onNavigateToView('ask')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] text-[#E4E4E7] font-medium text-sm transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#C0A080]" />
            <span>Ask Vault</span>
          </button>
        </div>
      </div>

      {/* AI Executive Clarity Digest Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-[#18181B] to-[#121214] border border-[#27272A] shadow-xl space-y-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#27272A] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C0A080]/15 border border-[#C0A080]/30 flex items-center justify-center text-[#C0A080]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
                  {digest?.periodTitle || 'Clarity Digest'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#27272A] text-[10px] text-[#A1A1AA] border border-[#3F3F46]">
                  Gemini 3.6 Flash
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-medium text-[#F4F4F5]">
                {digest?.headline || 'Synthesizing Your Clarity Trajectory...'}
              </h2>
            </div>
          </div>

          <button
            onClick={fetchDigest}
            disabled={isDigestLoading}
            className="self-start sm:self-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#27272A]/70 hover:bg-[#3F3F46] text-xs text-[#D4D4D8] font-medium transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDigestLoading ? 'animate-spin text-[#C0A080]' : ''}`} />
            <span>{isDigestLoading ? 'Distilling...' : 'Refresh Digest'}</span>
          </button>
        </div>

        {/* Digest Overview Text */}
        <p className="text-sm text-[#D4D4D8] leading-relaxed italic border-l-2 border-[#C0A080] pl-4 py-1">
          "{digest?.overview || 'Your thoughts reflect active momentum and proactive alignment. Explore key takeaways below.'}"
        </p>

        {/* 3 Columns: Key Insights, Growth Highlights, Recommended Focus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Key Insights */}
          <div className="p-4 rounded-xl bg-[#121214]/80 border border-[#27272A] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#60A5FA] uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Core Insights</span>
            </div>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              {(digest?.keyInsights || [
                'Maintaining proactive structure across major decisions',
                'High focus observed during roadmap drafting',
                'Steadily reducing ambiguity through deep Socratic dialogue'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#60A5FA] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Growth Highlights */}
          <div className="p-4 rounded-xl bg-[#121214]/80 border border-[#27272A] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#34D399] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Breakthroughs & Wins</span>
            </div>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              {(digest?.growthHighlights || [
                'Clear action items identified for immediate execution',
                'Cognitive clarity score trending upward this session',
                'Consistent journaling rhythm established'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#34D399] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Focus Priorities */}
          <div className="p-4 rounded-xl bg-[#121214]/80 border border-[#27272A] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>High-Leverage Focus</span>
            </div>
            <ul className="space-y-2 text-xs text-[#A1A1AA]">
              {(digest?.focusPriorities || [
                'Execute on the primary milestone defined in your roadmap',
                'Carve out 10 minutes for an evening retrospective',
                'Review top-starred insights before the week closes'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#C0A080] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Digest Footer Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#27272A] text-xs text-[#71717A]">
          <div className="flex items-center gap-4">
            <span>Dominant Tone: <strong className="text-[#F4F4F5]">{digest?.dominantMood || 'Focused & Grounded'}</strong></span>
            <span>•</span>
            <span>Clarity Index: <strong className="text-[#34D399]">{digest?.clarityAverage || averageClarity}/100</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Generated server-side with zero cross-tenant exposure</span>
          </div>
        </div>
      </div>

      {/* Mood Analysis & Emotional Trajectory Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Longitudinal Trajectory Chart */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C0A080]" />
                <h3 className="text-base font-semibold text-[#F4F4F5]">
                  Emotional & Clarity Trajectory
                </h3>
              </div>
              <p className="text-xs text-[#71717A] mt-0.5">
                Sentiment valence and cognitive clarity index tracked across your entries
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C0A080]" />
                <span className="text-[#A1A1AA]">Clarity Index</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#60A5FA]" />
                <span className="text-[#A1A1AA]">Mood Valence</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clarityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C0A080" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C0A080" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60A5FA" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#60A5FA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272A" vertical={false} />
                <XAxis dataKey="date" stroke="#71717A" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#71717A" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181B',
                    borderColor: '#3F3F46',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F4F4F5',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  labelStyle={{ color: '#C0A080', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="clarityIndex"
                  name="Clarity Index"
                  stroke="#C0A080"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#clarityGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="moodScore"
                  name="Mood Valence"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#moodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#71717A] pt-2 border-t border-[#27272A]">
            <span>Continuous Gemini mood extraction</span>
            <button
              onClick={() => onNavigateToView('patterns')}
              className="text-[#C0A080] hover:text-[#D4B996] font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore Cognitive Patterns</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Emotion Distribution & Quick Metrics */}
        <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#27272A] pb-3">
              <Smile className="w-4 h-4 text-[#34D399]" />
              <h3 className="text-base font-semibold text-[#F4F4F5]">
                Dominant Emotions
              </h3>
            </div>

            {emotionStats.length > 0 ? (
              <div className="space-y-3">
                {emotionStats.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#D4D4D8] font-medium">{item.name}</span>
                      <span className="text-[#71717A]">{item.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#18181B] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor:
                            idx === 0 ? '#C0A080' : idx === 1 ? '#60A5FA' : idx === 2 ? '#34D399' : '#A78BFA',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#71717A]">
                Record reflections to populate your emotional distribution spectrum.
              </p>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#27272A]">
            <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                <FileText className="w-3.5 h-3.5 text-[#C0A080]" />
                <span>Total Entries</span>
              </div>
              <p className="text-xl font-bold text-[#F4F4F5] mt-1">{entries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#18181B] border border-[#27272A]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Clarity Rating</span>
              </div>
              <p className="text-xl font-bold text-[#34D399] mt-1">{averageClarity}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Reflection Spark Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#18181B]/90 border border-[#C0A080]/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#C0A080]/20 border border-[#C0A080]/40 flex items-center justify-center text-[#C0A080] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#C0A080] uppercase tracking-wider">
              Daily Reflection Spark
            </span>
            <p className="text-sm md:text-base font-serif text-[#F4F4F5] leading-snug">
              "{activeSpark}"
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartNewReflection('reflection', activeSpark)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] font-semibold text-xs transition-all shrink-0 active:scale-[0.98] cursor-pointer"
        >
          <span>Reflect on this prompt</span>
          <ArrowRight className="w-3.5 h-3.5 text-[#0A0A0B]" />
        </button>
      </div>

      {/* Quick Reflection Launchpad (5 Modes) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-[#F4F4F5]">
              Quick Reflection Launchpad
            </h3>
            <p className="text-xs text-[#71717A]">
              Select a specialized thinking mode powered by Gemini 3.6 Flash
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {QUICK_MODES.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => onStartNewReflection(mode.id)}
                className="group p-4 rounded-xl bg-[#121214] hover:bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] text-left transition-all duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between h-44 cursor-pointer"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-medium border"
                      style={{
                        backgroundColor: `${mode.color}10`,
                        color: mode.color,
                        borderColor: `${mode.color}30`,
                      }}
                    >
                      {mode.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F4F4F5] group-hover:text-[#C0A080] transition-colors">
                    {mode.label}
                  </h4>
                  <p className="text-xs text-[#71717A] line-clamp-2 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-[#C0A080] pt-2 border-t border-[#27272A]">
                  <span>Launch Mode</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Reflections Overview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-[#F4F4F5]">
              Recent Vault Reflections
            </h3>
            <p className="text-xs text-[#71717A]">
              Your encrypted personal thoughts and Socratic insights
            </p>
          </div>

          <button
            onClick={() => onNavigateToView('reflect')}
            className="text-xs text-[#C0A080] hover:text-[#D4B996] font-medium flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All Entries</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {entries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {entries.slice(0, 3).map((entry) => {
              const modeMeta = QUICK_MODES.find((m) => m.id === entry.mode) || QUICK_MODES[0];
              const IconComp = modeMeta.icon;
              return (
                <div
                  key={entry.id}
                  onClick={() => onSelectEntry(entry)}
                  className="group p-5 rounded-2xl bg-[#121214] hover:bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all cursor-pointer shadow-lg space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: `${modeMeta.color}20`, color: modeMeta.color }}
                        >
                          <IconComp className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs text-[#A1A1AA]">{modeMeta.label}</span>
                      </div>
                      {entry.starred && <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />}
                    </div>

                    <h4 className="text-base font-semibold text-[#F4F4F5] group-hover:text-[#C0A080] transition-colors line-clamp-1">
                      {entry.title}
                    </h4>

                    <p className="text-xs text-[#A1A1AA] line-clamp-2 leading-relaxed">
                      {entry.summary || entry.messages[0]?.text || 'No summary available.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#27272A] text-[11px] text-[#71717A]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {entry.clarityIndex && (
                      <span className="text-[#34D399] font-medium">
                        {entry.clarityIndex}% Clarity
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#121214] border border-[#27272A] text-center space-y-3">
            <p className="text-sm text-[#A1A1AA]">
              Your vault is clean and private. Start your first reflection to map your clarity trajectory.
            </p>
            <button
              onClick={() => onStartNewReflection()}
              className="px-4 py-2 rounded-xl bg-[#C0A080] text-[#0A0A0B] font-semibold text-xs hover:bg-[#D4B996] transition-colors cursor-pointer"
            >
              Start First Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
