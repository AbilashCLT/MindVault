import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Database,
  Trash2,
  AlertTriangle,
  Terminal,
} from 'lucide-react';
import type { UserProfile } from '../types';
import { forgetMePurgeAllData } from '../lib/firebase';

interface SecurityCenterProps {
  user: UserProfile | null;
  onDataPurged: () => void;
  isPrivateSession: boolean;
  onTogglePrivateSession: (enabled: boolean) => void;
}

export const SecurityCenter: React.FC<SecurityCenterProps> = ({
  user,
  onDataPurged,
  isPrivateSession,
  onTogglePrivateSession,
}) => {
  const [showForgetMeModal, setShowForgetMeModal] = useState(false);
  const [isPurging, setIsPurging] = useState(false);

  const handleForgetMe = async () => {
    if (!user?.uid) return;
    setIsPurging(true);
    try {
      await forgetMePurgeAllData(user.uid);
      setShowForgetMeModal(false);
      onDataPurged();
    } catch (e) {
      console.error('Forget me error:', e);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#34D399] uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <span>Zero-Trust Architecture & Threat Modeling Dashboard</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
          Zero-Trust Security Center
        </h1>
        <p className="text-sm text-[#A1A1AA] leading-relaxed">
          GeminiVault is engineered with zero-compromise security controls: owner-bound UID database path isolation, zero hardcoded secrets via Google Cloud Secret Manager, and GDPR Art. 17 right-to-erasure guarantees.
        </p>
      </div>

      {/* Private Session Switcher & Core Controls */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#C0A080]" />
              <h3 className="text-sm font-semibold text-[#F4F4F5]">
                Private Session Mode (Zero-Disk Ephemeral)
              </h3>
            </div>
            <p className="text-xs text-[#71717A]">
              When enabled, your reflections reside purely in ephemeral memory and are never written to Firestore or disk.
            </p>
          </div>

          <button
            onClick={() => onTogglePrivateSession(!isPrivateSession)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              isPrivateSession
                ? 'bg-[#34D399] text-[#0A0A0B] shadow-lg shadow-[#34D399]/20'
                : 'bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7]'
            }`}
          >
            {isPrivateSession ? '✓ Ephemeral Mode Active' : 'Enable Zero-Disk Mode'}
          </button>
        </div>
      </div>

      {/* 5 Threat Zones Defense Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080]">
            <Database className="w-4 h-4" />
            <span>UID Path Isolation</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Every document query enforces <code className="text-[#C0A080]">request.auth.uid == userId</code>. Cross-account snooping is mathematically prohibited.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#60A5FA]">
            <Key className="w-4 h-4" />
            <span>Zero-Hardcoding Hygiene</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Gemini API keys are managed dynamically server-side through Google Cloud Secret Manager. No keys are ever shipped to the browser.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#121214] border border-[#27272A] space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#A78BFA]">
            <Terminal className="w-4 h-4" />
            <span>Admin RBAC Gate</span>
          </div>
          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            Governance tools are locked specifically to <code className="text-[#C0A080]">abilashcalicut8@gmail.com</code> with server-verified claims.
          </p>
        </div>
      </div>

      {/* Interactive Security Attack Lab Notice -> Linked to Admin Console */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-[#C0A080]" />
            <h3 className="text-base font-semibold text-[#F4F4F5]">
              Live Exploit Simulation & Verification Lab
            </h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-[#C0A080]/15 text-[#D4B996] border border-[#C0A080]/30 text-xs font-semibold">
            Admin Managed
          </span>
        </div>
        <p className="text-xs text-[#A1A1AA] leading-relaxed">
          The interactive OWASP penetration attack lab (Cross-Tenant UID Injection, Role Claim Forgery, Indirect Prompt Injection, and NoSQL Sanitation probes) has been relocated to the <strong>Admin Console</strong> for unified governance and real-time security event telemetry.
        </p>
      </div>

      {/* "Forget Me" 1-Click Atomic Data Purge Section */}
      <div className="p-6 rounded-2xl bg-[#7F1D1D]/10 border border-[#7F1D1D]/40 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#FDA4AF] uppercase tracking-wider">
              <Trash2 className="w-4 h-4" />
              <span>Right to Erasure & Atomic Purge (GDPR Art. 17)</span>
            </div>
            <h3 className="text-base font-semibold text-[#F4F4F5]">
              "Forget Me" 1-Click Complete Vault Erasure
            </h3>
            <p className="text-xs text-[#A1A1AA] max-w-xl leading-relaxed">
              Instantly and irreversibly deletes all your private reflections, cached tokens, and analytical trajectories from Firestore and local storage.
            </p>
          </div>

          <button
            onClick={() => setShowForgetMeModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#7F1D1D] hover:bg-[#991B1B] text-[#FEE2E2] text-xs font-semibold transition-all shadow-lg active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge All My Data</span>
          </button>
        </div>
      </div>

      {/* Forget Me Confirmation Modal */}
      {showForgetMeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="max-w-md w-full p-6 rounded-2xl bg-[#121214] border border-[#7F1D1D] shadow-2xl space-y-4 animate-scaleUp">
            <div className="w-10 h-10 rounded-xl bg-[#7F1D1D]/30 border border-[#991B1B] text-[#FDA4AF] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[#F4F4F5]">
                Irreversible Data Erasure Confirmation
              </h3>
              <p className="text-xs text-[#A1A1AA] leading-relaxed">
                This will permanently delete all your stored reflections, multi-turn dialogues, AI summaries, and mood analytics. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#27272A]">
              <button
                onClick={() => setShowForgetMeModal(false)}
                disabled={isPurging}
                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-[#E4E4E7] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleForgetMe}
                disabled={isPurging}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isPurging ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>{isPurging ? 'Purging Everything...' : 'Yes, Permanently Purge'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
