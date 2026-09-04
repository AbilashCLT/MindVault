import type { ReflectionEntry, GoalItem, AIMemoryItem } from '../types';
import { saveUserEntry, saveUserGoal, saveAIMemory } from './firebase';

/**
 * Returns a comprehensive, high-quality suite of sample journals tailored to the user.
 * Spanning multiple cognitive reflection modes: deep_dive, reflection, brainstorm, action_plan, and summary.
 */
export function getSampleJournals(userId: string): ReflectionEntry[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: `sample_entry_1_${userId}`,
      userId,
      title: 'Architecting High-Throughput Distributed Microservices & Eventual Consistency',
      summary:
        'Explored architectural tradeoffs between distributed sagas and event choreography. Established principles for transactional outbox patterns, strict idempotency keys, and distributed tracing with OpenTelemetry.',
      mode: 'deep_dive',
      tags: ['Engineering', 'SystemDesign', 'Architecture', 'Scalability', 'Microservices'],
      createdAt: now - 3 * dayMs - 4 * 3600 * 1000,
      updatedAt: now - 3 * dayMs,
      starred: true,
      moodScore: 0.88,
      clarityIndex: 94,
      dominantEmotions: ['Focused', 'Analytical', 'Strategic'],
      actionItems: [
        'Implement transactional outbox pattern on order dispatch service',
        'Add standardized X-Idempotency-Key headers across public ingress gateways',
        'Instrument distributed trace spans across async message brokers',
      ],
      extractedGoals: [
        {
          title: 'Master Event-Driven Distributed Architectures',
          category: 'Career & Work',
          milestones: [
            'Benchmarking transactional outbox message lag',
            'Drafting RFC for cross-service idempotency enforcement',
            'Conducting end-to-end chaos engineering fault drills',
          ],
        },
      ],
      location: {
        placeName: 'San Francisco Tech District',
        formattedAddress: '500 Howard St, San Francisco, CA 94105',
        lat: 37.7885,
        lng: -122.3982,
        city: 'San Francisco',
        country: 'United States',
      },
      messages: [
        {
          id: `msg_1_1_${userId}`,
          sender: 'user',
          timestamp: now - 3 * dayMs - 3 * 3600 * 1000,
          text: 'I am wrestling with state inconsistency in our asynchronous checkout flow. When the payment service succeeds but the inventory allocation service times out during peak load, we end up in an indeterminate state. Should we lean into Orchestrated Sagas or Choreography?',
        },
        {
          id: `msg_1_2_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 3 * dayMs - 2 * 3600 * 1000,
          text: `Let's dissect this with Socratic precision across two fundamental dimensions: **observability overhead** and **blast radius of failure**.

### 1. The Core Tension: Orchestration vs Choreography
* **Choreography (Event-Driven)**: High decoupling, but distributed state machines become implicit. Debugging "why inventory didn't reserve after payment event #4092" requires aggregating asynchronous logs across three distributed queues.
* **Orchestration (Saga Coordinator)**: A centralized state coordinator holds the explicit state machine. If payment succeeds but inventory fails, the coordinator executes compensating transactions (e.g., auto-issuing a refund or putting order in backpressure queue).

### 2. High-Leverage Architectural Recommendation
Given your peak-load requirements:
1. **Adopt an Orchestrated Saga with Temporal/Cadence or lightweight state machines** for core revenue paths (Checkout, Billing).
2. **Mandate Transactional Outbox Pattern**: Prevent dual-write anomalies (writing to Postgres DB and publishing to Kafka/PubSub in two separate transactions). Use Debezium CDC or outbox tables.
3. **Strict Client Idempotency**: All upstream dispatch operations must supply cryptographic UUIDs as idempotency tokens.

*What is your primary constraint: team familiarity with state machines or minimizing message queue latency?*`,
        },
        {
          id: `msg_1_3_${userId}`,
          sender: 'user',
          timestamp: now - 3 * dayMs - 1 * 3600 * 1000,
          text: 'Our primary constraint is debugging velocity during on-call incidents. An explicit coordinator gives us immediate visibility into failed transactions without crawling through Kafka topic offsets.',
        },
        {
          id: `msg_1_4_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 3 * dayMs,
          text: `That clarity gives you a decisive path forward. When **Mean Time to Resolution (MTTR)** and on-call cognitive load are the north stars, **Orchestrated Sagas with explicit state visualizers** consistently outperform pure event choreography.

**Synthesized Action Matrix:**
- [x] Select centralized saga coordinator for checkout pipeline
- [ ] Implement database-level transactional outbox to eliminate split-brain writes
- [ ] Define automatic compensating transactions for inventory allocation timeouts`,
        },
      ],
    },
    {
      id: `sample_entry_2_${userId}`,
      userId,
      title: 'Stoic Recalibration: Reclaiming Deep Focus, Intentionality & Creative Flow',
      summary:
        'Contemplated the dichotomy of control regarding external market volatility and engineering timelines. Reframed proactive deep work blocks as protected sanctuaries rather than reactive gaps.',
      mode: 'reflection',
      tags: ['Mindfulness', 'Stoicism', 'MentalClarity', 'DeepWork', 'Ritual'],
      createdAt: now - 2 * dayMs - 5 * 3600 * 1000,
      updatedAt: now - 2 * dayMs,
      starred: true,
      moodScore: 0.82,
      clarityIndex: 91,
      dominantEmotions: ['Calm', 'Grounded', 'Reflective'],
      actionItems: [
        'Protect 08:30 - 11:30 daily as absolute asynchronous deep work block',
        'Disable all non-critical push notifications across mobile and desktop',
        'Practice daily 5-minute evening review before leaving the desk',
      ],
      extractedGoals: [
        {
          title: 'Cultivate High-Leverage Daily Focus Rhythm',
          category: 'Personal Growth',
          milestones: [
            'Maintain unbroken 3-hour morning deep focus sessions for 14 days',
            'Conduct daily evening retrospective logging',
          ],
        },
      ],
      location: {
        placeName: 'Mountain Zen Sanctuary',
        formattedAddress: 'Chautauqua Trail, Boulder, CO 80302',
        lat: 39.9989,
        lng: -105.2828,
        city: 'Boulder',
        country: 'United States',
      },
      messages: [
        {
          id: `msg_2_1_${userId}`,
          sender: 'user',
          timestamp: now - 2 * dayMs - 4 * 3600 * 1000,
          text: 'I find my energy scattered across constant Slack pings, shifting priorities, and reactive firefighting. Even when I deliver, I feel exhausted rather than accomplished.',
        },
        {
          id: `msg_2_2_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 2 * dayMs - 3 * 3600 * 1000,
          text: `Let us turn to Marcus Aurelius and the Stoic **Dichotomy of Control (*Enchiridion*)**:

> *"You have power over your mind - not outside events. Realize this, and you will find strength."*

When you react to every notification, you surrender the sovereignty of your attention to external stimuli. Consider:

1. **The Cost of Context Switching**: Research from Gloria Mark shows it takes ~23 minutes to regain deep focus after a single interruption. 10 pings a day completely disintegrates your cognitive baseline.
2. **Proactive vs Reactive Architecture**: Are your daily priorities defined by your deliberate long-term milestones, or by the unread inbox of other people's emergencies?

*What is the single most vital creative or architectural output you could achieve tomorrow morning if you had 3 unbroken hours of uninterrupted silence?*`,
        },
        {
          id: `msg_2_3_${userId}`,
          sender: 'user',
          timestamp: now - 2 * dayMs - 2 * 3600 * 1000,
          text: 'If I had 3 unbroken hours, I could finish the complete core data model RFC and eliminate three weeks of ambiguous team meetings.',
        },
        {
          id: `msg_2_4_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 2 * dayMs,
          text: `Notice the asymmetric leverage: **3 hours of proactive focus eliminates 15 hours of reactive meetings.**

Let us codify this as a non-negotiable personal boundary:
* **The Golden Window**: 08:30 – 11:30 AM is an asynchronous sanctuary.
* **Communication Batching**: Check communications only at 11:30 AM and 4:30 PM.
* **Energy Invariant**: Guard your attention with the same rigor you apply to database security rules.`,
        },
      ],
    },
    {
      id: `sample_entry_3_${userId}`,
      userId,
      title: 'Product Strategy & Next-Gen AI UX: Zero-Friction Conversational Interfaces',
      summary:
        'Brainstormed novel interaction paradigms combining streaming generative AI with optimistic UI updates and instant spatial context graphs.',
      mode: 'brainstorm',
      tags: ['ProductStrategy', 'AIUX', 'Brainstorm', 'Innovation', 'Design'],
      createdAt: now - 1 * dayMs - 6 * 3600 * 1000,
      updatedAt: now - 1 * dayMs,
      starred: false,
      moodScore: 0.94,
      clarityIndex: 96,
      dominantEmotions: ['Energized', 'Creative', 'Visionary'],
      actionItems: [
        'Build interactive prototype of streaming text with zero layout shifts',
        'Design adaptive prompt cards based on recent reflection mood patterns',
        'Implement 1-click keyboard shortcuts for cognitive mode toggles',
      ],
      extractedGoals: [
        {
          title: 'Design World-Class Generative UI Patterns',
          category: 'Creative Craft',
          milestones: [
            'Prototype micro-animations for Socratic prompt suggestions',
            'Conduct usability testing on zero-clutter canvas layout',
          ],
        },
      ],
      location: {
        placeName: 'Seattle Innovation Studio',
        formattedAddress: 'Westlake Ave N, Seattle, WA 98109',
        lat: 47.6253,
        lng: -122.3378,
        city: 'Seattle',
        country: 'United States',
      },
      messages: [
        {
          id: `msg_3_1_${userId}`,
          sender: 'user',
          timestamp: now - 1 * dayMs - 5 * 3600 * 1000,
          text: 'Most AI journaling apps feel like generic chat widgets. How do we make the experience feel like an intimate, sacred studio for intellectual contemplation and deep personal synthesis?',
        },
        {
          id: `msg_3_2_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 1 * dayMs - 4 * 3600 * 1000,
          text: `To transcend the "generic chatbot" cliché, we must invert traditional conversational UX:

### 1. Spatial Typography & Visual Breathing
* **Serif Headings with High-Contrast Sans Body**: Evokes the feeling of reading a classic literary journal or high-end philosophical manuscript rather than an enterprise CRM.
* **Breathing Auras & Subtle Ambient Dynamics**: Gentle pulsing violet-indigo light states that signal active intellectual listening without distracting flashing loaders.

### 2. Multi-Modal Cognitive Modes
* Replace a blank input box with **5 distinct Cognitive Modes** (Reflect, Brainstorm, Summary, Action Plan, Deep Dive) each equipped with specialized Socratic starter frameworks.

### 3. Progressive Synthesis
* As the user writes, the system continuously distills clarity scores, emotional trajectories, and extracted milestone goals without interrupting the flow of writing.`,
        },
      ],
    },
    {
      id: `sample_entry_4_${userId}`,
      userId,
      title: 'Quarterly Growth Execution Blueprint & Engineering Velocity Milestones',
      summary:
        'Established structured execution roadmap for automated CI/CD canary deployments, weekly architecture reviews, and zero-downtime database migrations.',
      mode: 'action_plan',
      tags: ['Execution', 'Goals', 'Milestones', 'Leadership', 'Productivity'],
      createdAt: now - 18 * 3600 * 1000,
      updatedAt: now - 12 * 3600 * 1000,
      starred: true,
      moodScore: 0.85,
      clarityIndex: 98,
      dominantEmotions: ['Driven', 'Organized', 'Empowered'],
      actionItems: [
        'Configure automated canary rollouts with Prometheus metric gates',
        'Schedule bi-weekly engineering architecture deep dives',
        'Establish automated linting and security audit checks in pre-commit hooks',
      ],
      extractedGoals: [
        {
          title: 'Scale Production Engineering Quality & Velocity',
          category: 'Career & Work',
          milestones: [
            'Zero manual deployment steps in release pipeline',
            'Sub-150ms 99th percentile API response times across core endpoints',
          ],
        },
      ],
      location: {
        placeName: 'Bangalore Tech Park',
        formattedAddress: 'Indiranagar 100ft Road, Bangalore, KA 560038',
        lat: 12.9784,
        lng: 77.6408,
        city: 'Bangalore',
        country: 'India',
      },
      messages: [
        {
          id: `msg_4_1_${userId}`,
          sender: 'user',
          timestamp: now - 16 * 3600 * 1000,
          text: 'We need a concrete quarterly roadmap to increase our team deployment frequency from once a month to multiple automated daily deploys with zero downtime.',
        },
        {
          id: `msg_4_2_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 14 * 3600 * 1000,
          text: `Here is the battle-tested **3-Phase Continuous Delivery Transformation**:

| Phase | Core Objective | Measurable Metric |
|---|---|---|
| **Phase 1 (Weeks 1-4)** | Ephemeral Environments & Pre-commit Safety | CI build time < 4 minutes |
| **Phase 2 (Weeks 5-8)** | Blue/Green & Canary Traffic Shifting | 0 deployment-related downtime |
| **Phase 3 (Weeks 9-12)** | Automated Rollback on SLO Budget burn | Mean time to recover < 2 min |

**Immediate Next Step**: Standardize container build caching and add automated end-to-end integration tests.`,
        },
      ],
    },
    {
      id: `sample_entry_5_${userId}`,
      userId,
      title: 'Weekly Executive Synthesis & Circadian Energy Calibration',
      summary:
        'Synthesized energy highs and lows across the work week. Identified positive correlation between morning sunlight exposure and afternoon cognitive resilience.',
      mode: 'summary',
      tags: ['ExecutiveDigest', 'EnergyManagement', 'WeeklyReview', 'Health'],
      createdAt: now - 6 * 3600 * 1000,
      updatedAt: now - 2 * 3600 * 1000,
      starred: false,
      moodScore: 0.89,
      clarityIndex: 92,
      dominantEmotions: ['Grateful', 'Balanced', 'Centered'],
      actionItems: [
        'Get 15 minutes of natural sunlight before checking any screen in the morning',
        'Take a 20-minute afternoon walk to reset mental cache before strategic work',
        'Maintain 10:30 PM digital sunset to protect deep sleep recovery cycles',
      ],
      extractedGoals: [
        {
          title: 'Optimize Cognitive & Physical Longevity',
          category: 'Mindfulness & Health',
          milestones: [
            'Achieve 85%+ sleep quality average on wearable metrics for 30 consecutive days',
            'Maintain daily 10,000 steps habit paired with audio reflections',
          ],
        },
      ],
      location: {
        placeName: 'Quiet Harbor Study',
        formattedAddress: 'Seaport Blvd, Boston, MA 02210',
        lat: 42.3519,
        lng: -71.0466,
        city: 'Boston',
        country: 'United States',
      },
      messages: [
        {
          id: `msg_5_1_${userId}`,
          sender: 'user',
          timestamp: now - 5 * 3600 * 1000,
          text: 'Summarizing this week: I felt sharp on Tuesday and Wednesday, but Thursday afternoon had a significant energy crash. What was the differentiator?',
        },
        {
          id: `msg_5_2_${userId}`,
          sender: 'gemini',
          modelUsed: 'gemini-3.6-flash',
          timestamp: now - 4 * 3600 * 1000,
          text: `Analyzing your past log patterns and biological energy correlations:

1. **Tuesday & Wednesday**: You walked outside at 7:45 AM, delayed caffeine intake by 90 minutes after waking, and completed your hardest technical task before lunch.
2. **Thursday**: You woke up, immediately scrolled phone notifications in bed, and scheduled back-to-back 45-minute meetings from 1 PM to 4 PM without cognitive transition buffer.

**The Synthesis**: Your energy crash was caused by **meeting compression without recovery buffers** combined with premature morning screen exposure. Prioritize 10-minute buffer gaps between high-stakes discussions.`,
        },
      ],
    },
  ];
}

