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
}

export const PatternFinderView: React.FC<PatternFinderViewProps> = ({
  entries,
  onSelectEntry,
  onStartNewReflection,
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
      <div className="p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
          <Brain className="w-4 h-4 text-[#C0A080]" />
          <span>Longitudinal Behavioral & Cognitive Intelligence</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
          Personal Pattern Finder
        </h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          Gemini 3.6 Flash identifies recurring themes, cognitive habits, and emotional trajectories across your journal history.
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-xs text-[#71717A]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Analyzing {entries.length} reflections securely</span>
          </div>
          <button
            onClick={analyzePatterns}
            disabled={isLoading}
            className="flex items-center gap-1.5 text-[#C0A080] hover:text-[#D4B996] font-medium cursor-pointer disabled:opacity-50"
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
              className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] shadow-lg space-y-4 hover:border-[#3F3F46] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#27272A] pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#C0A080]/15 text-[#C0A080] flex items-center justify-center font-bold text-xs">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-[#F4F4F5]">
                      {pat.theme}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#71717A]">
                      <span>Observed across entries</span>
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
                      className="px-2 py-0.5 rounded-full bg-[#18181B] border border-[#27272A] text-[10px] text-[#A1A1AA] capitalize"
                    >
                      {m.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#D4D4D8] leading-relaxed">
                {pat.description}
              </p>

              <div className="pt-2 border-t border-[#27272A] flex items-center justify-between">
                <span className="text-[11px] text-[#71717A]">Cognitive Trajectory Insight</span>
                <button
                  onClick={() =>
                    onStartNewReflection(
                      'deep_dive',
                      `Let's explore the cognitive pattern '${pat.theme}' that has been recurring in my reflections: ${pat.description}`
                    )
                  }
                  className="flex items-center gap-1 text-xs text-[#C0A080] hover:text-[#D4B996] font-semibold transition-colors cursor-pointer"
                >
                  <span>Deep Probe this Pattern</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 rounded-2xl bg-[#121214] border border-[#27272A] text-center space-y-3">
            <p className="text-sm text-[#A1A1AA]">
              Capture at least 2 reflections to generate longitudinal cognitive patterns.
            </p>
            <button
              onClick={() => onStartNewReflection()}
              className="px-4 py-2 rounded-xl bg-[#C0A080] text-[#0A0A0B] font-semibold text-xs hover:bg-[#D4B996] transition-colors cursor-pointer"
            >
              Start New Reflection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
