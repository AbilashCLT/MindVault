import React, { useState } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  PenTool,
  Target,
  Calendar,
  Brain,
  Search,
  Mail,
  ShieldCheck,
  MapPin,
  ChevronRight,
  Zap,
  Lock,
} from 'lucide-react';

interface UserGuideModalProps {
  onClose: () => void;
  onNavigateToView?: (view: any) => void;
}

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  onClose,
  onNavigateToView,
}) => {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'reflect' | 'goals' | 'planner' | 'memory' | 'email' | 'security'>('quickstart');

  const sections = [
    { id: 'quickstart', label: 'Quickstart (5 Min)', icon: Zap, color: 'text-[#F59E0B]' },
    { id: 'reflect', label: 'Socratic Canvas & Maps', icon: PenTool, color: 'text-[#A78BFA]' },
    { id: 'goals', label: 'Goals & Milestones', icon: Target, color: 'text-[#34D399]' },
    { id: 'planner', label: 'Energy Daily Planner', icon: Calendar, color: 'text-[#818CF8]' },
    { id: 'memory', label: 'AI Memory & Ask Vault', icon: Brain, color: 'text-[#F472B6]' },
    { id: 'email', label: 'Email Digest & Gmail', icon: Mail, color: 'text-[#FB923C]' },
    { id: 'security', label: 'Zero-Trust Security', icon: ShieldCheck, color: 'text-[#38BDF8]' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl bg-[#11131C] border border-white/[0.12] shadow-2xl overflow-hidden text-[#F3F4F6]">
        {/* Header */}
        <div className="p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#161826]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E1B4B] to-[#2D286B] border border-[#8B5CF6]/40 flex items-center justify-center text-[#C4B5FD] shadow-md shadow-[#8B5CF6]/20">
              <BookOpen className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base text-[#F9FAFB]">MindVault User Guide & Interactive Manual</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8B5CF6]/20 text-[#C4B5FD] border border-[#8B5CF6]/40 font-mono">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-[#9CA3AF]">
                Complete walkthrough of features, workflows, and Google Cloud capabilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Two-Column Body: Sidebar Navigation + Content Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Sidebar */}
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-white/[0.08] bg-[#0E101A] p-3 space-y-1 overflow-y-auto shrink-0">
            <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider px-2 block mb-2">
              Guide Chapters
            </span>
            {sections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1E1B4B] text-[#F9FAFB] border border-[#8B5CF6]/40 shadow-sm'
                      : 'text-[#9CA3AF] hover:bg-white/[0.04] hover:text-[#F3F4F6]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${sec.color}`} />
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#A78BFA]" />}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0B0D14] text-[#D1D5DB] leading-relaxed">
            {activeSection === 'quickstart' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#F59E0B]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">Quickstart: Your First 5 Minutes</h4>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  MindVault bridges mindful reflection with actionable strategic execution. Follow these three steps to get started:
                </p>

                <div className="grid grid-cols-1 gap-3">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#C4B5FD]">
                      <span className="w-5 h-5 rounded-full bg-[#1E1B4B] border border-[#8B5CF6]/40 flex items-center justify-center text-[10px]">1</span>
                      <span>Capture Your Thoughts with Socratic Clarity</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">
                      Click <strong>"+ New Thought"</strong> in the top navigation bar. Write freely or use the microphone for voice-to-text. Then click <strong>"Synthesize Clarity"</strong> to receive an executive synthesis, emotional spectrum, and Socratic challenge.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#34D399]">
                      <span className="w-5 h-5 rounded-full bg-[#064E3B] border border-[#10B981]/40 flex items-center justify-center text-[10px]">2</span>
                      <span>Convert Reflections into Strategic Goals</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">
                      Visit the <strong>Goals</strong> space to see ambitions automatically synthesized from your entries, or create quarterly milestones to track your progress visually.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#818CF8]">
                      <span className="w-5 h-5 rounded-full bg-[#1E1B4B] border border-[#818CF8]/40 flex items-center justify-center text-[10px]">3</span>
                      <span>Schedule Energy-Aligned Daily Plans</span>
                    </div>
                    <p className="text-xs text-[#9CA3AF]">
                      Open the <strong>Daily Planner</strong> to align high-focus tasks with your peak mental energy hours (1–5) synthesized by Gemini.
                    </p>
                  </div>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToView?.('reflect');
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white text-xs font-semibold transition-all cursor-pointer shadow-md shadow-[#7C3AED]/25"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Create Your First Reflection Now</span>
                  </button>
                </div>
              </div>
            )}

            {activeSection === 'reflect' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-[#A78BFA]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">Reflection Canvas & Google Maps Geotagging</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#C4B5FD] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#A78BFA]" />
                      <span>Multi-Turn Socratic AI Dialogue</span>
                    </h5>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      Unlike static text documents, MindVault's right-hand panel engages you in active dialogue. Type replies to Gemini's probing questions to reveal hidden assumptions and unlock deeper perspective.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#34D399] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#34D399]" />
                      <span>Location-Aware Sanctuary Geotagging</span>
                    </h5>
                    <p className="text-[#9CA3AF] leading-relaxed">
                      Click the <strong>"+ Location"</strong> button in the canvas header to tag physical environments using <strong>Google Maps</strong>. Choose quick presets (*Home Sanctuary*, *Coffee Shop*, *Nature Trail*) or click <strong>"Detect My Location"</strong> for instant GPS alignment.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#818CF8]">Five Tailored Reflection Frameworks</h5>
                    <ul className="list-disc pl-5 space-y-1 text-[#9CA3AF]">
                      <li><strong>Open Reflection:</strong> Freeform writing and mental decompression.</li>
                      <li><strong>Clarity & Decision:</strong> Weighted pros/cons and trade-off synthesis.</li>
                      <li><strong>Gratitude & Presence:</strong> Daily appreciation and emotional anchoring.</li>
                      <li><strong>Stoic Deconstruction:</strong> Reframing challenges and locus of control.</li>
                      <li><strong>Energy & Vitality:</strong> Assessing burnout, momentum, and restorative needs.</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'goals' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#34D399]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">Strategic Goals & Milestones</h4>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Bridge the gap between raw insights and concrete personal achievements.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#F9FAFB]">AI-Assisted Goal Extraction</h5>
                    <p className="text-[#9CA3AF]">
                      When synthesizing reflections, Gemini highlights implicit commitments and prompts you to turn them into trackable milestones with target dates.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#F9FAFB]">Milestone Progress & Notifications</h5>
                    <p className="text-[#9CA3AF]">
                      Check off milestones as you achieve them. The progress bar recalculates instantly and an automated celebratory summary is dispatched to your email.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'planner' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#818CF8]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">Energy-Aligned Daily Planner</h4>
                </div>
                <p className="text-xs text-[#9CA3AF]">
                  Optimize your calendar by matching task demands with your physiological and cognitive energy levels.
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#C4B5FD]">Energy Level Calibration (1–5)</h5>
                    <p className="text-[#9CA3AF]">
                      Tag tasks with energy ratings from Level 1 (Mindful / Low Drain) to Level 5 (High Focus / Deep Creative Output). The system visually flags overloaded schedules to prevent burnout.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#818CF8]">AI Schedule Optimization</h5>
                    <p className="text-[#9CA3AF]">
                      Click <strong>"AI Suggest Daily Schedule"</strong> to generate a balanced schedule combining deep work blocks, recovery breaks, and milestone action items.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'memory' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-[#F472B6]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">AI Memory Bank & Ask Vault Semantic Search</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#F472B6]">Long-Term AI Memory Bank</h5>
                    <p className="text-[#9CA3AF]">
                      Over time, Gemini extracts your core values, cognitive habits, and recurring topics. You can pin key insights, edit them, or delete outdated memories at any time.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#C4B5FD] flex items-center gap-1.5">
                      <Search className="w-4 h-4 text-[#A78BFA]" />
                      <span>Ask Vault (Grounded Semantic Search)</span>
                    </h5>
                    <p className="text-[#9CA3AF]">
                      Ask natural language questions like <em>"What were my primary obstacles in July?"</em> or <em>"Summarize my breakthroughs regarding project planning."</em> Gemini searches your private journal records and synthesizes answers with zero hallucination.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'email' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#FB923C]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">Email Notifications & One-Click Gmail Launch</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#FB923C]">How Email Notifications Work</h5>
                    <p className="text-[#9CA3AF]">
                      MindVault generates structured HTML digests and sends them via the server notification pipeline. You can also click <strong>"Open in Gmail"</strong> or <strong>"Open in Mail App"</strong> to immediately view or send the pre-composed digest directly from your account!
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#F9FAFB]">Configuring Your Notification Preferences</h5>
                    <p className="text-[#9CA3AF]">
                      Navigate to <strong>Settings</strong> &rarr; <strong>Email Notifications</strong> to set your custom email address, send a test email, or toggle Daily Clarity Digests, Breakthrough Alerts, and Goal Milestone updates.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#38BDF8]" />
                  <h4 className="text-base font-semibold text-[#F9FAFB]">Zero-Trust Security & Cloud Isolation</h4>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#38BDF8]">Firebase & Cloud Firestore Data Isolation</h5>
                    <p className="text-[#9CA3AF]">
                      Each user's reflections, memories, and goals are stored under isolated subpaths (<code className="text-[#A78BFA]">/users/{'{userId}'}/...</code>) with strict Firestore Security Rules. Cross-tenant access is cryptographically impossible.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#34D399] flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#34D399]" />
                      <span>Zero-Disk Ephemeral Mode</span>
                    </h5>
                    <p className="text-[#9CA3AF]">
                      For sensitive thoughts you do not wish to store in the cloud, activate <strong>Zero-Disk Mode</strong>. Your reflection remains in volatile RAM and is completely erased upon closing the tab.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#11131C] border border-white/[0.08] space-y-2">
                    <h5 className="font-semibold text-[#F59E0B]">4-Tier Resilient AI Fallback Ladder</h5>
                    <p className="text-[#9CA3AF]">
                      Inference calls are automatically protected against quota exhaustion and outages by cascading across <code className="text-[#C4B5FD]">gemini-3.6-flash &rarr; gemini-3.1-flash-lite &rarr; gemini-flash-latest &rarr; gemini-3.7-flash</code>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#161826] border-t border-white/[0.08] flex items-center justify-between">
          <span className="text-[11px] text-[#6B7280]">
            MindVault • Engineered for the Google Cloud Run AI Challenge
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#8B5CF6] hover:to-[#818CF8] text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
