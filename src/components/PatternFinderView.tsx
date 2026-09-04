import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Brain,
  Sparkles,
  RefreshCw,
  Tag,
  ArrowUpRight,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import type { ReflectionEntry, PatternInsight } from '../types';

interface PatternFinderViewProps {
  entries: ReflectionEntry[];
  onSelectEntry: (entry: ReflectionEntry) => void;
  onStartNewReflection: (mode?: any, prompt?: string) => void;
  onAddSampleJournals?: () => void | Promise<void>;
}

export const PatternFinderView: React.FC<PatternFinderViewProps> = ({
  entries,
  onSelectEntry,
  onStartNewReflection,
  onAddSampleJournals,
}) => {
  const [patterns, setPatterns] = useState<PatternInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const analyzePatterns = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analyze-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries: entries.slice(0, 20) }),
      });
      if (res.ok) {
        const data = await res.json();
        setPatterns(data.patterns || []);
      }
    } catch (e) {
      console.warn('Pattern analysis error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    analyzePatterns();
  }, [entries.length]);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">
          <Brain className="w-4 h-4 text-[#A78BFA]" />
          <span>Longitudinal Behavioral & Cognitive Intelligence • MindVault</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-[#F9FAFB]">
          Pattern Sanctuary
        </h1>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          Gemini identifies recurring themes, cognitive habits, and emotional trajectories across your sanctuary reflections.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs text-[#6B7280]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Analyzing {entries.length} reflections securely</span>
          </div>
          <button
            onClick={analyzePatterns}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-[#C4B5FD] hover:text-[#DDD6FE] font-medium cursor-pointer disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Synthesizing...' : 'Re-analyze'}</span>
          </button>
        </div>
      </div>

      {/* Pattern Cards Grid */}
      <div className="space-y-4">
        {patterns.length > 0 ? (
          patterns.map((pat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] shadow-xl space-y-4 hover:border-[#8B5CF6]/30 transition-all backdrop-blur-xl animate-gemini-aura"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/15 text-[#C4B5FD] flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#F9FAFB]">
                      {pat.theme}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <span>Observed across reflections</span>
                      <span>•</span>
                      <span className="text-[#34D399] font-medium capitalize">
                        {pat.sentimentTrend} trajectory
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {(pat.associatedModes || ['reflection']).map((m, mIdx) => (
                    <span
                      key={mIdx}
                      className="px-2 py-0.5 rounded-full bg-[#181A28] border border-white/[0.08] text-[10px] text-[#A78BFA] capitalize"
                    >
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#E5E7EB] leading-relaxed">
                {pat.description}
              </p>

              <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[11px] text-[#6B7280]">Cognitive Trajectory Insight</span>
                <button
                  onClick={() =>
                    onStartNewReflection(
                      'deep_dive',
                      `Let's explore the cognitive pattern '${pat.theme}' that has been recurring in my reflections: ${pat.description}`
                    )
                  }
                  className="flex items-center gap-1 text-xs text-[#C4B5FD] hover:text-[#DDD6FE] font-semibold transition-colors cursor-pointer"
                >
                  <span>Deep Probe this Pattern</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] text-center space-y-4 backdrop-blur-xl">
            <p className="text-sm text-[#9CA3AF] max-w-md mx-auto">
              Capture at least 2 reflections or load sample data to generate longitudinal cognitive patterns.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => onStartNewReflection()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#8B5CF6] text-white font-semibold text-xs transition-all shadow-md animate-sanctuary-breathe cursor-pointer"
              >
                Start New Thought
              </button>
              {onAddSampleJournals && (
                <button
                  onClick={onAddSampleJournals}
                  className="px-4 py-2 rounded-xl bg-[#1E1B4B]/80 hover:bg-[#2D286B] border border-[#F59E0B]/40 text-[#FDE68A] hover:text-white font-semibold text-xs transition-colors cursor-pointer shadow-md shadow-[#F59E0B]/10 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Load Sample Journals</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
