# MindVault: Comprehensive User Guide & Navigation Manual

Welcome to **MindVault** — your enterprise-grade **AI Cognitive Sanctuary & Growth Companion** engineered on Google Cloud Run and powered by Gemini 3.6 Flash.

This guide walks you through every view, workflow, and intelligent capability within MindVault so you can maximize your personal reflection, strategic momentum, and cognitive clarity.

---

## 🗺️ Quick Navigation Map

MindVault organizes your thoughts into seven core interconnected spaces, accessible via the top navigation bar:

```
┌─────────────┬───────────────────────────────────────────────────────────────────┐
│ View        │ Primary Purpose & Key Workflows                                   │
├─────────────┼───────────────────────────────────────────────────────────────────┤
│ 🏛️ Sanctuary│ Executive dashboard: Daily Spark, Mood & Clarity Trends, Digest   │
│ ✍️ Reflect  │ Interactive Socratic Canvas, Voice-to-Text, Google Maps Geotagging│
│ 🎯 Goals    │ Strategic aspiration breakdown, milestone tracker, progress bars  │
│ 📅 Planner  │ Energy-aligned daily time blocks (deep work, meetings, wellness)  │
│ 🧠 AI Memory│ Curated long-term core values, cognitive habits, and themes       │
│ 🔍 Vault RAG│ Semantic search & private QA over your past journal entries       │
│ ✨ Patterns │ Longitudinal cognitive graphs, mood trajectories, topic clusters  │
│ ⚙️ Settings │ AI persona customization, Zero-Disk mode, Email notification hub  │
│ 👑 Admin    │ RBAC telemetry, OWASP threat simulator, Cloud Run health metrics  │
└─────────────┴───────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started (Your First 5 Minutes)

### 1. Sign In via Google Identity
- Click **"Sign In with Google"** on the landing page.
- MindVault uses **Firebase Federated Authentication**, meaning you never have to create or store a password. Your session is cryptographically bound to your Google account `uid`.

### 2. Creating Your First Reflection
1. Click **"+ New Thought"** in the top navigation bar or **"Start Fresh Reflection"** on the home dashboard.
2. Choose your reflection mode from the top picker:
   - **Open Reflection** (freeform expressive writing)
   - **Clarity / Decision** (structured trade-off evaluation)
   - **Gratitude / Presence** (mindfulness & emotional grounding)
   - **Stoic Deconstruction** (resilience & perspective reframing)
   - **Energy & Focus** (daily momentum & vitality assessment)
3. **Record or Type:** Use the keyboard or click the **Microphone icon (🎙️)** to speak your thoughts via speech-to-text.
4. **Tag Your Location (Optional):** Click **"+ Location"** to tag your physical environment (e.g., *Home Sanctuary*, *Quiet Cafe*, *Nature Trail*) using dark-themed **Google Maps**.
5. **Trigger Socratic AI Synthesis:** Click **"Synthesize Clarity"** (or press `Cmd+Enter`). Gemini 3.6 Flash analyzes your reflection and generates:
   - Executive Overview & Sentiment Spectrum
   - Actionable Takeaways & Cognitive Blindspots
   - Socratic Challenge Question for multi-turn interactive dialogue

---

## ✍️ Deep Dive: The Reflection Canvas

### Socratic AI Multi-Turn Dialogue
Unlike passive text journals, MindVault features an interactive AI conversational companion in the right-hand panel:
- Type your answers to Gemini's probing questions to explore root causes and hidden assumptions.
- Each exchange is preserved with the reflection record in Cloud Firestore.

### Physical Geotagging with Google Maps
- Tagging your environment enriches your thoughts with mindful spatial context.
- Choose between one-tap presets (*Home Sanctuary*, *Coffee Shop*, *Nature Trail*, *Creative Studio*) or click **"Detect My Location"** for browser GPS coordinates.
- Drag the map pin freely to fine-tune your sanctuary location.

### Zero-Disk Private Mode
- Toggle **Zero-Disk Session** in Settings or Reflection options.
- In Zero-Disk mode, your reflections stay purely in browser volatile memory (RAM) and are wiped cleanly upon tab close without touching Cloud Firestore.

---

## 🎯 Turning Insights into Execution

### 1. Strategic Goals & Milestones (`/goals`)
- Gemini automatically extracts strategic ambitions from your reflections and suggests structured goals.
- You can also manually create goals categorized by timeframe:
  - **Short-Term Sprint** (1–4 weeks)
  - **Quarterly Milestone** (1–3 months)
  - **North Star Vision** (6–12 months)
- As you complete milestones, progress bars update automatically and an email alert is dispatched to your configured recipient address.

### 2. Energy-Aligned Daily Planner (`/planner`)
- Traditional calendars schedule tasks based only on clock time. MindVault's Daily Planner matches tasks to your **Energy Levels (1–5)**:
  - **Deep Focus Blocks** scheduled during your peak mental clarity hours.
  - **Collaborative / Meeting Blocks** scheduled for moderate energy periods.
  - **Mindful Recovery Blocks** for low-energy phases.
- Click **"AI Suggest Daily Schedule"** to let Gemini generate an optimized daily agenda based on your recent reflections and uncompleted milestones.

---

## 🧠 Memory, Search & Long-Term Discovery

### 1. AI Memory Bank (`/memory`)
- As you journal, MindVault automatically synthesizes core values, emotional patterns, and behavioral tendencies into persistent AI memories.
- You can pin vital memories, edit observations, or delete outdated items.
- Active memories are seamlessly injected into Gemini's context window to provide personalized, hyper-relevant guidance.

### 2. Ask Vault: Grounded Semantic Search (`/ask`)
- Query your entire personal archive with natural language questions:
  - *"What were my main sources of anxiety last month?"*
  - *"How did I resolve the decision between project A and project B?"*
  - *"What patterns appear whenever I feel low on energy?"*
- Gemini answers strictly using your past reflections as verifiable grounding with zero hallucination.

### 3. Cognitive Pattern Finder (`/patterns`)
- Visualize interactive charts representing:
  - Clarity Score trends over time
  - Mood spectrum distribution (Joy, Resolve, Calm, Fatigue, Anxiety)
  - Recurring semantic themes and frequency word clouds

---

## 📧 Email Notifications & Executive Digests

MindVault keeps you connected to your insights even when you are away from the app.

### Setting Up Your Email Destination
1. Navigate to **Settings** (`/settings`) &rarr; **Email Notifications** tab.
2. Enter your preferred email address (defaults to your authenticated Google account email).
3. Test your connection by clicking **"Send Test Digest Email"**.

### Email Features & One-Click Launchers
Whenever a digest or alert is triggered:
- **Direct Gmail Web Launcher:** Click **"Open in Gmail"** to open a pre-composed message in Gmail Web ready to review or send.
- **Native Mail App Launcher:** Click **"Open in Mail App"** to open your device's default mail client (Apple Mail, Outlook, Thunderbird).
- **Interactive Dispatch Modal:** View full visual HTML rendering, copy plain text, or inspect raw template markup.
- **Home Screen Dispatch:** Click **"Email Digest"** on the Sanctuary dashboard to instantly dispatch your daily cognitive executive summary.

---

## 🛡️ Security, Privacy & Administration

### Zero-Trust User Data Isolation
- All your reflections, goals, daily plans, and memories reside under `/users/{userId}/...` in Google Cloud Firestore.
- Firestore Security Rules strictly enforce that only your authenticated token can read or write your records (`request.auth.uid == userId`).

### Administrator Console (`/admin`)
- Accessible to authorized administrator accounts.
- View live latency telemetry across all Gemini AI endpoints.
- Monitor API quota usage and system uptime.
- Run interactive OWASP threat simulation tests (SSRF, NoSQL Injection, Indirect Prompt Injection, Header Tampering).

---

## ⌨️ Keyboard Shortcuts & Productivity Tips

| Action | Shortcut |
| :--- | :--- |
| **Synthesize Reflection** | `Cmd + Enter` / `Ctrl + Enter` |
| **Quick Save Draft** | `Cmd + S` / `Ctrl + S` |
| **Navigate to Sanctuary** | Click logo or press `Home` |
| **Start New Reflection** | `Cmd + Shift + N` / Click `+ New Thought` |

---

## ❓ Frequently Asked Questions (FAQ)

**Q: Is my journal data used to train AI models?**  
**A:** No. MindVault uses enterprise Google Cloud Gemini API routes with strict server-side proxying. Your reflections are never used to train public models.

**Q: What happens if an AI request fails or times out?**  
**A:** MindVault features an automated 4-tier model fallback ladder (`gemini-3.6-flash` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-flash-latest` &rarr; `gemini-3.7-flash`). If one model reaches a quota limit, the system automatically falls back to the next available tier without interrupting your workflow.

**Q: How do I export or backup my reflections?**  
**A:** Navigate to **Settings** &rarr; **Privacy & Security** &rarr; **Export Vault Archive**. You can download a complete JSON archive of all your reflections, memories, and goals at any time.
