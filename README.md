# SHRUTI — Sacred Sound, Discourses & Contemplation

> **Listen. Discover. Return.**  
> A production-ready, editorial audio listening sanctuary and archive platform.

---

## 1. Project Overview & Philosophy

**SHRUTI** is connected with listening, sound, music, voice, and the Indian tradition of receiving timeless knowledge through listening.

### Core Capabilities:
- **Calm, Human-Designed Aesthetic**: Deep obsidian surfaces, warm ivory typography, and restrained warm saffron/amber accents.
- **Universal Architecture**: Generic support for spiritual talks (e.g. Osho *Krishna Smriti* discourses), meditation guides, Bhagavad Gita reflections, Indian classical ragas, audiobooks, podcasts, and philosophical dialogues.
- **Dual-Tier Audio Player**: Sticky desktop playback dock and mobile mini-player + full-screen immersive listening view.
- **Cross-Device State Sync**: Pick up listening on mobile right where you stopped on desktop with throttled Firestore persistence.
- **Zero-Friction Browsing**: Public browsing, discovery, and playback for guest users with seamless cloud merge upon sign-in.

---

## 2. Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google Sign-In & Email/Password)
- **Database**: Cloud Firestore
- **Media Storage**: Firebase Storage
- **Audio Engine**: HTML5 Audio API + MediaSession API
- **Deployment**: Vercel

---

## 3. Getting Started (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your Firebase project web credentials (see Firebase setup below).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Firebase Setup Guide

Follow these steps in the [Firebase Console](https://console.firebase.google.com/):

### Step 1: Create Project & Register Web App
1. Create a new Firebase project (e.g., `shruti-audio-prod`).
2. Add a **Web App** (`</>`) and copy the `firebaseConfig` keys into `.env.local`.

### Step 2: Enable Authentication
1. Navigate to **Authentication $\rightarrow$ Sign-in method**.
2. Enable **Google** (configure support email).
3. Enable **Email/Password**.

### Step 3: Create Firestore Database
1. Navigate to **Firestore Database $\rightarrow$ Create Database** (Production mode).
2. Deploy the rules from `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /audio/{audioId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /series/{seriesId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /artists/{artistId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Step 4: Create Firebase Storage Bucket
1. Navigate to **Storage $\rightarrow$ Get Started** (Production mode).
2. Deploy the security rules from `storage.rules`:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /audio/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    match /covers/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 5. Storage Hierarchy & Naming Conventions

All media assets follow predictable lowercase kebab-case naming:

```
gs://<bucket-name>/
├── audio/
│   ├── discourses/
│   │   └── osho/
│   │       ├── krishna-smriti-01.mp3
│   │       ├── krishna-smriti-02.mp3
│   │       └── krishna-smriti-03.mp3
│   ├── meditation/
│   │   └── mindfulness-breath-01.mp3
│   └── music/
│       └── morning-raga-01.mp3
└── covers/
    ├── series/
    │   └── krishna-smriti.webp
    ├── artists/
    │   └── osho.webp
    └── tracks/
        └── krishna-smriti-01.webp
```

---

## 6. Content Ingestion & Admin Portal

Access the ingestion portal at:
```
/admin
```

### Ingestion Workflow:
1. Prepare legally verified audio files (e.g. `krishna-smriti-01.mp3`).
2. Open `/admin` and select the audio file and cover image.
3. Provide Title, Subtitle, Speaker, Series, Category, and Duration in seconds.
4. Click **Validate & Publish Recording**.

---

## 7. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Space` | Play / Pause |
| `←` (Left Arrow) | Skip backward 15 seconds |
| `→` (Right Arrow) | Skip forward 30 seconds |
| `M` | Toggle Mute |
| `N` | Play Next Track in Queue |
| `P` | Play Previous Track in Queue |
| `⌘ + K` / `Ctrl + K` | Open Global Search Modal |

---

## 8. Deployment to Vercel

1. Push your repository to GitHub (manually or via CLI).
2. Import the project in [Vercel](https://vercel.com).
3. In **Project Settings $\rightarrow$ Environment Variables**, add:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
4. Click **Deploy**.

---

## 9. Verification & Quality Checks

Run lint and build verification commands locally:

```bash
# Check code hygiene and linting
npm run lint

# Compile Next.js production build
npm run build
```

