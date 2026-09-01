import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  Send,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  Clock,
  HelpCircle,
  FileText,
  RotateCcw,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { ReflectionEntry } from '../types';

interface AskVaultViewProps {
  entries: ReflectionEntry[];
  onSelectEntry: (entry: ReflectionEntry) => void;
  onNavigateToView: (view: 'home' | 'reflect' | 'ask' | 'patterns' | 'security' | 'admin') => void;
}

const SAMPLE_QUESTIONS = [
  'What were my top breakthroughs and insights across recent reflections?',
  'Summarize all high-priority action items I planned in my roadmaps.',
  'What recurring patterns or themes appear in my brainstorm sessions?',
  'How has my clarity or emotional trajectory shifted recently?',
];

export const AskVaultView: React.FC<AskVaultViewProps> = ({
  entries,
  onSelectEntry,
  onNavigateToView,
}) => {
  const [question, setQuestion] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [conversation, setConversation] = useState<
    Array<{ q: string; a: string; modelUsed?: string; timestamp: number }>
  >([]);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || isQuerying) return;

    setIsQuerying(true);
    try {
      const res = await fetch('/api/ask-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          entries: entries.slice(0, 20),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversation((prev) => [
          ...prev,
          {
            q,
            a: data.answer,
            modelUsed: data.modelUsed,
            timestamp: Date.now(),
          },
        ]);
        setQuestion('');
      } else {
        const err = await res.json();
        setConversation((prev) => [
          ...prev,
          {
            q,
            a: `⚠️ Could not complete query: ${err.error || 'Server error'}`,
            timestamp: Date.now(),
          },
        ]);
      }
    } catch (e: any) {
      setConversation((prev) => [
        ...prev,
        {
          q,
          a: `⚠️ Network error: ${e?.message || 'Could not reach server'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] shadow-2xl relative overflow-hidden space-y-3 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-[#A78BFA]" />
          <span>Grounded Conversational Retrieval • MindVault</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-[#F9FAFB]">
          Ask Vault
        </h1>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">
          Ask questions across your entire personal reflection history. Gemini retrieves relevant memories, synthesizes longitudinal trends, and cites your own thoughts securely.
        </p>
        <div className="flex items-center gap-2 text-xs text-[#6B7280] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Grounded strictly on {entries.length} private vault entries • Zero external hallucinations</span>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="p-4 md:p-6 rounded-2xl bg-[#11131C]/80 border border-[#8B5CF6]/20 shadow-2xl space-y-4 backdrop-blur-xl animate-gemini-aura">
        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            placeholder="Ask anything about your past reflections, goals, ideas, or mood shifts in your sanctuary..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#181A28] border border-white/[0.08] text-sm text-[#F3F4F6] placeholder-[#6B7280] focus:outline-none focus:border-[#8B5CF6] transition-colors resize-none"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#6B7280]">
              Press <kbd className="px-1 py-0.5 rounded bg-[#181A28] border border-white/[0.08] text-[10px]">Enter</kbd> to ask
            </span>
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || isQuerying}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-white text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 disabled:animate-none animate-sanctuary-breathe cursor-pointer"
            >
              {isQuerying ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-white" />
              )}
              <span>{isQuerying ? 'Retrieving Insights...' : 'Query Vault'}</span>
            </button>
          </div>
        </div>

        {/* Suggested Starter Questions */}
        <div className="space-y-2 pt-2 border-t border-white/[0.08]">
          <span className="text-[11px] text-[#9CA3AF] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-[#A78BFA]" />
            <span>Suggested Inquiries</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(sq)}
                disabled={isQuerying}
                className="px-3 py-1.5 rounded-lg bg-[#181A28] hover:bg-[#24283D] border border-white/[0.08] hover:border-[#8B5CF6]/30 text-xs text-[#E5E7EB] text-left transition-colors cursor-pointer"
              >
                "{sq}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conversation Thread */}
      {conversation.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272A] pb-2">
            <h3 className="text-sm font-semibold text-[#F4F4F5]">Retrieval Results</h3>
            <button
              onClick={() => setConversation([])}
              className="text-xs text-[#71717A] hover:text-[#A1A1AA] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Clear Queries</span>
            </button>
          </div>

          {conversation.map((turn, idx) => (
            <div key={idx} className="space-y-3">
              {/* Question Bubble */}
              <div className="p-4 rounded-xl bg-[#181A28] border border-white/[0.08] ml-8 space-y-1">
                <span className="text-[10px] text-[#A78BFA] uppercase font-bold">Your Query</span>
                <p className="text-sm font-medium text-[#F3F4F6]">{turn.q}</p>
              </div>

              {/* Answer Bubble */}
              <div className="p-6 rounded-2xl bg-[#11131C]/85 border border-[#8B5CF6]/20 shadow-xl space-y-3 mr-8 backdrop-blur-xl animate-gemini-aura">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-2 text-xs text-[#9CA3AF]">
                  <div className="flex items-center gap-2 text-[#C4B5FD]">
                    <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
                    <span className="font-semibold">Vault Grounded Synthesis</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#C4B5FD] px-1.5 py-0.5 rounded bg-[#181A28] border border-white/[0.08]">
                    {turn.modelUsed || 'Gemini 3.6 Flash'}
                  </span>
                </div>

                <div className="text-sm text-[#E5E7EB] leading-relaxed markdown-content">
                  <ReactMarkdown>{turn.a}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
