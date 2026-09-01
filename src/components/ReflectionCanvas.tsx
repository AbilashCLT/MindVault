import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Sparkles,
  Compass,
  Lightbulb,
  FileText,
  ListTodo,
  Microscope,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Tag,
  Clock,
  AlertCircle,
  Menu,
  ChevronDown,
  Mic,
  MicOff,
  Square,
  MapPin,
} from 'lucide-react';
import type { ReflectionEntry, ReflectionMode, ChatMessage, LocationData } from '../types';
import { LocationTagModal } from './LocationTagModal';

interface ReflectionCanvasProps {
  entry: ReflectionEntry;
  onUpdateEntry: (updated: ReflectionEntry) => Promise<void>;
  onSendMessage: (text: string, mode: ReflectionMode) => Promise<void>;
  isGenerating: boolean;
  activeModelName: string | null;
  saveStatus: 'saved' | 'saving' | 'error';
  lastError: string | null;
  onRetryLastAction: () => void;
  onToggleSidebarMobile: () => void;
}

const MODES: Array<{
  id: ReflectionMode;
  label: string;
  tagline: string;
  icon: any;
  accent: string;
  starterPrompts: string[];
}> = [
  {
    id: 'reflection',
    label: 'Mindful Reflection',
    tagline: 'Deep introspection, emotional clarity, and thoughtful Socratic inquiries',
    icon: Compass,
    accent: 'border-[#8B5CF6] text-[#C4B5FD] bg-[#8B5CF6]/15',
    starterPrompts: [
      "Today I felt challenged when...",
      "A pattern I noticed in my reactions this week is...",
      "What I'm truly grateful for right now is...",
      "I'm feeling conflicted about a decision regarding..."
    ]
  },
  {
    id: 'brainstorm',
    label: 'Idea Brainstorming',
    tagline: 'Creative divergence, unique perspectives, and innovative concepts',
    icon: Lightbulb,
    accent: 'border-[#6366F1] text-[#A5B4FC] bg-[#6366F1]/15',
    starterPrompts: [
      "I have an idea for a project that solves...",
      "How might we rethink the way people...",
      "Give me 5 unconventional approaches to...",
      "Brainstorm innovative angles for..."
    ]
  },
  {
    id: 'summary',
    label: 'Executive Summary',
    tagline: 'Synthesize core takeaways, milestones, and high-level themes',
    icon: FileText,
    accent: 'border-[#06B6D4] text-[#67E8F9] bg-[#06B6D4]/15',
    starterPrompts: [
      "Here is everything that happened in my day: ...",
      "Summarize my notes from today's key meetings: ...",
      "Extract the key themes and lessons from this experience: ...",
      "Synthesize this week's progress into top highlights: ..."
    ]
  },
  {
    id: 'action_plan',
    label: 'Action Roadmap',
    tagline: 'Concrete next steps, milestone priorities, and quick wins',
    icon: ListTodo,
    accent: 'border-[#10B981] text-[#6EE7B7] bg-[#10B981]/15',
    starterPrompts: [
      "I need a step-by-step roadmap to achieve...",
      "Help me break down this overwhelming project into 3 phases: ...",
      "What are the 80/20 highest leverage actions for...",
      "Prioritize my task list based on urgency and impact: ..."
    ]
  },
  {
    id: 'deep_dive',
    label: 'Deep Analytical Probe',
    tagline: 'First-principles breakdown, root causes, and challenging assumptions',
    icon: Microscope,
    accent: 'border-[#A855F7] text-[#D8B4FE] bg-[#A855F7]/15',
    starterPrompts: [
      "Deconstruct the root cause of why this issue keeps recurring: ...",
      "What hidden assumptions am I making about...",
      "Play devil's advocate against my plan to...",
      "Analyze the second and third-order consequences of..."
    ]
  }
];

// Mode-specific personalized status messages and companion titles
const MODE_METADATA: Record<
  ReflectionMode,
  {
    companionTitle: string;
    loadingMessages: string[];
  }
