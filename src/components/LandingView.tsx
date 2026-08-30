import React, { useState } from 'react';
import {
  Sparkles,
  Shield,
  Lock,
  MessageSquareQuote,
  Lightbulb,
  CheckCircle2,
  BrainCircuit,
  ArrowRight,
  Database,
  KeyRound,
  Compass
} from 'lucide-react';

interface LandingViewProps {
  onGoogleSignIn: () => Promise<void>;
  onGuestSignIn: (name?: string) => Promise<void>;
  isLoading: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGoogleSignIn,
  onGuestSignIn,
  isLoading,
}) => {
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [showCustomNameInput, setShowCustomNameInput] = useState(false);

  const handleSignIn = async () => {
    try {
      setAuthError(null);
      await onGoogleSignIn();
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.message?.includes('popup-closed-by-user')
      ) {
        // User closed or dismissed the popup (often after encountering 403 on Google's consent screen)
        setAuthError('Google Sign-In was closed. If you encountered "Error 403: restricted_client" on Google\'s screen, use Private Workspace Access below to enter immediately.');
        return;
      }
      setAuthError(err?.message || 'Authentication encountered an issue. Please try again.');
    }
  };

  const handleGuestSignIn = async () => {
    try {
      setAuthError(null);
      setIsGuestLoading(true);
      await onGuestSignIn(customName.trim() || undefined);
    } catch (err: any) {
      setAuthError(err?.message || 'Workspace initialization encountered an issue.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#0A0A0B] text-[#F4F4F5]">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center">
        {/* Top pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181614] border border-[#C0A080]/30 text-[#D4B996] text-xs font-medium mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#C0A080]" />
          <span>Powered by Gemini 3.6 Flash & Cloud Firestore</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-[#F4F4F5] max-w-3xl mx-auto leading-tight">
          Your Private Journal & Guided Reflection Sanctuary
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-[#A1A1AA] max-w-2xl mx-auto font-normal leading-relaxed">
          Express your thoughts freely and engage in multi-turn dialogues with Gemini. All reflections are securely isolated and persisted in your private Cloud Firestore vault.
        </p>

        {/* Auth CTA Box */}
        <div className="mt-10 max-w-md mx-auto p-6 rounded-2xl bg-[#121214] border border-[#27272A] shadow-2xl backdrop-blur-xl space-y-3.5">
          {/* Primary Instant Access Button */}
          <button
            id="workspace-signin-btn"
            onClick={handleGuestSignIn}
            disabled={isLoading || isGuestLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-[#C0A080] hover:bg-[#D4B996] text-[#0A0A0B] font-semibold text-base transition-all shadow-lg shadow-[#C0A080]/15 hover:shadow-[#C0A080]/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGuestLoading ? (
              <div className="w-5 h-5 border-2 border-[#0A0A0B] border-t-transparent rounded-full animate-spin" />
            ) : (
              <KeyRound className="w-5 h-5 text-[#0A0A0B]" />
            )}
            <span>{isGuestLoading ? 'Initializing Private Workspace...' : 'Enter Private Workspace'}</span>
          </button>

          {/* Optional Name Personalization */}
          {!showCustomNameInput ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowCustomNameInput(true)}
                className="text-xs text-[#A1A1AA] hover:text-[#C0A080] transition-colors underline underline-offset-2 cursor-pointer"
              >
                Personalize workspace name (optional)
              </button>
            </div>
          ) : (
            <div className="pt-1 flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Abilash"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#3F3F46] text-[#F4F4F5] text-xs focus:outline-none focus:border-[#C0A080]"
              />
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={isGuestLoading}
                className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-xs font-medium cursor-pointer"
              >
                Set & Enter
              </button>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#27272A]"></div>
            <span className="flex-shrink mx-3 text-[10px] text-[#71717A] uppercase tracking-wider font-semibold">or Cloud OAuth</span>
            <div className="flex-grow border-t border-[#27272A]"></div>
          </div>

          {/* Google Sign-in Button */}
          <button
            id="google-signin-btn"
            onClick={handleSignIn}
            disabled={isLoading || isGuestLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-[#E4E4E7] font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#C0A080] border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.02 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>{isLoading ? 'Connecting to Google...' : 'Sign In with Google'}</span>
          </button>

          {authError && (
            <div className="mt-4 p-3.5 rounded-xl bg-[#2A1418] border border-[#7F1D1D] text-[#FDA4AF] text-xs text-left space-y-2">
              <p className="font-semibold text-[#FECDD3]">Authentication Notice:</p>
              <p className="leading-relaxed">{authError}</p>
              <div className="pt-2 border-t border-[#7F1D1D]/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#FDA4AF]/90">
                  Enter your isolated workspace directly:
                </span>
                <button
                  onClick={handleGuestSignIn}
                  className="px-2.5 py-1 rounded bg-[#C0A080] text-[#0A0A0B] font-semibold text-[11px] hover:bg-[#D4B996] transition-colors cursor-pointer shrink-0"
                >
                  Enter Workspace →
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#A1A1AA]">
            <Lock className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Encrypted Vault • Zero Stored Passwords • Full Gemini 3.6 Flash</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] hover:border-[#C0A080]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#1C1814] border border-[#C0A080]/30 flex items-center justify-center text-[#C0A080] mb-4">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#F4F4F5] mb-2 font-serif">Multi-Turn Gemini Dialogue</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Have intelligent, empathetic conversations about your daily reflections, plans, emotional challenges, or brainstorming goals.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] hover:border-[#C0A080]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#141E1C] border border-[#34D399]/30 flex items-center justify-center text-[#34D399] mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#F4F4F5] mb-2 font-serif">User-Isolated Firestore</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Every journal entry is securely stored under your authenticated UID. Security rules prevent cross-tenant reads and unauthorized writes.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] hover:border-[#C0A080]/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#1C1814] border border-[#D4B996]/30 flex items-center justify-center text-[#D4B996] mb-4">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-[#F4F4F5] mb-2 font-serif">5 Specialized Modes</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              Switch seamlessly between Socratic Inquiries, Creative Brainstorms, Executive Summaries, Action Roadmaps, and Analytical Deep-Dives.
            </p>
          </div>
        </div>

        {/* Security & Architecture Highlights */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#121214] via-[#161412] to-[#121214] border border-[#27272A] max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#141E1C] border border-[#34D399]/40 flex items-center justify-center text-[#34D399] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F4F4F5]">Enterprise Security Hygiene</h4>
              <p className="text-xs text-[#A1A1AA]">
                Server-side API proxying with fallback ladder, Secret Manager key encapsulation, and strict Firestore owner bounds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#D4D4D8] shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" /> OWASP Mitigations
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#C0A080]" /> Resilient AI Fallback
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#27272A] py-6 text-center text-xs text-[#71717A]">
        <p>Lumina Vault • Mindful Reflection & Cognitive Synthesis Sanctuary • Powered by Gemini 3.6 Flash & Cloud Firestore</p>
      </footer>
    </div>
  );
};
