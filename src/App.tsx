import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { HistorySidebar } from './components/HistorySidebar';
import { ReflectionCanvas } from './components/ReflectionCanvas';
import { HomeScreen } from './components/HomeScreen';
import { AskVaultView } from './components/AskVaultView';
import { PatternFinderView } from './components/PatternFinderView';
import { SecurityCenter } from './components/SecurityCenter';
import { AdminConsole } from './components/AdminConsole';
import { GoalsManagerView } from './components/GoalsManagerView';
import { DailyPlannerView } from './components/DailyPlannerView';
import { SettingsPrivacyView } from './components/SettingsPrivacyView';
import { AIMemoryView } from './components/AIMemoryView';
import { UserGuideModal } from './components/UserGuideModal';
import { seedSampleDataForUser } from './lib/sampleJournals';
import {
  loginWithGoogle,
  loginAsGuest,
  logoutUser,
  subscribeToAuthState,
  saveUserEntry,
  deleteUserEntry,
  subscribeToUserEntries,
  saveUserGoal,
  deleteUserGoal,
  subscribeToUserGoals,
  saveDailyPlan,
  saveUserSettings,
  subscribeToUserSettings,
  saveAIMemory,
  deleteAIMemory,
  subscribeToAIMemories,
} from './lib/firebase';
import type {
  ReflectionEntry,
  ReflectionMode,
  ChatMessage,
  UserProfile,
  AppView,
  GoalItem,
  DailyPlan,
  UserSettings,
  AIMemoryItem,
} from './types';

const DEFAULT_USER_SETTINGS: UserSettings = {
  userId: 'guest_local',
  themePreference: 'dark_warm',
  defaultMode: 'reflection',
  reflectionLengthPreference: 'balanced',
  aiPersonaTone: 'socratic_inquisitive',
  anonymizePIIInAI: true,
  enableDailyReminders: false,
  reminderTime: '20:00',
  enableSoundEffects: false,
  isZeroKnowledgeEncrypted: true,
  enableTelemetryDiagnostics: true,
  autoSaveIntervalSeconds: 30,
  privateModeDefault: false,
  includeMemoryInPrompts: true,
  notificationEmail: 'abilashcalicut8@gmail.com',
  enableEmailDigest: true,
  enableGoalMilestoneAlerts: true,
  enableBreakthroughAlerts: true,
  updatedAt: Date.now(),
};

