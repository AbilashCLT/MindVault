# MindVault: Video Walkthrough Production Guide & Storyboard

This production guide accompanies the rendered **60-second high-definition walkthrough video** (`mindvault_walkthrough.mp4`).

- **Video File Locations:** 
  - `/assets/mindvault_walkthrough.mp4`
  - `/mindvault_walkthrough.mp4`
- **Resolution:** 1280 × 720 (720p HD, 16:9 widescreen)
- **Framerate:** 25 fps
- **Video Codec:** H.264 (libx264, yuv420p)
- **Duration:** Exactly 60.00 seconds (10 structured scenes × 6.0s with cross-fade transitions)

---

## 🎬 Video Storyboard & Voiceover Narration Script

```
Timeline: 0:00 ─── 0:06 ─── 0:12 ─── 0:18 ─── 0:24 ─── 0:30 ─── 0:36 ─── 0:42 ─── 0:48 ─── 0:54 ─── 1:00
Scenes:    [S1]    [S2]    [S3]    [S4]    [S5]    [S6]    [S7]    [S8]    [S9]    [S10]
           Intro   Auth    Home    Reflect Goals   Planner Memory  Charts  SecOps  Outro
```

---

### Scene 1 (0:00 - 0:06): Overview & Cloud Architecture
* **Visual:** Dark-themed MindVault header, Google Cloud Run status badge, Gemini 3.6 Flash indicator, and three foundational pillars (Cloud Run, Gemini API, Firestore).
* **On-Screen Text:** *MindVault: AI Cognitive Sanctuary • Engineered on Google Cloud Run with Gemini 3.6 Flash*
* **Voiceover (VO):** 
  > *"Welcome to MindVault—an AI Cognitive Sanctuary engineered on Google Cloud Run for the Cloud Run AI Challenge. Powered by Gemini 3.6 Flash, MindVault bridges deep reflection with daily strategic execution."*

---

### Scene 2 (0:06 - 0:12): Zero-Password Onboarding & User Isolation
* **Visual:** Firebase Federated Google Sign-In card, ABAC database partitioning (`/users/{uid}`), and instant guest exploration badge.
* **On-Screen Text:** *1. Zero-Password Frictionless Onboarding • Federated Google Identity & ABAC Isolation*
* **Voiceover (VO):** 
  > *"Onboarding is completely frictionless and password-free. Firebase Federated Authentication issues cryptographically verified tokens that isolate user data into private Firestore partitions with zero credential leak risks."*

---

### Scene 3 (0:12 - 0:18): The Executive Sanctuary Dashboard
* **Visual:** Daily Stoic Spark banner, Clarity & Emotional Balance index meter (88/100 Optimal), recent journal stream, and 1-click action triggers.
* **On-Screen Text:** *2. The Executive Sanctuary Dashboard • Daily Spark, Clarity Index & Unified Action Hub*
* **Voiceover (VO):** 
  > *"The Sanctuary dashboard greets you with a rotating morning Stoic spark, your real-time mental clarity score, and single-click access to new reflections, daily plans, and executive digests."*

---

### Scene 4 (0:18 - 0:24): The Socratic Reflection Canvas
* **Visual:** 5 cognitive modes (Open, Clarity, Gratitude, Stoic, Energy), real-time speech-to-text dictation, dark-themed Google Maps spatial geotagging, and the Socratic challenge panel.
* **On-Screen Text:** *3. The Socratic Reflection Canvas • Multi-Turn Dialogue, Voice-to-Text & Google Maps*
* **Voiceover (VO):** 
  > *"Type or speak your thoughts with voice transcription, tag your sanctuary location on Google Maps, and let Gemini 3.6 synthesize emotional sentiment, blind spots, and probing Socratic challenge questions in multi-turn dialogue."*

---

