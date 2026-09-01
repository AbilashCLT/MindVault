# MindVault — Secure AI Reflection Partner & Cognitive Journal

MindVault is an enterprise-grade, user-authenticated, full-stack reflection and mindful journaling companion. It combines the reasoning and conversational capabilities of **Gemini 3.6 Flash** with the real-time, zero-leak document isolation of **Cloud Firestore** and **Firebase Authentication**.

---

## Architecture & Security Highlights

1. **User Identity & Access Control**: Federated Google Sign-In via Firebase Auth. No raw passwords or email credentials are ever handled or stored in application custom code.
2. **User-Isolated Storage**: All reflections, chat turns, goals, daily plans, and AI memories are persisted under `/users/{userId}/...` paths. Security rules enforce strict ABAC ownership checks (`request.auth.uid == userId`).
3. **Resilient AI Fallback Ladder**: The Express backend proxies calls to `@google/genai` using a multi-model fallback chain (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`) to gracefully recover from transient API limits or network drops.
4. **Zero Key Exposure**: Client applications never touch the `GEMINI_API_KEY`; all AI inferences are handled via server-side endpoints with defensive payload sanitization and undefined-stripping.

---

## 1. Prerequisites & GCP Services

Enable the necessary Google Cloud services in your target project:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  cloudbuild.googleapis.com
```

Ensure you have installed the [Google Cloud SDK (`gcloud`)](https://cloud.google.com/sdk/docs/install) and [Firebase CLI](https://firebase.google.com/docs/cli).

---

## 2. Secret Management Setup

Create and store the `GEMINI_API_KEY` secret securely in Google Cloud Secret Manager, and grant the Cloud Run runtime service account accessor permissions:

```bash
# Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the default Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Database Security Configuration & Firestore Rules

Deploy the strict user-isolation security rules (`firestore.rules`) to guarantee that users cannot read or modify any other user's journal entries:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /interactions/{interactionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /entries/{entryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /reflections/{reflectionId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /goals/{goalId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /daily_plans/{planId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /settings/{settingId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /ai_memories/{memoryId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /system/{document=**} {
      allow read: if request.auth != null && (
        request.auth.token.email == 'abilashcalicut8@gmail.com' ||
        request.auth.token.role == 'admin'
      );
      allow write: if request.auth != null;
    }
  }
}
```

Deploy the rules using the Firebase CLI:

```bash
firebase deploy --only firestore:rules
```

---

## 4. Cloud Run Deployment Flow

Build and deploy the application container to Google Cloud Run:

```bash
# Deploy service to Cloud Run with Secret Manager environment injection
gcloud run deploy mindvault \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-labels="dev-tutorial=cloud-run-ai-challenge" \
  --port 3000
```

---

## 5. Required Campaign Labeling (Automated Verification)

> **Reminder: Don't forget the Cloud Run label `dev-tutorial=cloud-run-ai-challenge` — required for automated challenge verification.**

If updating an already-deployed service, apply the mandatory resource label with:

```bash
gcloud run services update mindvault \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

To verify that the label has been successfully applied to your service:

```bash
gcloud run services describe mindvault \
  --region=us-central1 \
  --format="value(metadata.labels)"
```

---

## 6. Local Development & Verification

To run the application locally in development mode:

```bash
# Install dependencies
npm install

# Start Express backend + Vite client middleware on port 3000
npm run dev
```

Open `http://localhost:3000` to interact with your secure AI reflection companion.