function createNewEntry(userId: string, mode: ReflectionMode = 'reflection', initialTitle?: string): ReflectionEntry {
  const timestamp = Date.now();
  return {
    id: `entry_${timestamp}_${Math.random().toString(36).substring(2, 9)}`,
    userId,
    title: initialTitle || 'New Reflection',
    summary: '',
    mode,
    messages: [],
    tags: ['Daily'],
    createdAt: timestamp,
    updatedAt: timestamp,
    starred: false,
    moodScore: 0.7,
    clarityIndex: 85,
    dominantEmotions: ['Reflective', 'Focused'],
    actionItems: [],
  };
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [entries, setEntries] = useState<ReflectionEntry[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [memories, setMemories] = useState<AIMemoryItem[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [selectedEntry, setSelectedEntry] = useState<ReflectionEntry | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [isPrivateSession, setIsPrivateSession] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeModelName, setActiveModelName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [lastError, setLastError] = useState<string | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [isUserGuideOpen, setIsUserGuideOpen] = useState<boolean>(false);
  const [isAddingSamples, setIsAddingSamples] = useState<boolean>(false);
  const [sampleToast, setSampleToast] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // 1. Unified Auth state listener (Firebase & Local Guest)
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((user: UserProfile | null) => {
      setCurrentUser(user);
      if (!user) {
        setEntries([]);
        setGoals([]);
        setMemories([]);
        setSelectedEntry(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore entries subscription for authenticated user
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserEntries(
      currentUser.uid,
      (fetchedEntries) => {
        if (!isPrivateSession) {
          setEntries(fetchedEntries);
          setSelectedEntry((current) => {
            if (!current) {
              return fetchedEntries.length > 0 ? fetchedEntries[0] : createNewEntry(currentUser.uid);
            }
            const updated = fetchedEntries.find((e) => e.id === current.id);
            return updated || current;
          });
        }
      },
      (error) => {
        console.error('Firestore subscription error:', error);
        setLastError('Failed to stream reflections from Firestore.');
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid, isPrivateSession]);

  // 3. Real-time Firestore goals subscription
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserGoals(
      currentUser.uid,
      (fetchedGoals) => {
        setGoals(fetchedGoals);
      },
      (error) => {
        console.error('Firestore goals subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // 4. Real-time Firestore user settings subscription
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToUserSettings(
      currentUser.uid,
      (fetchedSettings) => {
        if (fetchedSettings) {
          setUserSettings(fetchedSettings);
        }
      },
      (error) => {
        console.error('Firestore settings subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // 5. Real-time Firestore AI memories subscription
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribe = subscribeToAIMemories(
      currentUser.uid,
      (fetchedMemories) => {
        setMemories(fetchedMemories);
      },
      (error) => {
        console.error('Firestore AI memories subscription error:', error);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Save Goal Handler
  const handleSaveGoal = async (goal: GoalItem) => {
    if (!currentUser?.uid) return;
    try {
      await saveUserGoal(currentUser.uid, goal);
      setGoals((prev) => {
        const idx = prev.findIndex((g) => g.id === goal.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = goal;
          return next;
        }
        return [goal, ...prev];
      });
    } catch (err) {
      console.error('Failed to save goal:', err);
    }
  };

  // Delete Goal Handler
  const handleDeleteGoal = async (goalId: string) => {
    if (!currentUser?.uid) return;
    try {
      await deleteUserGoal(currentUser.uid, goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  // Save Daily Plan Handler
  const handleSaveDailyPlan = async (plan: DailyPlan) => {
    if (!currentUser?.uid) return;
    try {
      await saveDailyPlan(currentUser.uid, plan);
    } catch (err) {
      console.error('Failed to save daily plan:', err);
    }
  };

  // Save User Settings Handler
  const handleSaveUserSettings = async (updates: Partial<UserSettings>) => {
    if (!currentUser?.uid) return;
    const merged = { ...userSettings, ...updates, updatedAt: Date.now() };
    setUserSettings(merged);
    try {
      await saveUserSettings(currentUser.uid, merged);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  // Save AI Memory Handler
  const handleSaveMemory = async (memory: AIMemoryItem) => {
    if (!currentUser?.uid) return;
    setMemories((prev) => {
      const idx = prev.findIndex((m) => m.id === memory.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = memory;
        return copy;
      }
      return [memory, ...prev];
    });
    try {
      await saveAIMemory(currentUser.uid, memory);
    } catch (err) {
      console.error('Failed to save AI memory:', err);
    }
  };

  // Delete AI Memory Handler
  const handleDeleteMemory = async (memoryId: string) => {
    if (!currentUser?.uid) return;
    setMemories((prev) => prev.filter((m) => m.id !== memoryId));
    try {
      await deleteAIMemory(currentUser.uid, memoryId);
    } catch (err) {
      console.error('Failed to delete AI memory:', err);
    }
  };

  // Export Complete Vault Backup (JSON)
  const handleExportAllData = () => {
    const backupData = {
      exportMetadata: {
        app: 'MindVault',
        tagline: 'Your thoughts. Your space.',
        exportedAt: new Date().toISOString(),
        userId: currentUser?.uid,
        userEmail: currentUser?.email,
      },
      settings: userSettings,
      entries,
      goals,
      memories,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindvault_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setLastError(null);
    try {
      const profile = await loginWithGoogle();
      if (!profile) return;
      setCurrentUser(profile);
      setCurrentView('home');
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        return;
      }
      setLastError(err?.message || 'Failed to sign in with Google.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Guest / Sanctuary Sign-In
  const handleGuestSignIn = async (name?: string) => {
    setAuthLoading(true);
    setLastError(null);
    try {
      const profile = await loginAsGuest(name);
      setCurrentUser(profile);
      setCurrentView('home');
    } catch (err: any) {
      setLastError(err?.message || 'Failed to initialize private sanctuary.');
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Sign Out
  const handleSignOut = async () => {
    try {
      await logoutUser();
      setCurrentUser(null);
      setSelectedEntry(null);
      setEntries([]);
      setCurrentView('home');
    } catch (err: any) {
      console.error('Error signing out:', err);
    }
  };

  // Create a new reflection entry and navigate to reflect view
  const handleStartNewReflection = useCallback(
    (mode: ReflectionMode = 'reflection', initialPrompt?: string) => {
      if (!currentUser?.uid) return;
      const newEntry = createNewEntry(currentUser.uid, mode);
      if (initialPrompt) {
        newEntry.title = initialPrompt.slice(0, 30) + '...';
      }
      setSelectedEntry(newEntry);
      setCurrentView('reflect');
      setMobileSidebarOpen(false);
    },
    [currentUser?.uid]
  );

  // Update entry and persist strictly to Firestore (unless ephemeral zero-disk mode)
  const handleUpdateEntry = async (updatedEntry: ReflectionEntry) => {
    if (!currentUser?.uid) return;
    setSaveStatus('saving');
    setLastError(null);

    // Optimistic state update
    setSelectedEntry(updatedEntry);
    setEntries((prev) => {
      const idx = prev.findIndex((e) => e.id === updatedEntry.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedEntry;
        return copy;
      }
      return [updatedEntry, ...prev];
    });

    if (isPrivateSession) {
      setSaveStatus('saved');
      return;
    }

    try {
      await saveUserEntry(currentUser.uid, updatedEntry);
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      setSaveStatus('error');
      setLastError('Failed to persist changes to Firestore.');
    }
  };

  // Delete entry
  const handleDeleteEntry = async (entryId: string) => {
    if (!currentUser?.uid) return;
    try {
      if (!isPrivateSession) {
        await deleteUserEntry(currentUser.uid, entryId);
      }
      const remaining = entries.filter((e) => e.id !== entryId);
      setEntries(remaining);
      if (selectedEntry?.id === entryId) {
        setSelectedEntry(remaining.length > 0 ? remaining[0] : createNewEntry(currentUser.uid));
      }
    } catch (err: any) {
      console.error('Delete entry failed:', err);
      setLastError('Failed to delete entry from Firestore.');
    }
  };

  // Star / Favorite toggle
  const handleToggleStar = async (entry: ReflectionEntry) => {
    const updated = {
      ...entry,
      starred: !entry.starred,
      updatedAt: Date.now(),
    };
    await handleUpdateEntry(updated);
  };

  // Multi-Turn Message Sender to Gemini with Fallback Ladder
  const handleSendMessage = async (text: string, mode: ReflectionMode) => {
    if (!currentUser?.uid || !selectedEntry) return;

    setLastError(null);
    setIsGenerating(true);

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...selectedEntry.messages, userMessage];
    const interimEntry: ReflectionEntry = {
      ...selectedEntry,
      mode,
      messages: updatedMessages,
      updatedAt: Date.now(),
    };

    setSelectedEntry(interimEntry);
    if (!isPrivateSession) {
      try {
        await saveUserEntry(currentUser.uid, interimEntry);
      } catch (saveErr) {
        console.warn('Initial message save failed, proceeding with generation:', saveErr);
      }
    }

    try {
      const res = await fetch('/api/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({ sender: m.sender, text: m.text })),
          mode,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${res.status}`);
      }

      const data = await res.json();
      setActiveModelName(data.modelUsed || 'gemini-3.6-flash');

      const geminiMessage: ChatMessage = {
        id: `msg_${Date.now()}_g`,
        sender: 'gemini',
        text: data.text,
        timestamp: Date.now(),
        modelUsed: data.modelUsed,
      };

      let finalEntry: ReflectionEntry = {
        ...interimEntry,
        messages: [...updatedMessages, geminiMessage],
        updatedAt: Date.now(),
      };

      // Auto-summarize & extract title and mood scores
      if (
        finalEntry.title === 'New Reflection' ||
        finalEntry.title === 'Untitled Reflection' ||
        !finalEntry.summary
      ) {
        try {
          const sumRes = await fetch('/api/summarize-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `${text}\n\n${data.text}`,
            }),
          });
          if (sumRes.ok) {
            const sumData = await sumRes.json();
            if (sumData.title) finalEntry.title = sumData.title;
            if (sumData.summary) finalEntry.summary = sumData.summary;
            if (typeof sumData.moodScore === 'number') finalEntry.moodScore = sumData.moodScore;
            if (typeof sumData.clarityIndex === 'number') finalEntry.clarityIndex = sumData.clarityIndex;
            if (Array.isArray(sumData.dominantEmotions)) finalEntry.dominantEmotions = sumData.dominantEmotions;
            if (Array.isArray(sumData.actionItems)) finalEntry.actionItems = sumData.actionItems;
            if (Array.isArray(sumData.tags) && sumData.tags.length > 0) {
              finalEntry.tags = Array.from(new Set([...finalEntry.tags, ...sumData.tags]));
            }
          }
        } catch (sumErr) {
          console.warn('Auto-summary generation non-critical fail:', sumErr);
        }
      }

      setSelectedEntry(finalEntry);
      if (!isPrivateSession) {
        await saveUserEntry(currentUser.uid, finalEntry);
      }
      setSaveStatus('saved');
    } catch (err: any) {
      console.error('Error in message generation:', err);
      setLastError(err?.message || 'Failed to generate response. Please try again.');
      setSaveStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Retry last action
  const handleRetryLastAction = () => {
    if (selectedEntry && currentUser?.uid) {
      handleUpdateEntry(selectedEntry);
    }
  };

  // Populate rich sample journals, goals, and AI memory for logged-in user
  const handleAddSampleJournals = async () => {
    if (!currentUser?.uid) return;
    setIsAddingSamples(true);
    setLastError(null);
    try {
      const result = await seedSampleDataForUser(currentUser.uid);
      setEntries(result.entries);
      setGoals(result.goals);
      setMemories(result.memories);
      if (result.entries.length > 0) {
        setSelectedEntry(result.entries[0]);
      }
      setSampleToast('Successfully added 5 rich sample journals, goals, and AI memory items to your sanctuary!');
      setTimeout(() => setSampleToast(null), 6000);
    } catch (err: any) {
      console.error('Failed to seed sample journals:', err);
      setLastError('Failed to save sample journals to your vault.');
    } finally {
      setIsAddingSamples(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center text-[#A1A1AA]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#C0A080] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium tracking-wide">Initializing secure vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col font-sans antialiased text-[#F4F4F5]">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        currentView={currentView}
        onNavigate={(view) => setCurrentView(view)}
        onNewEntry={() => handleStartNewReflection()}
        onSignOut={handleSignOut}
        isPrivateSession={isPrivateSession}
        onOpenGuide={() => setIsUserGuideOpen(true)}
      />

      {/* Main App Canvas */}
      {!currentUser ? (
        <LandingView
          onGoogleSignIn={handleGoogleSignIn}
          onGuestSignIn={handleGuestSignIn}
          isLoading={authLoading}
          onOpenGuide={() => setIsUserGuideOpen(true)}
        />
      ) : (
        <main className="flex-1 flex overflow-hidden">
          {/* Main View Router */}
          {currentView === 'home' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <HomeScreen
                entries={entries}
                onStartNewReflection={handleStartNewReflection}
                onSelectEntry={(entry) => {
                  setSelectedEntry(entry);
                  setCurrentView('reflect');
                }}
                onNavigateToView={(view) => setCurrentView(view)}
                userDisplayName={currentUser.displayName}
                onOpenGuide={() => setIsUserGuideOpen(true)}
                onAddSampleJournals={handleAddSampleJournals}
                isAddingSamples={isAddingSamples}
              />
            </div>
          )}

          {currentView === 'reflect' && (
            <div className="flex-1 flex overflow-hidden w-full">
              {/* History Sidebar */}
              <HistorySidebar
                entries={entries}
                selectedEntryId={selectedEntry?.id || null}
                onSelectEntry={(entry) => {
                  setSelectedEntry(entry);
                  setLastError(null);
                }}
                onNewEntry={() => handleStartNewReflection()}
                onDeleteEntry={handleDeleteEntry}
                onToggleStar={handleToggleStar}
                isOpenMobile={mobileSidebarOpen}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                onAddSampleJournals={handleAddSampleJournals}
                isAddingSamples={isAddingSamples}
              />

              {/* Reflection Workspace */}
              {selectedEntry ? (
                <ReflectionCanvas
                  entry={selectedEntry}
                  onUpdateEntry={handleUpdateEntry}
                  onSendMessage={handleSendMessage}
                  isGenerating={isGenerating}
                  activeModelName={activeModelName}
                  saveStatus={saveStatus}
                  lastError={lastError}
                  onRetryLastAction={handleRetryLastAction}
                  onToggleSidebarMobile={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center p-8 text-center text-[#71717A]">
                  <p>Select an entry from your vault or start a new reflection.</p>
                </div>
              )}
            </div>
          )}

          {currentView === 'ask' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
              <AskVaultView
                entries={entries}
                onSelectEntry={(entry) => {
                  setSelectedEntry(entry);
                  setCurrentView('reflect');
                }}
                onNavigateToView={(view) => setCurrentView(view)}
              />
            </div>
          )}

          {currentView === 'patterns' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 w-full">
              <PatternFinderView
                entries={entries}
                onSelectEntry={(entry) => {
                  setSelectedEntry(entry);
                  setCurrentView('reflect');
                }}
                onStartNewReflection={handleStartNewReflection}
                onAddSampleJournals={handleAddSampleJournals}
              />
            </div>
          )}

          {currentView === 'goals' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <GoalsManagerView
                goals={goals}
                entries={entries}
                onSaveGoal={handleSaveGoal}
                onDeleteGoal={handleDeleteGoal}
                onNavigateToReflect={(entry) => {
                  if (entry) setSelectedEntry(entry);
                  setCurrentView('reflect');
                }}
                onNavigateToPlanner={() => setCurrentView('planner')}
                userId={currentUser.uid}
              />
            </div>
          )}

          {currentView === 'planner' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <DailyPlannerView
                goals={goals}
                entries={entries}
                onSaveDailyPlan={handleSaveDailyPlan}
                onNavigateToGoals={() => setCurrentView('goals')}
                onNavigateToReflect={(entry) => {
                  if (entry) setSelectedEntry(entry);
                  setCurrentView('reflect');
                }}
                userId={currentUser.uid}
              />
            </div>
          )}

          {currentView === 'memory' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <AIMemoryView
                user={currentUser}
                memories={memories}
                reflections={entries}
                onSaveMemory={handleSaveMemory}
                onDeleteMemory={handleDeleteMemory}
                onStartReflectionWithTopic={(topic) => handleStartNewReflection('reflection', topic)}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <SettingsPrivacyView
                user={currentUser}
                settings={userSettings}
                onSaveSettings={handleSaveUserSettings}
                isPrivateSession={isPrivateSession}
                onTogglePrivateSession={(enabled) => setIsPrivateSession(enabled)}
                onDataPurged={() => {
                  setEntries([]);
                  setGoals([]);
                  setMemories([]);
                  setSelectedEntry(null);
                  setCurrentView('home');
                }}
                onExportAllData={handleExportAllData}
                onSignOut={handleSignOut}
                onAddSampleJournals={handleAddSampleJournals}
                isAddingSamples={isAddingSamples}
              />
            </div>
          )}

          {currentView === 'security' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <AdminConsole
                user={currentUser}
                onBackToApp={() => setCurrentView('home')}
              />
            </div>
          )}

          {currentView === 'admin' && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              <AdminConsole
                user={currentUser}
                onBackToApp={() => setCurrentView('home')}
              />
            </div>
          )}
        </main>
      )}

      {/* Floating Sample Toast Notification */}
      {sampleToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1E1B4B] border border-[#8B5CF6]/60 text-[#F9FAFB] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl animate-fade-in">
          <div className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
          <p className="text-xs font-medium leading-tight">{sampleToast}</p>
          <button
            onClick={() => setSampleToast(null)}
            className="text-[#9CA3AF] hover:text-[#F9FAFB] text-xs font-bold pl-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Interactive User Guide & Manual Modal */}
      {isUserGuideOpen && (
        <UserGuideModal
          onClose={() => setIsUserGuideOpen(false)}
          onNavigateToView={(view) => {
            setIsUserGuideOpen(false);
            setCurrentView(view);
          }}
        />
      )}
    </div>
  );
}