> = {
  reflection: {
    companionTitle: 'Mindful Reflection Partner',
    loadingMessages: [
      'Unpacking clarity and perspective for you...',
      'Connecting mindful insights to your thoughts...',
      'Reflecting deeply on your experience...'
    ],
  },
  brainstorm: {
    companionTitle: 'Creative Ideation Partner',
    loadingMessages: [
      'Expanding possibilities and connecting creative threads...',
      'Exploring innovative angles for your idea...',
      'Generating fresh concepts and perspectives...'
    ],
  },
  summary: {
    companionTitle: 'Executive Synthesis Partner',
    loadingMessages: [
      'Distilling core themes and key takeaways...',
      'Structuring highlights and executive milestones...',
      'Synthesizing essential clarity from your notes...'
    ],
  },
  action_plan: {
    companionTitle: 'Action Roadmap Architect',
    loadingMessages: [
      'Structuring actionable steps and milestone priorities...',
      'Mapping high-leverage next steps for you...',
      'Breaking down milestones into clear execution phases...'
    ],
  },
  deep_dive: {
    companionTitle: 'Analytical Probe Partner',
    loadingMessages: [
      'Examining underlying assumptions and patterns...',
      'Deconstructing root causes and second-order effects...',
      'Probing deeper layers of your reasoning...'
    ],
  },
};

