# ReflectAI — Secure AI Journal & Reflection Partner

ReflectAI is a user-authenticated, full-stack reflection and journaling companion. It combines the reasoning and conversational capabilities of **Gemini 3.6 Flash** with the real-time, isolated document storage of **Cloud Firestore** and **Firebase Authentication**.

---

## Architecture & Security Highlights

1. **User Identity & Access Control**: Federated Google Sign-In via Firebase Auth. No raw passwords or email credentials are handled or stored by the application.
2. **User-Isolated Storage**: All reflections, chat turns, and summaries are persisted under `/users/{userId}/entries/{entryId}` and `/users/{userId}/interactions/{interactionId}` collections. Security rules reject cross-user access attempts (`request.auth.uid == userId`).
3. **Resilient AI Fallback Ladder**: The Express backend proxies calls to `@google/genai` using a multi-model fallback chain (`gemini-3.6-flash` → `gemini-3.1-flash-lite` → `gemini-flash-latest` → `gemini-3.7-flash`) to gracefully recover from transient API limits or unavailability.
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

---

## 2. Secret Management Setup

Create and store the `GEMINI_API_KEY` secret securely in Google Cloud Secret Manager:

```bash
# Create the secret definition
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"

# Inject your Gemini API Key
echo -n "YOUR_GEMINI_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# Grant the Cloud Run default compute service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Cloud Firestore Security Rules

Deploy the strict user-isolation security rules (`firestore.rules`):

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
    }
  }
}
```

To deploy via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

## 4. Cloud Run Deployment

Build and deploy the application container to Google Cloud Run:

```bash
# Deploy service to Cloud Run
gcloud run deploy reflect-ai \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --port 3000
```

---

## 5. Verification Binding & Campaign Label

Apply the required challenge verification label to your Cloud Run service:

```bash
gcloud run services update reflect-ai \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 6. Local Development

To run the application locally:

```bash
# Install dependencies
npm install

# Start Express server + Vite development middleware on port 3000
npm run dev
```

Visit `http://localhost:3000` to interact with your secure AI reflection companion.
