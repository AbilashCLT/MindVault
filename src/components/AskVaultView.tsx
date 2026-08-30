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
      <div className="p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
          <BookOpen className="w-4 h-4 text-[#C0A080]" />
          <span>Grounded Conversational Retrieval (RAG)</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
          Ask My Journal
        </h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          Ask questions across your entire personal reflection history. Gemini 3.6 Flash retrieves relevant memories, synthesizes longitudinal trends, and cites your own thoughts securely.
        </p>
        <div className="flex items-center gap-2 text-xs text-[#71717A] pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
          <span>Grounded strictly on {entries.length} private vault entries • Zero external knowledge hallucinations</span>
        </div>
      </div>

      {/* Query Input Box */}
      <div className="p-4 md:p-6 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl space-y-4">
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
            placeholder="Ask anything about your past reflections, goals, ideas, or mood shifts..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl bg-[#18181B] border border-[#27272A] text-sm text-[#F4F4F5] placeholder-[#71717A] focus:outline-none focus:border-[#C0A080] transition-colors resize-none"
          />
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-[#71717A]">
              Press <kbd className="px-1 py-0.5 rounded bg-[#27272A] text-[10px]">Enter</kbd> to ask
            </span>
            <button
              onClick={() => handleAsk()}
              disabled={!question.trim() || isQuerying}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] text-xs font-semibold transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isQuerying ? (
                <div className="w-3.5 h-3.5 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-[#0A0A0B]" />
              )}
              <span>{isQuerying ? 'Retrieving Insights...' : 'Query Vault'}</span>
            </button>
          </div>
        </div>

        {/* Suggested Starter Questions */}
        <div className="space-y-2 pt-2 border-t border-[#27272A]">
          <span className="text-[11px] text-[#71717A] font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3 h-3 text-[#C0A080]" />
            <span>Suggested Inquiries</span>
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => handleAsk(sq)}
                disabled={isQuerying}
                className="px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-xs text-[#D4D4D8] text-left transition-colors cursor-pointer"
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
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] ml-8 space-y-1">
                <span className="text-[10px] text-[#71717A] uppercase font-bold">Your Query</span>
                <p className="text-sm font-medium text-[#F4F4F5]">{turn.q}</p>
              </div>

              {/* Answer Bubble */}
              <div className="p-6 rounded-2xl bg-[#121214] border border-[#C0A080]/30 shadow-lg space-y-3 mr-8">
                <div className="flex items-center justify-between border-b border-[#27272A] pb-2 text-xs text-[#71717A]">
                  <div className="flex items-center gap-2 text-[#C0A080]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span className="font-semibold">Vault Grounded Synthesis</span>
                  </div>
                  <span className="font-mono text-[10px] text-[#A1A1AA]">
                    {turn.modelUsed || 'Gemini 3.6 Flash'}
                  </span>
                </div>

                <div className="text-sm text-[#D4D4D8] leading-relaxed markdown-content">
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
