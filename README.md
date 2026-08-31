# SHRUTI — Sacred Sound, Discourses & Contemplation

SHRUTI is a production-ready digital listening space and audio archive platform designed for long-form spiritual discourses, meditation audio, philosophical talks, Indian classical music, audiobooks, and wisdom recordings.

---

## 🎨 Visual Identity & Artwork System

1. **Editorial Architecture**:
   - Deep obsidian surfaces (`#0A0A0C`), warm ivory text (`#F5F2EB`), and subtle saffron/warm amber accents (`#D97706`).
   - Timeless serif typography (`Cinzel`, `Playfair Display`, `Georgia`) paired with clean sans-serif UI typography (`Inter`).
2. **Coherent Series Cover Inheritance**:
   - Every multi-part series (e.g. *Krishna Smriti*) shares **ONE deliberate, archival cover image** across all its parts/episodes.
   - Artwork hierarchy:
     1. Track-level explicit cover (if intentionally specified)
     2. Parent Series cover image (shared by all episodes/parts)
     3. Artist / Speaker portrait
     4. Archival fallback cover
3. **Audio-First Spoken Word Priority**:
   - Clear display of Title, Speaker, Series, Part/Episode Number, Duration, and Resume Position.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` or `.env.local` and add your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

---

## 🔐 Security Rules

- **Firestore**: Deploy rules using `firebase deploy --only firestore:rules` (defined in `firestore.rules`).
- **Storage**: Deploy storage rules using `firebase deploy --only storage` (defined in `storage.rules`).
