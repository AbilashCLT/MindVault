export type ReflectionMode = 'reflection' | 'brainstorm' | 'summary' | 'action_plan' | 'deep_dive';

export type AppView =
  | 'home'
  | 'reflect'
  | 'goals'
  | 'planner'
  | 'memory'
  | 'ask'
  | 'patterns'
  | 'settings'
  | 'security'
  | 'admin';

export interface AIMemoryItem {
  id: string;
  userId: string;
  category:
    | 'Core Value'
    | 'Recurring Pattern'
    | 'Growth Goal'
    | 'Life Context'
    | 'Communication Preference'
    | 'Emotional Trigger';
  key: string;
  statement: string;
  confidence: number; // 0 to 100
  sourceReflectionId?: string;
  sourceReflectionTitle?: string;
  isActive: boolean; // whether included in Gemini context
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  userId: string;
  // General & Reflection Preferences
  defaultMode: ReflectionMode;
  aiPersonaTone: 'socratic_inquisitive' | 'gentle_empathetic' | 'structured_analytical' | 'philosophical_stoic';
  reflectionLengthPreference: 'concise' | 'balanced' | 'deep_dive';
  enableDailyReminders: boolean;
  reminderTime: string; // e.g. "20:00"
  enableSoundEffects: boolean;
  themePreference: 'dark_warm' | 'dark_minimal' | 'slate_refined';
  
  // Privacy & Data Isolation
  isZeroKnowledgeEncrypted: boolean;
  enableTelemetryDiagnostics: boolean;
  anonymizePIIInAI: boolean;
  autoSaveIntervalSeconds: number;
  privateModeDefault: boolean;
  includeMemoryInPrompts: boolean;
  
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'gemini';
  text: string;
  timestamp: number;
  modelUsed?: string;
}

export interface GoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  estimatedMinutes?: number;
  dueDate?: string;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: 'Career & Work' | 'Mindfulness & Health' | 'Personal Growth' | 'Creative Craft' | 'Productivity';
  timeframe: 'Weekly' | 'Monthly' | 'Quarterly' | 'Long-term';
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0 to 100
  milestones: GoalMilestone[];
  sourceReflectionId?: string;
  sourceReflectionTitle?: string;
  extractedFromText?: string;
  createdAt: number;
  updatedAt: number;
  targetDate?: string;
}

export interface DailyTimeBlock {
  id: string;
  timeSlot: string; // e.g. "09:00 - 10:30"
  title: string;
  category: 'Deep Work' | 'Mindfulness' | 'Admin & Comms' | 'Health & Rest' | 'Goal Focus';
  completed: boolean;
  linkedGoalId?: string;
  notes?: string;
}

export interface DailyPlan {
  id: string;
  userId: string;
  dateKey: string; // YYYY-MM-DD
  focusIntention: string;
  topPriorities: Array<{ id: string; text: string; completed: boolean }>;
  timeBlocks: DailyTimeBlock[];
  energyLevel: number; // 1 to 5
  eveningReflection?: string;
  sourceReflectionId?: string;
  updatedAt: number;
}

export interface ReflectionEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  mode: ReflectionMode;
  messages: ChatMessage[];
  tags: string[];
  createdAt: number;
  updatedAt: number;
  starred?: boolean;
  moodScore?: number; // -1.0 to +1.0
  clarityIndex?: number; // 0 to 100
  dominantEmotions?: string[];
  actionItems?: string[];
  extractedGoals?: Array<{ title: string; category: string; milestones: string[] }>;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: 'admin' | 'member' | 'guest';
}

export interface ModeConfig {
  id: ReflectionMode;
  label: string;
  tagline: string;
  icon: string;
  accentColor: string;
  placeholder: string;
  starterPrompts: string[];
}

export interface AIDigestSummary {
  periodTitle: string;
  headline: string;
  overview: string;
  keyInsights: string[];
  growthHighlights: string[];
  focusPriorities: string[];
  dominantMood: string;
  clarityAverage: number;
  generatedAt: number;
}

export interface MoodDataPoint {
  id: string;
  date: string;
  timestamp: number;
  title: string;
  moodScore: number; // -1 to 1 normalized to 0-100 or displayed on graph
  clarityIndex: number; // 0 to 100
  mode: ReflectionMode;
  dominantEmotion: string;
  tags: string[];
}

export interface SecurityEvent {
  id: string;
  timestamp: number;
  scenario: string;
  threatZone: string;
  status: 'BLOCKED' | 'LOGGED' | 'CONTAINED';
  details: string;
  owaspMapping: string;
  ipMock?: string;
}

export interface SystemMetrics {
  totalReflections: number;
  activeModelLadder: string[];
  primaryModel: string;
  averageLatencyMs: number;
  apiSuccessRate: number;
  blockedAttacksCount: number;
  quotaStatus: 'HEALTHY' | 'MODERATE' | 'RESTRICTED';
  firestoreHealth: 'CONNECTED' | 'LOCAL_FALLBACK';
  serverUptimeSeconds: number;
}

export interface PatternInsight {
  theme: string;
  frequency: number;
  sentimentTrend: 'rising' | 'stable' | 'fluctuating';
  description: string;
  associatedModes: ReflectionMode[];
}