export const ReflectionCanvas: React.FC<ReflectionCanvasProps> = ({
  entry,
  onUpdateEntry,
  onSendMessage,
  isGenerating,
  activeModelName,
  saveStatus,
  lastError,
  onRetryLastAction,
  onToggleSidebarMobile,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(entry.title);
  const [newTagInput, setNewTagInput] = useState('');
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [showLocationModal, setShowLocationModal] = useState(false);

  // Voice Note Recording (Web Speech API)
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const [voiceInterimText, setVoiceInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeModeConfig = MODES.find((m) => m.id === entry.mode) || MODES[0];
  const activeMeta = MODE_METADATA[entry.mode] || MODE_METADATA.reflection;

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechRecognitionSupported(true);
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      stopVoiceRecording();
    } else {
      startVoiceRecording();
    }
  };

  const startVoiceRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecordingVoice(true);
        setVoiceInterimText('');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setInputText((prev) => {
            const next = prev.trim() ? `${prev.trim()} ${finalTranscript.trim()}` : finalTranscript.trim();
            return next;
          });
          if (textareaRef.current) {
            setTimeout(() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
              }
            }, 50);
          }
        }

        setVoiceInterimText(interimTranscript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsRecordingVoice(false);
          setVoiceInterimText('');
        }
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
        setVoiceInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsRecordingVoice(false);
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
    setIsRecordingVoice(false);
    setVoiceInterimText('');
  };

  // Cycle personalized loading messages smoothly while generating
  useEffect(() => {
    if (!isGenerating) {
      setLoadingMessageIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % activeMeta.loadingMessages.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isGenerating, activeMeta.loadingMessages.length]);

  useEffect(() => {
    setTitleInput(entry.title);
  }, [entry.id, entry.title]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entry.messages, isGenerating]);

  // Adjust textarea height dynamically
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 240)}px`;
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isGenerating) return;
    const textToSend = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(textToSend, entry.mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleModeChange = async (newMode: ReflectionMode) => {
    if (newMode === entry.mode) return;
    await onUpdateEntry({
      ...entry,
      mode: newMode,
    });
  };

  const handleSaveTitle = async () => {
    setIsEditingTitle(false);
    if (titleInput.trim() && titleInput !== entry.title) {
      await onUpdateEntry({
        ...entry,
        title: titleInput.trim(),
      });
    }
  };

  const handleAddTag = async () => {
    if (!newTagInput.trim()) return;
    const cleanTag = newTagInput.trim().replace(/^#/, '');
    if (!entry.tags.includes(cleanTag)) {
      const updatedTags = [...entry.tags, cleanTag];
      setNewTagInput('');
      await onUpdateEntry({
        ...entry,
        tags: updatedTags,
      });
    }
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = entry.tags.filter((t) => t !== tagToRemove);
    await onUpdateEntry({
      ...entry,
      tags: updatedTags,
    });
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-transparent text-[#F3F4F6] overflow-hidden">
      {/* Top Action & Mode Toolbar */}
      <div className="bg-[#0B0D14]/85 backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 py-3 shrink-0">
        <div className="flex flex-col gap-3">
          {/* Upper row: Mobile toggle + Title + Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={onToggleSidebarMobile}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] bg-[#161826] border border-white/[0.08] lg:hidden shrink-0 cursor-pointer"
                title="Toggle Journal Vault"
              >
                <Menu className="w-5 h-5" />
              </button>

              {isEditingTitle ? (
                <div className="flex items-center gap-2 flex-1 max-w-md">
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    onBlur={handleSaveTitle}
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                    autoFocus
                    className="w-full px-2.5 py-1 rounded-lg bg-[#161826] border border-[#8B5CF6] text-sm font-semibold text-[#F3F4F6] focus:outline-none"
                  />
                  <button
                    onClick={handleSaveTitle}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#8B5CF6] text-white font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-center gap-2 cursor-pointer truncate"
                  title="Click to rename reflection"
                >
                  <h2 className="text-base sm:text-lg font-serif font-semibold text-[#F9FAFB] tracking-wide truncate">
                    {entry.title || 'Untitled Thought'}
                  </h2>
                  <span className="text-xs text-[#6B7280] group-hover:text-[#C4B5FD] transition-colors">
                    ✎
                  </span>
                </div>
              )}
            </div>

            {/* Sync Status Badge */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              {saveStatus === 'saving' && (
                <span className="flex items-center gap-1.5 text-[#FBBF24] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#FBBF24] animate-pulse" />
                  Saving to Vault...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1.5 text-[#34D399] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Persisted to Vault</span>
                </span>
              )}
              {saveStatus === 'error' && (
                <button
                  onClick={onRetryLastAction}
                  className="flex items-center gap-1 text-[#FB7185] hover:text-[#FDA4AF] underline font-medium cursor-pointer"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Save Error (Retry)</span>
                </button>
              )}
            </div>
          </div>

          {/* Mode Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = entry.mode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`mode-selector-${mode.id}`}
                  onClick={() => handleModeChange(mode.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap border cursor-pointer ${
                    isActive
                      ? mode.accent + ' shadow-md'
                      : 'bg-[#121420]/80 border-white/[0.06] text-[#9CA3AF] hover:text-[#F3F4F6] hover:border-white/[0.12]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mode Tagline & Tags */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#9CA3AF] pt-1 border-t border-white/[0.06]">
            <p className="italic text-[#9CA3AF] truncate max-w-lg">
              {activeModeConfig.tagline}
            </p>

            {/* Tag List & Location Tag */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Location Tag Pill */}
              {entry.location ? (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#1E1B4B] text-[#C4B5FD] border border-[#8B5CF6]/40 text-[11px] hover:bg-[#2D286B] transition-colors cursor-pointer"
                  title="Click to view or edit location"
                >
                  <MapPin className="w-3 h-3 text-[#A78BFA]" />
                  <span className="font-medium">{entry.location.placeName}</span>
                  {entry.location.city && <span className="text-[#9CA3AF]">({entry.location.city})</span>}
                </button>
              ) : (
                <button
                  onClick={() => setShowLocationModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161826] text-[#9CA3AF] hover:text-[#C4B5FD] border border-white/[0.08] hover:border-[#8B5CF6]/40 text-[11px] transition-colors cursor-pointer"
                  title="Tag location for this reflection"
                >
                  <MapPin className="w-3 h-3 text-[#8B5CF6]" />
                  <span>+ Location</span>
                </button>
              )}

              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#161826] text-[#D1D5DB] border border-white/[0.08] text-[11px]"
                >
                  #{tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-[#FB7185] ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="+ tag"
                  className="w-14 px-1.5 py-0.5 rounded bg-[#161826] border border-white/[0.08] text-[10px] text-[#D1D5DB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#8B5CF6] focus:w-20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conversation / Reflection Stream Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* If empty entry, show Welcome & Starter Prompts */}
        {entry.messages.length === 0 && (
          <div className="max-w-2xl mx-auto my-6 p-6 rounded-2xl bg-[#11131C]/75 border border-white/[0.08] text-center space-y-4 shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#1E1B4B] border border-[#8B5CF6]/40 text-[#C4B5FD] mx-auto flex items-center justify-center shadow-lg shadow-[#8B5CF6]/15">
              <Sparkles className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-serif font-semibold text-[#F9FAFB]">
                Start your {activeModeConfig.label}
              </h3>
              <p className="text-xs sm:text-sm text-[#9CA3AF] mt-1 max-w-md mx-auto">
                Type your thoughts freely below, or choose one of these guiding prompts to begin:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-left">
              {activeModeConfig.starterPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt);
                    textareaRef.current?.focus();
                  }}
                  className="p-3 rounded-xl bg-[#161826]/80 border border-white/[0.08] hover:border-[#8B5CF6]/50 hover:bg-[#1E2235] text-xs text-[#D1D5DB] hover:text-[#F3F4F6] transition-all text-left group flex items-start gap-2 cursor-pointer"
                >
                  <span className="text-[#A78BFA] group-hover:translate-x-0.5 transition-transform shrink-0 mt-0.5">
                    →
                  </span>
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Timeline */}
        {entry.messages.map((message) => {
          const isUser = message.sender === 'user';
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-3xl ${
                isUser ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {/* Sender label and details */}
              <div className="flex items-center gap-2 mb-1.5 px-1 text-[11px] text-[#6B7280]">
                {isUser ? (
                  <>
                    <span className="text-[#C4B5FD] font-medium">You</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-[#6B7280]" />
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-md bg-[#8B5CF6]/20 text-[#C4B5FD] flex items-center justify-center font-bold text-[10px]">
                      ✦
                    </div>
                    <span className="font-medium text-[#C4B5FD]">{activeMeta.companionTitle}</span>
                    <span className="px-1.5 py-0.2 rounded bg-[#161826] text-[10px] text-[#9CA3AF] border border-white/[0.08]">
                      {message.modelUsed || activeModelName || 'Gemini 3.6 Flash'}
                    </span>
                    <span>•</span>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </>
                )}
              </div>

              {/* Message Bubble with soft ambient glow on AI messages */}
              <div
                className={`relative group rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all shadow-md ${
                  isUser
                    ? 'bg-gradient-to-br from-[#1E1B4B]/90 to-[#181635]/90 border border-[#8B5CF6]/30 text-[#F9FAFB] rounded-tr-sm'
                    : 'bg-[#11131C]/85 border border-[#8B5CF6]/20 text-[#E5E7EB] rounded-tl-sm w-full shadow-xl backdrop-blur-md animate-gemini-aura'
                }`}
              >
                {isUser ? (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                ) : (
                  <div className="markdown-body space-y-3 text-[#E5E7EB]">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-serif font-semibold text-[#F9FAFB] mt-2 mb-1 border-b border-white/[0.08] pb-1">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-serif font-medium text-[#C4B5FD] mt-2 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs font-semibold text-[#F9FAFB] uppercase tracking-wider mt-1 mb-0.5">{children}</h3>,
                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-1 text-[#D1D5DB]">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-1 text-[#D1D5DB]">{children}</ol>,
                        li: ({ children }) => <li className="text-[#D1D5DB] text-xs sm:text-sm">{children}</li>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-2 border-[#8B5CF6] pl-3 py-1 my-2 italic text-[#9CA3AF] text-xs bg-[#161828]/50 rounded-r">
                            {children}
                          </blockquote>
                        ),
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-[#E5E7EB] leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-[#F9FAFB]">{children}</strong>,
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Floating copy button */}
                <button
                  onClick={() => handleCopyText(message.id, message.text)}
                  className={`absolute bottom-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${
                    isUser
                      ? 'bg-[#2A2450] hover:bg-[#382F66] text-[#C4B5FD]'
                      : 'bg-[#181A28] hover:bg-[#24283D] text-[#9CA3AF]'
                  }`}
                  title="Copy text"
                >
                  {copiedMessageId === message.id ? (
                    <Check className="w-3.5 h-3.5 text-[#34D399]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {/* Loading / Generating State */}
        {isGenerating && (
          <div className="flex flex-col items-start max-w-3xl mr-auto space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#A78BFA]">
              <Sparkles className="w-4 h-4 animate-spin text-[#A78BFA]" />
              <span className="font-medium tracking-wide transition-opacity duration-300">
                {activeMeta.loadingMessages[loadingMessageIndex]}
              </span>
            </div>
            <div className="w-full p-4 rounded-2xl bg-[#11131C]/75 border border-white/[0.08] rounded-tl-sm space-y-2 animate-pulse">
              <div className="h-3 bg-[#181A28] rounded w-3/4"></div>
              <div className="h-3 bg-[#181A28] rounded w-5/6"></div>
              <div className="h-3 bg-[#181A28] rounded w-1/2"></div>
            </div>
          </div>
        )}

        {/* Error Alert with Retry button */}
        {lastError && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-[#2D1219] border border-[#7F1D1D] text-[#FDA4AF] text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#FB7185] shrink-0" />
              <span>{lastError}</span>
            </div>
            <button
              onClick={onRetryLastAction}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-medium shrink-0 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer Box */}
      <div className="bg-[#0B0D14]/85 backdrop-blur-xl border-t border-white/[0.08] p-3 sm:p-4 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Live Voice Transcribing Indicator */}
          {isRecordingVoice && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#2D1219] border border-[#EF4444]/40 text-xs text-[#FCA5A5] animate-pulse">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
                <span className="font-medium text-white">Listening to voice note...</span>
                {voiceInterimText && (
                  <span className="italic text-[#E5E7EB] truncate max-w-xs sm:max-w-md">"{voiceInterimText}"</span>
                )}
              </div>
              <button
                onClick={stopVoiceRecording}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-semibold cursor-pointer"
              >
                <Square className="w-3 h-3" />
                <span>Done</span>
              </button>
            </div>
          )}

          {/* Textarea container */}
          <div className="relative rounded-2xl bg-[#131522] border border-white/[0.08] focus-within:border-[#8B5CF6] focus-within:ring-1 focus-within:ring-[#8B5CF6]/40 transition-all shadow-inner">
            <textarea
              id="reflection-composer-textarea"
              ref={textareaRef}
              value={inputText}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={`Write or speak your thoughts freely in this sanctuary... (Press Cmd/Ctrl + Enter to send)`}
              rows={2}
              className="w-full p-3.5 pr-24 text-sm text-[#F3F4F6] bg-transparent resize-none focus:outline-none placeholder:text-[#6B7280] max-h-60"
            />

            {/* Action Buttons Right Side: Mic + Send */}
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {/* Record Voice Note Button */}
              <button
                type="button"
                id="reflection-voice-btn"
                onClick={toggleVoiceRecording}
                className={`p-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer ${
                  isRecordingVoice
                    ? 'bg-[#EF4444] text-white animate-bounce shadow-[#EF4444]/30'
                    : 'bg-[#181A28] hover:bg-[#24283D] text-[#9CA3AF] hover:text-[#F3F4F6] border border-white/[0.08]'
                }`}
                title={isRecordingVoice ? 'Stop recording voice note' : 'Record voice note (Web Speech API)'}
              >
                {isRecordingVoice ? (
                  <Square className="w-4 h-4 text-white" />
                ) : (
                  <Mic className="w-4 h-4 text-[#A78BFA]" />
                )}
              </button>

              {/* Send Button */}
              <button
                id="reflection-send-btn"
                onClick={handleSend}
                disabled={!inputText.trim() || isGenerating}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-white disabled:opacity-30 transition-all shadow-md active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:animate-none animate-sanctuary-breathe"
                title="Send to Gemini (Cmd+Enter)"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Footer details: counts, voice state, shortcut, security note */}
          <div className="flex items-center justify-between px-2 text-[11px] text-[#6B7280]">
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span className="hidden sm:inline">Press <kbd className="px-1 py-0.5 rounded bg-[#161826] text-[#D1D5DB] border border-white/[0.08] font-mono text-[10px]">Cmd+Enter</kbd> to submit</span>
              {speechRecognitionSupported && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:flex items-center gap-1 text-[#C4B5FD]">
                    <Mic className="w-3 h-3" /> Voice transcription ready
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[#6B7280]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#34D399]" />
              <span>Isolated in Firestore under your UID</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Tagging Modal */}
      {showLocationModal && (
        <LocationTagModal
          currentLocation={entry.location}
          onSaveLocation={async (loc) => {
            await onUpdateEntry({
              ...entry,
              location: loc,
              updatedAt: Date.now(),
            });
          }}
          onClose={() => setShowLocationModal(false)}
        />
      )}
    </main>
  );
};
