# TYPEVERSE AI - Setup & Integration Guide

## 1. Connecting to Real Database (MongoDB)

To make user profiles, scores, and leaderboards work permanently, you need a MongoDB database.

### Step 1: Create a MongoDB Cluster
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up.
2. Create a **Shared (Free)** cluster.
3. In **Security > Database Access**, create a user (e.g., `admin`) and password.
4. In **Security > Network Access**, allow access from anywhere (`0.0.0.0/0`) for development.

### Step 2: Get Connection String
1. Click **Connect** on your cluster.
2. Choose **Drivers** (Node.js).
3. Copy the string. It looks like:
   `mongodb+srv://admin:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority`

### Step 3: Configure Environment
1. Open `.env.local` in your project.
2. Paste the URI (replace `<password>` with your real password).
   ```env
   MONGODB_URI=mongodb+srv://admin:yourpassword@cluster0.abcde.mongodb.net/typeverse?retryWrites=true&w=majority
   ```
3. Restart the server (`npm run dev`).

---

## 2. Authentication with Firebase

To allow real Google/Email login:

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/).
2. Add a new project "Typeverse".
3. Keep Analytics enabled or disabled (your choice).

### Step 2: Enable Auth
1. Go to **Build > Authentication**.
2. Click **Get Started**.
3. Enable **Google** and **Email/Password** providers.

### Step 3: Get Config
1. Go to **Project Settings** (gear icon).
2. Scroll to "Your apps" and create a **Web app**.
3. Copy the `firebaseConfig` keys into `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=typeverse.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=typeverse
   ...
   ```

---

## 3. Monetization (Ads)

AdMob is primarily for mobile apps (iOS/Android). For this web application, you should use **Google AdSense**.

### Step 1: Sign up for AdSense
1. Go to [Google AdSense](https://adsense.google.com/).
2. Add your site URL (when deployed).

### Step 2: Add Ad Component
We have created a placeholder `AdComponent`. When you have your AdSense Client ID:

1. Open `src/components/features/ads/AdBanner.tsx` (create this if needed).
2. Insert your generic ad code script.

**Example `AdBanner.tsx` Component:**
```tsx
import { useEffect } from 'react';

export default function AdBanner() {
  useEffect(() => {
     try {
       (window.adsbygoogle = window.adsbygoogle || []).push({});
     } catch (err) { console.error(err); }
  }, []);

  return (
    <div style={{ margin: '2rem 0', textAlign: 'center' }}>
       <ins className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-YOUR_ID_HERE"
          data-ad-slot="1234567890"
          data-ad-format="auto"
          data-ad-full-width-responsive="true"></ins>
    </div>
  );
}
```

---

## 4. Deployment

To go live:

1. Push code to GitHub.
2. Sign up on [Vercel](https://vercel.com/).
3. Import your repository.
4. Add your Environment Variables (MONGODB_URI, FIREBASE_*, etc.) in Vercel settings.
5. Click **Deploy**.