### Scene 5 (0:24 - 0:30): Strategic Goals & Execution Engine
* **Visual:** Automated aspiration extraction, three time horizons (Sprints, Milestones, North Star Visions), and animated milestone progress bars with email dispatch triggers.
* **On-Screen Text:** *4. Strategic Goals & Execution Engine • Translating Journal Insights into Concrete Milestones*
* **Voiceover (VO):** 
  > *"MindVault doesn't let insights fade away. Gemini automatically identifies strategic aspirations inside your journal entries, decomposing them into trackable milestones across sprint and quarterly horizons."*

---

### Scene 6 (0:30 - 0:36): Energy-Aligned Daily Planner
* **Visual:** Circadian energy scale (1–5), Deep Focus blocks (Energy 5), collaborative meeting blocks, protected recovery windows, and the 'AI Suggest Schedule' trigger.
* **On-Screen Text:** *5. Energy-Aligned Daily Planner • Time-Blocking Calibrated to Circadian Energy Levels*
* **Voiceover (VO):** 
  > *"Instead of scheduling tasks by arbitrary clock hours, the Daily Planner aligns demanding focus work with your peak circadian energy windows, protecting restorative breaks to prevent cognitive burnout."*

---

### Scene 7 (0:36 - 0:42): AI Memory Bank & Semantic 'Ask Vault'
* **Visual:** Curated cognitive habits cards, active memory injection badges, and natural language semantic retrieval over private journal archives.
* **On-Screen Text:** *6. AI Memory Bank & Semantic 'Ask Vault' • Compounding Memory & Zero-Hallucination Search*
* **Voiceover (VO):** 
  > *"MindVault grows with you. The AI Memory Bank distills your core values and habits, while 'Ask Vault' lets you query your past reflections conversationally with 100% verifiable journal grounding and zero hallucination."*

---

### Scene 8 (0:42 - 0:48): Longitudinal Cognitive Pattern Finder
* **Visual:** Interactive Recharts clarity trajectory line graph, affective emotional spectrum radar (Calm, Resolve, Joy, Fatigue), and semantic word-frequency attention clusters.
* **On-Screen Text:** *7. Longitudinal Cognitive Pattern Finder • Visualizing Clarity, Radars & Topic Clusters*
* **Voiceover (VO):** 
  > *"Visualize your mental equilibrium through interactive Recharts analytics: track your clarity trajectory over months, observe emotional balance shifts, and inspect recurring topic clusters."*

---

### Scene 9 (0:48 - 0:54): Enterprise Security & Cloud Run Health
* **Visual:** 4-tier model fallback ladder (3.6-flash &rarr; 3.1-lite &rarr; flash-latest &rarr; 3.7), OWASP threat simulator testing, dynamic Secret Manager key injection, and Cloud Run latency percentiles.
* **On-Screen Text:** *8. Enterprise Security & Cloud Run Health • 4-Tier Model Fallback & OWASP Threat Defense*
* **Voiceover (VO):** 
  > *"Built with enterprise rigor: a 4-tier model fallback ladder guarantees continuous uptime, dynamic Secret Manager key injection protects credentials, and live OWASP threat simulations safeguard user privacy."*

---

### Scene 10 (0:54 - 1:00): Conclusion & Call to Action
* **Visual:** MindVault logo, closing value propositions (Daily Socratic Inquiry, Actionable Execution, Zero-Trust Privacy), and Google Cloud Run AI Challenge campaign attribution.
* **On-Screen Text:** *MindVault: Your Thoughts. Your Space. • Built for the Google Cloud Run AI Challenge*
* **Voiceover (VO):** 
  > *"Transform raw daily thoughts into lasting clarity and actionable momentum. Experience MindVault—your private AI cognitive sanctuary engineered on Google Cloud."*

---

## 🛠️ Reproduction & Regeneration Command

To re-render the video at any time with custom durations or modifications, execute:

```bash
python3 /tmp/generate_walkthrough_video_clean.py
```

The resulting video file is saved to `/assets/mindvault_walkthrough.mp4` and `/mindvault_walkthrough.mp4`.
