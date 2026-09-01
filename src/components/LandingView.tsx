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
  Compass,
  BookOpen
} from 'lucide-react';

interface LandingViewProps {
  onGoogleSignIn: () => Promise<void>;
  onGuestSignIn: (name?: string) => Promise<void>;
  isLoading: boolean;
  onOpenGuide?: () => void;
}

export const LandingView: React.FC<LandingViewProps> = ({
  onGoogleSignIn,
  onGuestSignIn,
  isLoading,
  onOpenGuide,
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
      setAuthError(err?.message || 'Sanctuary initialization encountered an issue.');
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between text-[#F3F4F6]">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 text-center">
        {/* Digital Sanctuary Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#181A28]/80 border border-[#8B5CF6]/30 text-[#C4B5FD] text-xs font-medium mb-8 shadow-lg shadow-[#8B5CF6]/10 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-[#A78BFA]" />
          <span>MindVault • Digital Sanctuary for Mindful Reflection</span>
        </div>

        {/* Large Brand Typography */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-normal tracking-tight text-[#F9FAFB] max-w-3xl mx-auto leading-[1.15]">
          Your thoughts. <span className="italic text-[#C4B5FD]">Your space.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-[#9CA3AF] max-w-2xl mx-auto font-normal leading-relaxed">
          A serene digital sanctuary for quiet contemplation, deep Socratic dialogues, and cognitive growth — completely private, isolated, and encrypted.
        </p>

        {onOpenGuide && (
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={onOpenGuide}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1E1B4B]/70 hover:bg-[#2D286B] border border-[#8B5CF6]/30 text-[#C4B5FD] hover:text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Explore User Guide & Features</span>
            </button>
          </div>
        )}

        {/* Auth CTA Box - Glass-like card with soft blue-violet glow and breathing aura */}
        <div className="mt-10 max-w-md mx-auto p-7 rounded-2xl bg-[#11131C]/85 border border-[#8B5CF6]/20 shadow-2xl backdrop-blur-xl space-y-4 animate-gemini-aura">
          {/* Primary Instant Access Button with Breathing Animation */}
          <button
            id="workspace-signin-btn"
            onClick={handleGuestSignIn}
            disabled={isLoading || isGuestLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C3AED] via-[#6366F1] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-white font-semibold text-base transition-all shadow-lg animate-sanctuary-breathe active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isGuestLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <KeyRound className="w-5 h-5 text-white" />
            )}
            <span>{isGuestLoading ? 'Entering Sanctuary...' : 'Enter Private Sanctuary'}</span>
          </button>

          {/* Optional Name Personalization */}
          {!showCustomNameInput ? (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowCustomNameInput(true)}
                className="text-xs text-[#9CA3AF] hover:text-[#C4B5FD] transition-colors underline underline-offset-2 cursor-pointer"
              >
                Personalize sanctuary name (optional)
              </button>
            </div>
          ) : (
            <div className="pt-1 flex gap-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Abilash"
                className="flex-1 px-3 py-1.5 rounded-lg bg-[#181A28] border border-white/[0.12] text-[#F3F4F6] text-xs focus:outline-none focus:border-[#8B5CF6]"
              />
              <button
                type="button"
                onClick={handleGuestSignIn}
                disabled={isGuestLoading}
                className="px-3 py-1.5 rounded-lg bg-[#24283D] hover:bg-[#313652] text-[#E5E7EB] text-xs font-medium cursor-pointer"
              >
                Set & Enter
              </button>
            </div>
          )}

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-white/[0.08]"></div>
            <span className="flex-shrink mx-3 text-[10px] text-[#6B7280] uppercase tracking-wider font-semibold">or Cloud OAuth</span>
            <div className="flex-grow border-t border-white/[0.08]"></div>
          </div>

          {/* Google Sign-in Button */}
          <button
            id="google-signin-btn"
            onClick={handleSignIn}
            disabled={isLoading || isGuestLoading}
            className="w-full flex items-center justify-center gap-3 px-5 py-2.5 rounded-xl bg-[#161826] hover:bg-[#1E2235] border border-white/[0.08] hover:border-white/[0.15] text-[#E5E7EB] font-medium text-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin" />
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
            <div className="mt-4 p-3.5 rounded-xl bg-[#2D1219] border border-[#7F1D1D] text-[#FDA4AF] text-xs text-left space-y-2">
              <p className="font-semibold text-[#FECDD3]">Authentication Notice:</p>
              <p className="leading-relaxed">{authError}</p>
              <div className="pt-2 border-t border-[#7F1D1D]/60 flex items-center justify-between gap-2">
                <span className="text-[11px] text-[#FDA4AF]/90">
                  Enter your isolated workspace directly:
                </span>
                <button
                  onClick={handleGuestSignIn}
                  className="px-2.5 py-1 rounded bg-[#8B5CF6] text-white font-semibold text-[11px] hover:bg-[#7C3AED] transition-colors cursor-pointer shrink-0"
                >
                  Enter Sanctuary →
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#9CA3AF]">
            <Lock className="w-3.5 h-3.5 text-[#34D399]" />
            <span>Zero-Knowledge Encryption • Zero Stored Passwords • Full Gemini 3.6 Flash</span>
          </div>
        </div>

        {/* Feature Grid - Digital Sanctuary Glass Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
          {/* Card 1 */}
          <div className="p-6 rounded-2xl bg-[#11131C]/60 border border-white/[0.07] hover:border-[#8B5CF6]/40 transition-all backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-[#1E1B4B] border border-[#8B5CF6]/30 flex items-center justify-center text-[#C4B5FD] mb-4 shadow-md shadow-[#8B5CF6]/10">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#F3F4F6] mb-2">Socratic Multi-Turn Dialogue</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Explore your thoughts with a respectful, intelligent companion that probes assumptions without judgment.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-2xl bg-[#11131C]/60 border border-white/[0.07] hover:border-[#8B5CF6]/40 transition-all backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-[#132822] border border-[#34D399]/30 flex items-center justify-center text-[#34D399] mb-4 shadow-md shadow-[#34D399]/10">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#F3F4F6] mb-2">User-Isolated Firestore Vault</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Every thought, goal, and memory is strictly owner-bound under your UID. Cross-tenant reads are cryptographically rejected.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-2xl bg-[#11131C]/60 border border-white/[0.07] hover:border-[#8B5CF6]/40 transition-all backdrop-blur-md">
            <div className="w-11 h-11 rounded-xl bg-[#241A38] border border-[#A78BFA]/30 flex items-center justify-center text-[#C4B5FD] mb-4 shadow-md shadow-[#8B5CF6]/10">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-medium text-[#F3F4F6] mb-2">5 Cognitive Frameworks</h3>
            <p className="text-sm text-[#9CA3AF] leading-relaxed">
              Seamlessly switch between Mindful Reflection, Creative Ideation, Action Roadmaps, Executive Summaries, and Deep Probes.
            </p>
          </div>
        </div>

        {/* Security & Architecture Highlights */}
        <div className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[#11131C]/90 via-[#161828]/90 to-[#11131C]/90 border border-white/[0.08] max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#141E1C] border border-[#34D399]/40 flex items-center justify-center text-[#34D399] shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Digital Sanctuary Security Hygiene</h4>
              <p className="text-xs text-[#9CA3AF]">
                Server-side Gemini proxying with resilient fallback ladder, Secret Manager encapsulation, and strict Firestore owner bounds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#D1D5DB] shrink-0">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#34D399]" /> OWASP Standard
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" /> Gemini Resilient Fallback
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-[#6B7280]">
        <p>MindVault • Your thoughts. Your space. • Powered by Gemini 3.6 Flash & Cloud Firestore</p>
      </footer>
    </div>
  );
};
