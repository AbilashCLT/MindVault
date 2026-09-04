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
  Mail,
  Send,
  Loader2,
  Check,
  ExternalLink,
  Eye,
} from 'lucide-react';
import type { UserProfile, UserSettings, ReflectionMode } from '../types';
import { forgetMePurgeAllData, isUserAdmin } from '../lib/firebase';
import { EmailDispatchModal, type EmailDispatchData } from './EmailDispatchModal';

interface SettingsPrivacyViewProps {
  user: UserProfile | null;
  settings: UserSettings;
  onSaveSettings: (settings: Partial<UserSettings>) => Promise<void>;
  isPrivateSession: boolean;
  onTogglePrivateSession: (enabled: boolean) => void;
  onDataPurged: () => void;
  onExportAllData: () => void;
  onSignOut: () => void;
  onAddSampleJournals?: () => void | Promise<void>;
  isAddingSamples?: boolean;
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
  onAddSampleJournals,
  isAddingSamples,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'privacy' | 'account'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeInputText, setPurgeInputText] = useState('');
  const [isPurging, setIsPurging] = useState(false);

  // Email Notification Test State
  const [testEmailSending, setTestEmailSending] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{
    success: boolean;
    message: string;
    previewHtml?: string;
    plainText?: string;
    gmailComposeUrl?: string;
    mailtoUrl?: string;
    deliveryId?: string;
    recipient?: string;
    subject?: string;
  } | null>(null);
  const [activeEmailModalData, setActiveEmailModalData] = useState<EmailDispatchData | null>(null);

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

  const handleSendTestEmail = async () => {
    const targetEmail = settings.notificationEmail || user?.email || 'abilashcalicut8@gmail.com';
    if (!targetEmail) {
      setTestEmailResult({ success: false, message: 'Please enter a valid notification email address first.' });
      return;
    }

    setTestEmailSending(true);
    setTestEmailResult(null);

    try {
      const res = await fetch('/api/notifications/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: targetEmail,
          toEmail: targetEmail,
          subject: 'MindVault Sanctuary: Daily Clarity Digest & System Calibration',
          type: 'digest',
          userName: user?.displayName || 'Vault Member',
          content: {
            headline: 'Executive Clarity Digest & Cognitive Trajectory',
            overview: 'Your reflections demonstrate high intentionality and structured focus across your active milestones.',
            keyInsights: [
              'Deepened self-awareness through Socratic inquiry and multi-turn dialogue',
              'Consistent calibration on key growth goals with zero data leakage',
              'Physical context tagged to enrich retrospective discovery',
            ],
            growthHighlights: [
              'Achieved 88% average clarity index across weekly reflection cycles',
              'Maintained zero-disk confidentiality during sensitive deconstruction sessions',
            ],
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestEmailResult({
          success: true,
          message: `Digest notification prepared for ${data.recipient}. Delivery ID: ${data.deliveryId}`,
          previewHtml: data.previewHtml,
          plainText: data.plainText,
          gmailComposeUrl: data.gmailComposeUrl,
          mailtoUrl: data.mailtoUrl,
          deliveryId: data.deliveryId,
          recipient: data.recipient,
          subject: data.subject,
        });
      } else {
        setTestEmailResult({
          success: false,
          message: data.error || 'Failed to dispatch email notification.',
        });
      }
    } catch (err: any) {
      setTestEmailResult({
        success: false,
        message: err?.message || 'Network error while contacting notification dispatcher.',
      });
    } finally {
      setTestEmailSending(false);
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
      <div className="p-6 md:p-8 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C4B5FD] uppercase tracking-wider">
              <Settings className="w-3.5 h-3.5 text-[#A78BFA]" />
              <span>Preferences & Vault Governance</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif text-[#F9FAFB]">
              Settings & Privacy
            </h1>
            <p className="text-xs md:text-sm text-[#9CA3AF] max-w-xl">
              Configure your AI reflection companion, external email notifications, personal privacy boundaries, and data isolation.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-[#161826] p-1 rounded-xl border border-white/[0.08] self-start md:self-auto flex-wrap">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold shadow-md shadow-[#8B5CF6]/20'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1E2235]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>General & AI</span>
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'notifications'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold shadow-md shadow-[#8B5CF6]/20'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1E2235]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold shadow-md shadow-[#8B5CF6]/20'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1E2235]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Privacy & Security</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold shadow-md shadow-[#8B5CF6]/20'
                  : 'text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-[#1E2235]'
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
          <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <h2 className="text-base font-semibold text-[#F9FAFB]">AI Reflection Companion Style</h2>
            </div>
            <p className="text-xs text-[#9CA3AF]">
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
                      ? 'bg-[#1E1B4B]/60 border-[#8B5CF6] shadow-md shadow-[#8B5CF6]/10 ring-1 ring-[#8B5CF6]/40'
                      : 'bg-[#161826] border-white/[0.08] hover:border-white/[0.18]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#F9FAFB]">{persona.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E2235] text-[#C4B5FD] font-mono border border-white/[0.04]">
                      {persona.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] leading-relaxed">{persona.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Default Mode & Depth Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#A78BFA]" />
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Default Starting Mode</h3>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                The default cognitive workflow loaded when you click "New Thought".
              </p>

              <select
                value={settings.defaultMode}
                onChange={(e) => handleUpdate({ defaultMode: e.target.value as ReflectionMode })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#161826] border border-white/[0.08] text-[#F9FAFB] text-xs focus:outline-none focus:border-[#8B5CF6] cursor-pointer"
              >
                <option value="reflection">Reflective Exploration (Socratic)</option>
                <option value="brainstorm">Divergent Brainstorming</option>
                <option value="summary">Structured Executive Summary</option>
                <option value="action_plan">Action Blueprint & Milestones</option>
                <option value="deep_dive">Analytical Root-Cause Deep Dive</option>
              </select>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#A78BFA]" />
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Reflection Response Depth</h3>
              </div>
              <p className="text-xs text-[#9CA3AF]">
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
                        ? 'bg-gradient-to-r from-[#7C3AED] to-[#6366F1] text-white font-semibold border-transparent shadow-md shadow-[#8B5CF6]/20'
                        : 'bg-[#161826] text-[#9CA3AF] border-white/[0.08] hover:bg-[#1E2235] hover:text-[#F9FAFB]'
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
            <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#A78BFA]" />
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Daily Calibration Reminder</h3>
                </div>
                <input
                  type="checkbox"
                  checked={settings.enableDailyReminders}
                  onChange={(e) => handleUpdate({ enableDailyReminders: e.target.checked })}
                  className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6] bg-[#161826] border-white/[0.08] cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Receive an evening prompt to synthesize learnings and align tomorrow's priorities.
              </p>
              {settings.enableDailyReminders && (
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-[#6B7280]">Preferred Time:</span>
                  <input
                    type="time"
                    value={settings.reminderTime || '20:00'}
                    onChange={(e) => handleUpdate({ reminderTime: e.target.value })}
                    className="px-3 py-1.5 rounded-lg bg-[#161826] border border-white/[0.08] text-xs text-[#F9FAFB] focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-[#A78BFA]" />
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Aesthetic Theme</h3>
                </div>
                <span className="text-[10px] text-[#A78BFA] font-mono">Digital Sanctuary</span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Deep charcoal midnight backdrop with soft violet accents for tranquil, distraction-free journaling.
              </p>
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { id: 'dark_warm', label: 'Sanctuary Violet', color: '#8B5CF6' },
                  { id: 'dark_minimal', label: 'Pure Obsidian', color: '#6B7280' },
                  { id: 'slate_refined', label: 'Refined Slate', color: '#6366F1' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleUpdate({ themePreference: t.id as any })}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      settings.themePreference === t.id
                        ? 'bg-[#1E1B4B] border-[#8B5CF6] text-[#F9FAFB] shadow-sm'
                        : 'bg-[#161826] border-white/[0.08] text-[#6B7280] hover:bg-[#1E2235]'
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

      {/* TAB 2: Email Notifications (Ideathon Extension) */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Notification Recipient Card */}
          <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#A78BFA]" />
                <h3 className="text-sm font-semibold text-[#F9FAFB]">Email Delivery Destination</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#10B981]/20 text-[#34D399] border border-[#10B981]/40 font-mono">
                Email Dispatcher Ready
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF]">
              MindVault dispatches structured, encrypted AI summaries and milestone reflections directly to your inbox.
            </p>

            <div className="space-y-3 pt-2">
              <label className="block text-xs font-medium text-[#E5E7EB]">
                Recipient Email Address
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="email"
                  value={settings.notificationEmail !== undefined ? settings.notificationEmail : (user?.email || '')}
                  onChange={(e) => handleUpdate({ notificationEmail: e.target.value })}
                  placeholder="your.email@example.com"
                  className="flex-1 px-3.5 py-2 rounded-xl bg-[#161826] border border-white/[0.08] text-xs text-[#F9FAFB] placeholder:text-[#6B7280] focus:outline-none focus:border-[#8B5CF6]"
                />
                <button
                  onClick={handleSendTestEmail}
                  disabled={testEmailSending}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#1E1B4B] hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-semibold transition-all disabled:opacity-50 cursor-pointer shrink-0 shadow-md shadow-[#8B5CF6]/10"
                >
                  {testEmailSending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#A78BFA]" />
                      <span>Dispatching Test...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#A78BFA]" />
                      <span>Send Test Digest Email</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-[#6B7280]">
                Defaults to your authenticated account email ({user?.email || 'abilashcalicut8@gmail.com'}) if not explicitly overridden.
              </p>
            </div>

            {/* Test Email Result Banner */}
            {testEmailResult && (
              <div
                className={`p-4 rounded-xl border text-xs flex flex-col gap-3 animate-fadeIn ${
                  testEmailResult.success
                    ? 'bg-[#064E3B]/30 border-[#059669]/50 text-[#34D399]'
                    : 'bg-[#2A1418]/40 border-[#FB7185]/40 text-[#FB7185]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    {testEmailResult.success ? (
                      <Check className="w-4 h-4 shrink-0 text-[#34D399]" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 text-[#FB7185]" />
                    )}
                    <span className="font-medium text-[#F3F4F6]">{testEmailResult.message}</span>
                  </div>

                  {testEmailResult.success && (
                    <div className="flex items-center gap-2">
                      {testEmailResult.gmailComposeUrl && (
                        <a
                          href={testEmailResult.gmailComposeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#EA4335]/20 hover:bg-[#EA4335]/30 border border-[#EA4335]/40 text-[#FFA494] text-xs font-semibold transition-all shadow-sm"
                        >
                          <ExternalLink className="w-3 h-3 text-[#FF7D66]" />
                          <span>Open in Gmail</span>
                        </a>
                      )}
                      <button
                        onClick={() =>
                          setActiveEmailModalData({
                            recipient: testEmailResult.recipient || settings.notificationEmail || user?.email || 'abilashcalicut8@gmail.com',
                            subject: testEmailResult.subject || 'MindVault Sanctuary Digest',
                            plainText: testEmailResult.plainText,
                            previewHtml: testEmailResult.previewHtml,
                            gmailComposeUrl: testEmailResult.gmailComposeUrl,
                            mailtoUrl: testEmailResult.mailtoUrl,
                            deliveryId: testEmailResult.deliveryId,
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1E1B4B] hover:bg-[#2D286B] border border-[#8B5CF6]/40 text-[#C4B5FD] text-xs font-medium transition-all cursor-pointer"
                      >
                        <Eye className="w-3 h-3 text-[#A78BFA]" />
                        <span>Inspect & Copy</span>
                      </button>
                    </div>
                  )}
                </div>

                {testEmailResult.previewHtml && (
                  <details className="mt-1 pt-2 border-t border-white/[0.08] cursor-pointer">
                    <summary className="text-[11px] text-[#A78BFA] hover:text-[#C4B5FD]">
                      View Delivered HTML Template Preview
                    </summary>
                    <div className="mt-2 p-3 rounded-lg bg-[#0B0D14] border border-white/[0.08] max-h-48 overflow-y-auto text-[10px] text-[#9CA3AF] font-mono">
                      {testEmailResult.previewHtml}
                    </div>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Email Notification Trigger Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-3 backdrop-blur-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                    <h4 className="text-xs font-semibold text-[#F9FAFB]">Daily Clarity Digest</h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableEmailDigest ?? true}
                    onChange={(e) => handleUpdate({ enableEmailDigest: e.target.checked })}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6] bg-[#161826] border-white/[0.08] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Receive an automated executive overview of your daily reflections and key insights every evening.
                </p>
              </div>
              <span className="text-[10px] text-[#6B7280]">Daily at {settings.reminderTime || '20:00'}</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-3 backdrop-blur-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-[#34D399]" />
                    <h4 className="text-xs font-semibold text-[#F9FAFB]">Breakthrough Alerts</h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableBreakthroughAlerts ?? true}
                    onChange={(e) => handleUpdate({ enableBreakthroughAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6] bg-[#161826] border-white/[0.08] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Instant email delivery whenever Gemini synthesizes a high-clarity breakthrough or root-cause discovery.
                </p>
              </div>
              <span className="text-[10px] text-[#34D399]">Real-time triggers</span>
            </div>

            <div className="p-5 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-3 backdrop-blur-xl flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#818CF8]" />
                    <h4 className="text-xs font-semibold text-[#F9FAFB]">Goal Milestone Updates</h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableGoalMilestoneAlerts ?? true}
                    onChange={(e) => handleUpdate({ enableGoalMilestoneAlerts: e.target.checked })}
                    className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6] bg-[#161826] border-white/[0.08] cursor-pointer"
                  />
                </div>
                <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                  Summary email when strategic milestones or daily planner action items are marked complete.
                </p>
              </div>
              <span className="text-[10px] text-[#818CF8]">Milestone completion</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Privacy & Security */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          {/* Zero-Disk Private Session Switcher */}
          <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#34D399]" />
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">
                    Private Session Mode (Zero-Disk Ephemeral)
                  </h3>
                </div>
                <p className="text-xs text-[#9CA3AF] max-w-xl">
                  When enabled, all current thoughts and Gemini interactions exist exclusively in volatile browser memory. Nothing is written to Cloud Firestore or local storage.
                </p>
              </div>

              <button
                onClick={() => onTogglePrivateSession(!isPrivateSession)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  isPrivateSession
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-[#059669]/20'
                    : 'bg-[#1E2235] hover:bg-[#282E47] border border-white/[0.08] text-[#E5E7EB]'
                }`}
              >
                {isPrivateSession ? 'Active (Zero-Disk)' : 'Enable Private Mode'}
              </button>
            </div>
          </div>

          {/* AI Privacy & Memory Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-[#A78BFA]" />
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Client-Side PII Anonymizer</h3>
                </div>
                <input
                  type="checkbox"
                  checked={settings.anonymizePIIInAI}
                  onChange={(e) => handleUpdate({ anonymizePIIInAI: e.target.checked })}
                  className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6] bg-[#161826] border-white/[0.08] cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Automatically scrubs email addresses, phone numbers, and identity strings before submitting prompts to Gemini models.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">Include AI Memories in Context</h3>
                </div>
                <input
                  type="checkbox"
                  checked={settings.includeMemoryInPrompts}
                  onChange={(e) => handleUpdate({ includeMemoryInPrompts: e.target.checked })}
                  className="w-4 h-4 rounded text-[#8B5CF6] focus:ring-[#8B5CF6] bg-[#161826] border-white/[0.08] cursor-pointer"
                />
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Allows Gemini to reference your active learned core values and preferences stored in your AI Memory tab for tailored reflections.
              </p>
            </div>
          </div>

          {/* Data Portability & Nuclear Purge */}
          <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-6 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#A78BFA]" />
              <h3 className="text-sm font-semibold text-[#F9FAFB]">Data Ownership & Portability</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Seed Sample Journals */}
              <div className="p-4 rounded-xl bg-[#1E1B4B]/40 border border-[#8B5CF6]/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                  <h4 className="text-xs font-semibold text-[#F9FAFB]">Seed Sample Journals</h4>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Populate 5 multi-turn Socratic reflections, companion goals, and AI memories to explore full vault capabilities.
                </p>
                {onAddSampleJournals && (
                  <button
                    onClick={onAddSampleJournals}
                    disabled={isAddingSamples}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#2D286B] hover:bg-[#373082] text-[#FDE68A] border border-[#F59E0B]/40 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>{isAddingSamples ? 'Seeding Data...' : 'Populate Sample Data'}</span>
                  </button>
                )}
              </div>

              {/* Export Full Backup */}
              <div className="p-4 rounded-xl bg-[#161826] border border-white/[0.08] space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#A78BFA]" />
                  <h4 className="text-xs font-semibold text-[#F9FAFB]">Export Vault Backup</h4>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Download a structured JSON archive containing all reflections, chat messages, goals, plans, and AI memories.
                </p>
                <button
                  onClick={onExportAllData}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1E2235] hover:bg-[#282E47] text-[#E5E7EB] border border-white/[0.08] text-xs font-medium transition-all cursor-pointer"
                >
                  <FileJson className="w-3.5 h-3.5 text-[#A78BFA]" />
                  <span>Download JSON Archive</span>
                </button>
              </div>

              {/* GDPR Atomic Purge */}
              <div className="p-4 rounded-xl bg-[#2A1418]/40 border border-[#FB7185]/30 space-y-3">
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-[#FB7185]" />
                  <h4 className="text-xs font-semibold text-[#FB7185]">Nuclear Purge (GDPR)</h4>
                </div>
                <p className="text-xs text-[#FCA5A5]/80">
                  Permanently erases all Firestore collections (/entries, /goals, /daily_plans, /ai_memories, /settings).
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
          <div className="p-6 rounded-2xl bg-[#11131C]/80 border border-white/[0.08] space-y-4 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#A78BFA]" />
              <h2 className="text-base font-semibold text-[#F9FAFB]">Account Identity & Access</h2>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-[#161826] border border-white/[0.08]">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full ring-2 ring-[#8B5CF6]/50 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#1E2235] border border-white/[0.08] flex items-center justify-center text-[#9CA3AF]">
                  <User className="w-6 h-6" />
                </div>
              )}

              <div className="space-y-0.5 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F9FAFB]">
                    {user?.displayName || 'Vault Owner'}
                  </h3>
                  {isAdmin && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/40 font-mono">
                      Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#9CA3AF]">{user?.email || 'Anonymous Guest'}</p>
                <p className="text-[10px] text-[#6B7280] font-mono">UID: {user?.uid || 'guest_local'}</p>
              </div>

              <button
                onClick={onSignOut}
                className="px-4 py-2 rounded-xl bg-[#1E2235] hover:bg-[#FB7185]/20 hover:text-[#FB7185] border border-white/[0.08] text-xs font-medium transition-all cursor-pointer"
              >
                Sign Out Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Nuclear Purge */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#11131C] border border-[#FB7185]/50 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-[#FB7185]">
              <div className="w-10 h-10 rounded-xl bg-[#FB7185]/10 border border-[#FB7185]/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#FB7185]" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-[#F9FAFB]">Confirm Complete Data Purge</h3>
                <p className="text-xs text-[#FB7185]">This action is irreversible and permanent.</p>
              </div>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              To proceed with wiping all reflections, goals, daily plans, AI memory entries, and preferences from Cloud Firestore and local storage, type{' '}
              <strong className="text-[#F9FAFB] select-all font-mono">delete all my data</strong> below:
            </p>

            <input
              type="text"
              value={purgeInputText}
              onChange={(e) => setPurgeInputText(e.target.value)}
              placeholder="Type 'delete all my data'"
              className="w-full px-3.5 py-2 rounded-xl bg-[#161826] border border-[#FB7185]/40 text-xs text-[#F9FAFB] focus:outline-none focus:border-[#FB7185]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowPurgeModal(false);
                  setPurgeInputText('');
                }}
                className="px-4 py-2 rounded-xl bg-[#1E2235] hover:bg-[#282E47] text-[#E5E7EB] text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={purgeInputText.trim().toLowerCase() !== 'delete all my data' || isPurging}
                onClick={handleExecutePurge}
                className="px-4 py-2 rounded-xl bg-[#FB7185] hover:bg-[#F43F5E] text-[#0A0A0B] text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#FB7185]/20"
              >
                {isPurging ? 'Purging Everything...' : 'Permanently Delete Everything'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Dispatch Hub Modal */}
      {activeEmailModalData && (
        <EmailDispatchModal
          data={activeEmailModalData}
          onClose={() => setActiveEmailModalData(null)}
        />
      )}
    </div>
  );
};