/**
 * Returns sample companion goals for the user.
 */
export function getSampleGoals(userId: string): GoalItem[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: `goal_1_${userId}`,
      userId,
      title: 'Master Event-Driven Distributed Architectures',
      description: 'Design, benchmark, and deploy resilient asynchronous microservices with transactional outbox patterns and distributed telemetry.',
      category: 'Career & Work',
      timeframe: 'Quarterly',
      status: 'active',
      progress: 65,
      createdAt: now - 14 * dayMs,
      updatedAt: now - 3 * dayMs,
      milestones: [
        { id: `m1_${userId}`, title: 'Benchmark transactional outbox message lag', completed: true },
        { id: `m2_${userId}`, title: 'Draft RFC for cross-service idempotency enforcement', completed: true },
        { id: `m3_${userId}`, title: 'Conduct end-to-end chaos engineering fault drills', completed: false, estimatedMinutes: 120 },
        { id: `m4_${userId}`, title: 'Publish internal engineering playbook & best practices', completed: false, estimatedMinutes: 90 },
      ],
      targetDate: '2026-10-31',
    },
    {
      id: `goal_2_${userId}`,
      userId,
      title: 'Cultivate High-Leverage Daily Focus Rhythm',
      description: 'Guard 3-hour morning deep work blocks with zero notifications and structured evening retrospectives.',
      category: 'Personal Growth',
      timeframe: 'Monthly',
      status: 'active',
      progress: 80,
      createdAt: now - 10 * dayMs,
      updatedAt: now - 2 * dayMs,
      milestones: [
        { id: `m2_1_${userId}`, title: 'Maintain unbroken 3-hour morning deep focus for 14 days', completed: true },
        { id: `m2_2_${userId}`, title: 'Conduct daily evening retrospective in MindVault', completed: true },
        { id: `m2_3_${userId}`, title: 'Complete monthly cognitive trajectory review', completed: false, estimatedMinutes: 45 },
      ],
      targetDate: '2026-09-30',
    },
    {
      id: `goal_3_${userId}`,
      userId,
      title: 'Optimize Cognitive & Physical Longevity',
      description: 'Align circadian rhythms with morning sunlight, zone-2 cardiovascular training, and disciplined digital sunsets.',
      category: 'Mindfulness & Health',
      timeframe: 'Long-term',
      status: 'active',
      progress: 50,
      createdAt: now - 20 * dayMs,
      updatedAt: now - 1 * dayMs,
      milestones: [
        { id: `m3_1_${userId}`, title: 'Achieve 85%+ sleep quality average on wearable metrics', completed: true },
        { id: `m3_2_${userId}`, title: '15-minute morning natural sunlight protocol before screen usage', completed: true },
        { id: `m3_3_${userId}`, title: 'Weekly 90-minute zone-2 trail run / mountain hike', completed: false, estimatedMinutes: 90 },
      ],
      targetDate: '2026-12-31',
    },
  ];
}

