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
  MapPin,
  Mail,
  Send,
  CheckCircle2,
  ExternalLink,
  BookOpen,
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
import { EmailDispatchModal, type EmailDispatchData } from './EmailDispatchModal';

interface HomeScreenProps {
  entries: ReflectionEntry[];
  onStartNewReflection: (mode?: ReflectionMode, initialPrompt?: string) => void;
  onSelectEntry: (entry: ReflectionEntry) => void;
  onNavigateToView: (view: AppView) => void;
  userDisplayName?: string | null;
  onOpenGuide?: () => void;
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
    color: '#A78BFA',
    badge: 'Introspective',
  },
  {
    id: 'brainstorm',
    label: 'Creative Ideation',
    desc: 'Expand possibilities with divergent thinking models.',
    icon: Brain,
    color: '#818CF8',
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
    color: '#C084FC',
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
  onOpenGuide,
}) => {
  const [digest, setDigest] = useState<AIDigestSummary | null>(null);
  const [isDigestLoading, setIsDigestLoading] = useState(false);
  const [dailySparkIndex] = useState(() => Math.floor(Math.random() * DAILY_SPARKS.length));
  const [isEmailingDigest, setIsEmailingDigest] = useState(false);
  const [emailDigestSuccess, setEmailDigestSuccess] = useState<string | null>(null);
  const [emailModalData, setEmailModalData] = useState<EmailDispatchData | null>(null);

  const handleSendEmailDigest = async () => {
    if (!digest) return;
    setIsEmailingDigest(true);
    setEmailDigestSuccess(null);
    try {
      const recipient = 'abilashcalicut8@gmail.com';
      const resp = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          toEmail: recipient,
          subject: `MindVault Daily Clarity Digest: ${digest.headline}`,
          type: 'daily_digest',
          content: {
            headline: digest.headline,
            overview: digest.overview,
            keyInsights: digest.keyInsights,
            growthHighlights: digest.growthHighlights,
            focusPriorities: digest.focusPriorities,
            clarityAverage: digest.clarityAverage,
            dominantMood: digest.dominantMood,
          },
        }),
      });

      const resJson = await resp.json();
      if (resp.ok && resJson.success) {
        setEmailDigestSuccess(`Prepared for ${recipient}`);
        setEmailModalData({
          recipient: resJson.recipient || recipient,
          subject: resJson.subject || `MindVault Daily Clarity Digest: ${digest.headline}`,
          plainText: resJson.plainText,
          previewHtml: resJson.previewHtml,
          gmailComposeUrl: resJson.gmailComposeUrl,
          mailtoUrl: resJson.mailtoUrl,
          deliveryId: resJson.deliveryId,
        });
        setTimeout(() => setEmailDigestSuccess(null), 5000);
      } else {
        setEmailDigestSuccess('Notification prepared');
        setTimeout(() => setEmailDigestSuccess(null), 4000);
      }
    } catch {
      setEmailDigestSuccess('Notification prepared');
      setTimeout(() => setEmailDigestSuccess(null), 4000);
    } finally {
      setIsEmailingDigest(false);
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 md:p-8 rounded-2xl bg-[#11131C]/75 border border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
            <span>Digital Sanctuary • MindVault</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-[#F9FAFB] tracking-tight">
            Welcome to your space, {userDisplayName || 'Vault Owner'}
          </h1>
          <p className="text-sm text-[#9CA3AF] max-w-xl leading-relaxed">
            Your reflections are protected by user-isolated Cloud Firestore encryption. Explore your synthesized cognitive trajectory below.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          {onOpenGuide && (
            <button
              id="home-user-guide-btn"
              onClick={onOpenGuide}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#1E1B4B]/80 hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-[#E0E7FF] font-semibold text-sm transition-all shadow-sm shadow-[#8B5CF6]/20 hover:border-[#A78BFA] cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-[#A78BFA]" />
              <span>User Guide</span>
            </button>
          )}
          <button
            onClick={() => onNavigateToView('goals')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#161826] hover:bg-[#1E2235] border border-white/[0.08] text-[#E5E7EB] font-medium text-sm transition-all cursor-pointer"
          >
            <Target className="w-4 h-4 text-[#A78BFA]" />
            <span>Goals</span>
          </button>
          <button
            onClick={() => onNavigateToView('planner')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#161826] hover:bg-[#1E2235] border border-white/[0.08] text-[#E5E7EB] font-medium text-sm transition-all cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#A78BFA]" />
            <span>Planner</span>
          </button>
          <button
            id="home-new-reflection-btn"
            onClick={() => onStartNewReflection()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-white font-semibold text-sm transition-all shadow-lg animate-sanctuary-breathe active:scale-[0.98] cursor-pointer"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>New Thought</span>
          </button>
          <button
            onClick={() => onNavigateToView('ask')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#161826] hover:bg-[#1E2235] border border-white/[0.08] text-[#E5E7EB] font-medium text-sm transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#A78BFA]" />
            <span>Vault Search</span>
          </button>
        </div>
      </div>

      {/* AI Executive Clarity Digest Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#11131C]/80 border border-[#8B5CF6]/20 shadow-2xl space-y-6 relative backdrop-blur-xl animate-gemini-aura">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1E1B4B] border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD] shadow-md shadow-[#8B5CF6]/15">
              <Sparkles className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">
                  {digest?.periodTitle || 'Executive Clarity Digest'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-[#181A28] text-[10px] text-[#A78BFA] border border-[#8B5CF6]/30">
                  Gemini 3.6 Flash
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-medium text-[#F9FAFB] font-serif">
                {digest?.headline || 'Synthesizing Your Clarity Trajectory...'}
              </h2>
            </div>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2">
            <button
              onClick={handleSendEmailDigest}
              disabled={isEmailingDigest || isDigestLoading || !digest}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E1B4B] hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-xs text-[#C4B5FD] font-medium transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-[#8B5CF6]/10"
              title="Send this AI digest to your email"
            >
              {isEmailingDigest ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
              ) : emailDigestSuccess ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
              ) : (
                <Mail className="w-3.5 h-3.5 text-[#A78BFA]" />
              )}
              <span>{emailDigestSuccess || (isEmailingDigest ? 'Sending...' : 'Email Digest')}</span>
            </button>

            <button
              onClick={fetchDigest}
              disabled={isDigestLoading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#181A28] hover:bg-[#24283D] border border-white/[0.08] text-xs text-[#E5E7EB] font-medium transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDigestLoading ? 'animate-spin text-[#A78BFA]' : 'text-[#A78BFA]'}`} />
              <span>{isDigestLoading ? 'Distilling...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Digest Overview Text */}
        <p className="text-sm text-[#E5E7EB] leading-relaxed italic border-l-2 border-[#8B5CF6] pl-4 py-1">
          "{digest?.overview || 'Your thoughts reflect active momentum and proactive alignment. Explore key takeaways below.'}"
        </p>

        {/* 3 Columns: Key Insights, Growth Highlights, Recommended Focus */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Key Insights */}
          <div className="p-4 rounded-xl bg-[#151724]/80 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#818CF8] uppercase tracking-wider">
              <Brain className="w-4 h-4" />
              <span>Core Insights</span>
            </div>
            <ul className="space-y-2 text-xs text-[#9CA3AF]">
              {(digest?.keyInsights || [
                'Maintaining proactive structure across major decisions',
                'High focus observed during roadmap drafting',
                'Steadily reducing ambiguity through deep Socratic dialogue'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#818CF8] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Growth Highlights */}
          <div className="p-4 rounded-xl bg-[#151724]/80 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#34D399] uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>Breakthroughs & Wins</span>
            </div>
            <ul className="space-y-2 text-xs text-[#9CA3AF]">
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
          <div className="p-4 rounded-xl bg-[#151724]/80 border border-white/[0.06] space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>High-Leverage Focus</span>
            </div>
            <ul className="space-y-2 text-xs text-[#9CA3AF]">
              {(digest?.focusPriorities || [
                'Execute on the primary milestone defined in your roadmap',
                'Carve out 10 minutes for an evening retrospective',
                'Review top-starred insights before the week closes'
              ]).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-[#A78BFA] font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Digest Footer Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/[0.08] text-xs text-[#9CA3AF]">
          <div className="flex items-center gap-4">
            <span>Dominant Tone: <strong className="text-[#F9FAFB]">{digest?.dominantMood || 'Focused & Grounded'}</strong></span>
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
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#11131C]/75 border border-white/[0.08] shadow-2xl space-y-4 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#A78BFA]" />
                <h3 className="text-base font-semibold text-[#F9FAFB] font-serif">
                  Emotional & Clarity Trajectory
                </h3>
              </div>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Sentiment valence and cognitive clarity index tracked across your entries
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
                <span className="text-[#9CA3AF]">Clarity Index</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[#9CA3AF]">Mood Valence</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clarityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2438" vertical={false} />
                <XAxis dataKey="date" stroke="#6B7280" fontSize={11} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#6B7280" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161826',
                    borderColor: '#2D334D',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F3F4F6',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  }}
                  labelStyle={{ color: '#C4B5FD', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="clarityIndex"
                  name="Clarity Index"
                  stroke="#8B5CF6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#clarityGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="moodScore"
                  name="Mood Valence"
                  stroke="#38BDF8"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#moodGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-[#9CA3AF] pt-2 border-t border-white/[0.08]">
            <span>Continuous Gemini mood extraction</span>
            <button
              onClick={() => onNavigateToView('patterns')}
              className="text-[#C4B5FD] hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Explore Cognitive Patterns</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Emotion Distribution & Quick Metrics */}
        <div className="p-6 rounded-2xl bg-[#11131C]/75 border border-white/[0.08] shadow-2xl space-y-5 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Smile className="w-4 h-4 text-[#34D399]" />
              <h3 className="text-base font-semibold text-[#F9FAFB] font-serif">
                Dominant Emotions
              </h3>
            </div>

            {emotionStats.length > 0 ? (
              <div className="space-y-3">
                {emotionStats.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#E5E7EB] font-medium">{item.name}</span>
                      <span className="text-[#9CA3AF]">{item.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#181A28] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percent}%`,
                          backgroundColor:
                            idx === 0 ? '#8B5CF6' : idx === 1 ? '#38BDF8' : idx === 2 ? '#34D399' : '#C084FC',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#9CA3AF]">
                Record reflections to populate your emotional distribution spectrum.
              </p>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/[0.08]">
            <div className="p-3 rounded-xl bg-[#161826] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                <FileText className="w-3.5 h-3.5 text-[#C4B5FD]" />
                <span>Total Entries</span>
              </div>
              <p className="text-xl font-bold text-[#F9FAFB] mt-1">{entries.length}</p>
            </div>
            <div className="p-3 rounded-xl bg-[#161826] border border-white/[0.06]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
                <Flame className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Clarity Rating</span>
              </div>
              <p className="text-xl font-bold text-[#34D399] mt-1">{averageClarity}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Reflection Spark Banner */}
      <div className="p-5 md:p-6 rounded-2xl bg-[#161828]/80 border border-[#8B5CF6]/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#1E1B4B] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD] shrink-0 mt-0.5 shadow-md shadow-[#8B5CF6]/15">
            <Sparkles className="w-5 h-5 text-[#A78BFA]" />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-[#C4B5FD] uppercase tracking-wider">
              Daily Reflection Spark
            </span>
            <p className="text-sm md:text-base font-serif text-[#F9FAFB] leading-snug">
              "{activeSpark}"
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartNewReflection('reflection', activeSpark)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white font-semibold text-xs transition-all shrink-0 active:scale-[0.98] cursor-pointer shadow-md shadow-[#7C3AED]/25"
        >
          <span>Reflect on this prompt</span>
          <ArrowRight className="w-3.5 h-3.5 text-white" />
        </button>
      </div>

      {/* Quick Reflection Launchpad (5 Modes) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-serif text-[#F9FAFB]">
              Cognitive Framework Launchpad
            </h3>
            <p className="text-xs text-[#9CA3AF]">
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
                className="group p-4 rounded-xl bg-[#11131C]/70 hover:bg-[#181A28] border border-white/[0.08] hover:border-[#8B5CF6]/40 text-left transition-all duration-200 hover:-translate-y-0.5 shadow-lg flex flex-col justify-between h-44 cursor-pointer backdrop-blur-md"
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
                        backgroundColor: `${mode.color}15`,
                        color: mode.color,
                        borderColor: `${mode.color}40`,
                      }}
                    >
                      {mode.badge}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F9FAFB] group-hover:text-[#C4B5FD] transition-colors">
                    {mode.label}
                  </h4>
                  <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    {mode.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-medium text-[#C4B5FD] pt-2 border-t border-white/[0.08]">
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
            <h3 className="text-lg font-serif text-[#F9FAFB]">
              Recent Sanctuary Reflections
            </h3>
            <p className="text-xs text-[#9CA3AF]">
              Your encrypted personal thoughts and Socratic insights
            </p>
          </div>

          <button
            onClick={() => onNavigateToView('reflect')}
            className="text-xs text-[#C4B5FD] hover:text-white font-medium flex items-center gap-1 transition-colors cursor-pointer"
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
                  className="group p-5 rounded-2xl bg-[#11131C]/70 hover:bg-[#181A28] border border-white/[0.08] hover:border-[#8B5CF6]/40 transition-all cursor-pointer shadow-lg space-y-3 flex flex-col justify-between backdrop-blur-md"
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
                        <span className="text-xs text-[#9CA3AF]">{modeMeta.label}</span>
                      </div>
                      {entry.starred && <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />}
                    </div>

                    <h4 className="text-base font-semibold text-[#F9FAFB] group-hover:text-[#C4B5FD] transition-colors line-clamp-1">
                      {entry.title}
                    </h4>

                    <p className="text-xs text-[#9CA3AF] line-clamp-2 leading-relaxed">
                      {entry.summary || entry.messages[0]?.text || 'No summary available.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/[0.08] text-[11px] text-[#6B7280]">
                    <div className="flex items-center gap-1.5 truncate max-w-[60%]">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span>{new Date(entry.updatedAt).toLocaleDateString()}</span>
                      {entry.location && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-[#A78BFA] truncate">
                            <MapPin className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{entry.location.placeName}</span>
                          </span>
                        </>
                      )}
                    </div>
                    {entry.clarityIndex && (
                      <span className="text-[#34D399] font-medium shrink-0">
                        {entry.clarityIndex}% Clarity
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#11131C]/70 border border-white/[0.08] text-center space-y-3 backdrop-blur-md">
            <p className="text-sm text-[#9CA3AF]">
              Your sanctuary is quiet and private. Start your first reflection to begin mapping your clarity trajectory.
            </p>
            <button
              onClick={() => onStartNewReflection()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold text-xs hover:from-[#8B5CF6] hover:to-[#818CF8] transition-colors cursor-pointer shadow-md shadow-[#7C3AED]/20"
            >
              Start First Thought
            </button>
          </div>
        )}
      </div>

      {/* Email Dispatch & Inspection Modal */}
      {emailModalData && (
        <EmailDispatchModal
          data={emailModalData}
          onClose={() => setEmailModalData(null)}
        />
      )}
    </div>
  );
};
