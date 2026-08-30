import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  User,
  Lock,
  Download,
  Trash2,
  Bell,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  EyeOff,
  Flame,
  FileJson,
  Volume2,
  VolumeX,
  Palette,
  Compass,
} from 'lucide-react';
import type { UserProfile, UserSettings, ReflectionMode } from '../types';
import { forgetMePurgeAllData, isUserAdmin } from '../lib/firebase';

interface SettingsPrivacyViewProps {
  user: UserProfile | null;
  settings: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
  isPrivateSession: boolean;
  onTogglePrivateSession: (enabled: boolean) => void;
  onDataPurged: () => void;
  onExportAllData: () => void;
  onSignOut: () => void;
}

export const SettingsPrivacyView: React.FC<SettingsPrivacyViewProps> = ({
  user,
  settings,
  onSaveSettings,
  isPrivateSession,
  onTogglePrivateSession,
  onDataPurged,
  onExportAllData,
  onSignOut,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'account'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInputText, setPurgeInputText] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  const isAdmin = isUserAdmin(user);

  const handleUpdate = async (updates: Partial<UserSettings>) => {
    setIsSaving(true);
    setSaveSuccessMessage(null);
    try {
      await onSaveSettings(updates);
      setSaveSuccessMessage('Settings updated successfully.');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Failed to update settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExecutePurge = async () => {
    if (!user?.uid || purgeInputText.trim().toLowerCase() !== 'delete all my data') return;
    setIsPurging(true);
    try {
      await forgetMePurgeAllData(user.uid);
      setShowPurgeModal(false);
      onDataPurged();
    } catch (e) {
      console.error('Error during purge:', e);
    } finally {
      setIsPurging(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-[#121214] border border-[#27272A] shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C0A080] uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5" />
              <span>Preferences & Vault Governance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#F4F4F5]">
              Settings & Privacy
            </h1>
            <p className="text-xs md:text-sm text-[#A1A1AA] max-w-xl">
              Configure your AI reflection companion, personal privacy boundaries, data isolation, and export backups.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-[#18181B] p-1 rounded-xl border border-[#27272A] self-start md:self-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General & AI</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy & Security</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-[#27272A]'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Account</span>
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {saveSuccessMessage && (
          <div className="mt-4 flex items-center gap-2 p-2.5 rounded-xl bg-[#064E3B]/40 border border-[#059669]/50 text-xs text-[#34D399] animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* TAB 1: General & AI Persona */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* AI Persona Tone */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C0A080]" />
              <h2 className="text-base font-semibold text-[#F4F4F5]">AI Reflection Companion Style</h2>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Select the conversational depth and perspective Gemini adopts during your reflections.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {[
                {
                  id: 'socratic_inquisitive',
                  title: 'Socratic & Inquisitive',
                  description: 'Challenges assumptions gently with sharp open-ended questions to reveal root motivations.',
                  tag: 'Recommended',
                },
                {
                  id: 'gentle_empathetic',
                  title: 'Gentle & Empathetic',
                  description: 'Prioritizes psychological safety, emotional validation, and compassionate active listening.',
                  tag: 'Supportive',
                },
                {
                  id: 'structured_analytical',
                  title: 'Structured & Analytical',
                  description: 'Breaks complex dilemmas down into first principles, frameworks, and prioritized decision trees.',
                  tag: 'Strategic',
                },
                {
                  id: 'philosophical_stoic',
                  title: 'Philosophical & Stoic',
                  description: 'Draws on classic Stoic and cognitive models to foster resilience and perspective shift.',
                  tag: 'Reflective',
                },
              ].map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => handleUpdate({ aiPersonaTone: persona.id as any })}
                  className={`p-4 rounded-xl border transition-all cursor-pointer text-left relative ${
                    settings.aiPersonaTone === persona.id
                      ? 'bg-[#1C1A17] border-[#C0A080] shadow-md shadow-[#C0A080]/10 ring-1 ring-[#C0A080]/40'
                      : 'bg-[#18181B] border-[#27272A] hover:border-[#3F3F46]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#F4F4F5]">{persona.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#27272A] text-[#C0A080] font-mono">
                      {persona.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">{persona.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Default Mode & Depth Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C0A080]" />
                <h3 className="text-sm font-semibold text-[#F4F4F5]">Default Starting Mode</h3>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                The default cognitive workflow loaded when you click "New Thought".
              </p>

              <select
                value={settings.defaultMode}
                onChange={(e) => handleUpdate({ defaultMode: e.target.value as ReflectionMode })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#18181B] border border-[#27272A] text-[#F4F4F5] text-xs focus:outline-none focus:border-[#C0A080] cursor-pointer"
              >
                <option value="reflection">Reflective Exploration (Socratic)</option>
                <option value="brainstorm">Divergent Brainstorming</option>
                <option value="summary">Structured Executive Summary</option>
                <option value="action_plan">Action Blueprint & Milestones</option>
                <option value="deep_dive">Analytical Root-Cause Deep Dive</option>
              </select>
            </div>

            <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#C0A080]" />
                <h3 className="text-sm font-semibold text-[#F4F4F5]">Reflection Response Depth</h3>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Controls the length and conciseness of Gemini's feedback.
              </p>

              <div className="flex items-center gap-2">
                {[
                  { id: 'concise', label: 'Concise (1-2 paragraphs)' },
                  { id: 'balanced', label: 'Balanced (Standard)' },
                  { id: 'deep_dive', label: 'Deep Dive (Exhaustive)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUpdate({ reflectionLengthPreference: item.id as any })}
                    className={`flex-1 py-2 px-2 text-center rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                      settings.reflectionLengthPreference === item.id
                        ? 'bg-[#C0A080] text-[#0A0A0B] font-semibold border-[#C0A080]'
                        : 'bg-[#18181B] text-[#A1A1AA] border-[#27272A] hover:bg-[#27272A]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Reminder & Theme */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#C0A080]" />
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">Daily Calibration Reminder</h3>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableDailyReminders}
                  onChange={(e) => handleUpdate({ enableDailyReminders: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C0A080] focus:ring-[#C0A080] bg-[#18181B] border-[#27272A] cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Receive an evening prompt to synthesize learnings and align tomorrow's priorities.
              </p>
              {settings.enableDailyReminders && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[#71717A]">Preferred Time:</span>
                  <input
                    type="time"
                    value={settings.reminderTime || '20:00'}
                    onChange={(e) => handleUpdate({ reminderTime: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-[#18181B] border border-[#27272A] text-xs text-[#F4F4F5] focus:outline-none focus:border-[#C0A080]"
                  />
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#C0A080]" />
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">Aesthetic Theme</h3>
                </div>
                <span className="text-[10px] text-[#C0A080] font-mono">Dark Canvas</span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Optimized with warm neutrals to minimize optical eye fatigue during nightly journaling.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'dark_warm', label: 'Warm Bronze', color: '#C0A080' },
                  { id: 'dark_minimal', label: 'Pure Obsidian', color: '#71717A' },
                  { id: 'slate_refined', label: 'Refined Slate', color: '#60A5FA' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleUpdate({ themePreference: t.id as any })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.themePreference === t.id
                        ? 'bg-[#1C1A17] border-[#C0A080] text-[#F4F4F5]'
                        : 'bg-[#18181B] border-[#27272A] text-[#71717A] hover:bg-[#27272A]'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="truncate">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Privacy & Security */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Zero-Disk Private Session Switcher */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">
                    Private Session Mode (Zero-Disk Ephemeral)
                  </h3>
                </div>
                <p className="text-xs text-[#A1A1AA] max-w-xl">
                  When enabled, all current thoughts and Gemini interactions exist exclusively in volatile browser memory. Nothing is written to Cloud Firestore or local storage.
                </p>
              </div>

              <button
                onClick={() => onTogglePrivateSession(!isPrivateSession)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isPrivateSession
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-[#059669]/20'
                    : 'bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7]'
                }`}
              >
                {isPrivateSession ? 'Active (Zero-Disk)' : 'Enable Private Mode'}
              </button>
            </div>
          </div>

          {/* AI Privacy & Memory Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-[#C0A080]" />
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">Client-Side PII Anonymizer</h3>
                </div>
                <input
                  type="checkbox"
                  checked={settings.anonymizePIIInAI}
                  onChange={(e) => handleUpdate({ anonymizePIIInAI: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C0A080] focus:ring-[#C0A080] bg-[#18181B] border-[#27272A] cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Automatically scrubs email addresses, phone numbers, and identity strings before submitting prompts to Gemini models.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#C0A080]" />
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">Include AI Memories in Context</h3>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeMemoryInPrompts}
                  onChange={(e) => handleUpdate({ includeMemoryInPrompts: e.target.checked })}
                  className="w-4 h-4 rounded text-[#C0A080] focus:ring-[#C0A080] bg-[#18181B] border-[#27272A] cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Allows Gemini to reference your active learned core values and preferences stored in your AI Memory tab for tailored reflections.
              </p>
            </div>
          </div>

          {/* Data Portability & Nuclear Purge */}
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C0A080]" />
              <h3 className="text-sm font-semibold text-[#F4F4F5]">Data Ownership & Portability</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Export Full Backup */}
              <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#C0A080]" />
                  <h4 className="text-xs font-semibold text-[#F4F4F5]">Export Complete Vault Backup</h4>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  Download a structured JSON archive containing all your reflection entries, chat messages, goals, daily plans, and AI memories.
                </p>
                <button
                  onClick={onExportAllData}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-xs font-medium transition-all cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-[#C0A080]" />
                  <span>Download JSON Archive</span>
                </button>
              </div>

              {/* GDPR Atomic Purge */}
              <div className="p-4 rounded-xl bg-[#2A1418]/40 border border-[#FB7185]/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-[#FB7185]" />
                  <h4 className="text-xs font-semibold text-[#FB7185]">Nuclear Purge (Right to be Forgotten)</h4>
                </div>
                <p className="text-xs text-[#FCA5A5]/80">
                  Permanently erases all Firestore collections (/entries, /goals, /daily_plans, /ai_memories, /settings) and resets local cache.
                </p>
                <button
                  onClick={() => setShowPurgeModal(true)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#FB7185]/20 hover:bg-[#FB7185]/30 text-[#FB7185] border border-[#FB7185]/40 text-xs font-semibold transition-all cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Purge All Vault Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Account & Session */}
      {activeTab === 'account' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#121214] border border-[#27272A] space-y-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#C0A080]" />
              <h2 className="text-base font-semibold text-[#F4F4F5]">Account Identity & Access</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full ring-2 ring-[#C0A080]/50 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#27272A] flex items-center justify-center text-[#A1A1AA]">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">
                    {user?.displayName || 'Vault Owner'}
                  </h3>
                  {isAdmin && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 font-mono">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A1A1AA]">{user?.email || 'Anonymous Guest'}</p>
                <p className="text-[10px] text-[#71717A] font-mono">UID: {user?.uid || 'guest_local'}</p>
              </div>

              <button
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#FB7185]/20 hover:text-[#FB7185] border border-[#3F3F46] text-xs font-medium transition-all cursor-pointer"
              >
                Sign Out Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Nuclear Purge */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#121214] border border-[#FB7185]/50 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#FB7185]">
              <div className="w-10 h-10 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#FB7185]" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#F4F4F5]">Confirm Complete Data Purge</h3>
                <p className="text-xs text-[#FB7185]">This action is irreversible and permanent.</p>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              To proceed with wiping all reflections, goals, daily plans, AI memory entries, and preferences from Cloud Firestore and local storage, type{' '}
              <strong className="text-[#F4F4F5] select-all font-mono">delete all my data</strong> below:
            </p>

            <input
              type="text"
              value={purgeInputText}
              onChange={(e) => setPurgeInputText(e.target.value)}
              placeholder="Type 'delete all my data'"
              className="w-full px-3.5 py-2 rounded-xl bg-[#18181B] border border-[#FB7185]/40 text-xs text-[#F4F4F5] focus:outline-none focus:border-[#FB7185]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPurgeModal(false);
                  setPurgeInputText('');
                }}
                className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#E4E4E7] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purgeInputText.trim().toLowerCase() !== 'delete all my data' || isPurging}
                onClick={handleExecutePurge}
                className="px-4 py-2 rounded-xl bg-[#FB7185] hover:bg-[#F43F5E] text-[#0A0A0B] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isPurging ? 'Purging Everything...' : 'Permanently Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