/**
 * Returns sample companion AI Memories for the user.
 */
export function getSampleMemories(userId: string): AIMemoryItem[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return [
    {
      id: `mem_1_${userId}`,
      userId,
      category: 'Core Value',
      key: 'intellectual_rigor',
      statement: 'Prioritizes first-principles reasoning and explicit architectural tradeoffs over surface-level convenience.',
      confidence: 96,
      isActive: true,
      createdAt: now - 14 * dayMs,
      updatedAt: now - 3 * dayMs,
    },
    {
      id: `mem_2_${userId}`,
      userId,
      category: 'Recurring Pattern',
      key: 'peak_morning_energy',
      statement: 'Cognitive acuity and deep architectural thinking peak during morning hours (08:30 - 11:30 AM).',
      confidence: 94,
      isActive: true,
      createdAt: now - 10 * dayMs,
      updatedAt: now - 2 * dayMs,
    },
    {
      id: `mem_3_${userId}`,
      userId,
      category: 'Communication Preference',
      key: 'socratic_and_structured',
      statement: 'Responds best to Socratic questions paired with structured matrices and concise actionable synthesis.',
      confidence: 98,
      isActive: true,
      createdAt: now - 7 * dayMs,
      updatedAt: now - 1 * dayMs,
    },
  ];
}

/**
 * Persists sample journals, companion goals, and AI memory items for the given user.
 */
export async function seedSampleDataForUser(userId: string): Promise<{
  entries: ReflectionEntry[];
  goals: GoalItem[];
  memories: AIMemoryItem[];
}> {
  if (!userId) {
    throw new Error('Valid userId is required to populate sample journals.');
  }

  const sampleEntries = getSampleJournals(userId);
  const sampleGoals = getSampleGoals(userId);
  const sampleMemories = getSampleMemories(userId);

  // Persist entries to Firestore / local vault
  for (const entry of sampleEntries) {
    await saveUserEntry(userId, entry);
  }

  // Persist goals
  for (const goal of sampleGoals) {
    await saveUserGoal(userId, goal);
  }

  // Persist memories
  for (const memory of sampleMemories) {
    await saveAIMemory(userId, memory);
  }

  return {
    entries: sampleEntries,
    goals: sampleGoals,
    memories: sampleMemories,
  };
}
