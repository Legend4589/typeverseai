# TYPEVERSE AI - Deployment & Monetization

## 1. Deploying to get a Website URL
To use Google AdSense, you must have a live website URL (e.g., `https://your-app.vercel.app`). You cannot verify `localhost`.

### Step 1: Push to GitHub
1. Create a repository on [GitHub.com](https://github.com/new).
2. Run these commands in your VS Code terminal:
   ```bash
   git init
   git add .
   git commit -m "Ready for deploy"
   git branch -M main
   # Replace with your actual repository URL
   git remote add origin https://github.com/YOUR_USERNAME/typeverse-ai.git
   git push -u origin main
   ```

### Step 2: Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com/signup) and sign up with GitHub.
2. Click **"Add New..."** > **"Project"**.
3. Import your `typeverse-ai` repository.
4. **Environment Variables**: Open `.env.local` on your computer and copy the values into Vercel's "Environment Variables" section:
   - `MONGODB_URI`
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - (Add all other Firebase keys)
5. Click **Deploy**.

### Step 3: Get Your URL
Once deployed, Vercel will give you a domain like:
`https://typeverse-ai-tau.vercel.app`

---

## 2. Setting up Google AdSense

Now that you have your URL:

1. Go to [Google AdSense](https://adsense.google.com/).
2. Click **Get Started**.
3. Enter your new Vercel URL (e.g., `https://typeverse-ai-tau.vercel.app`).
4. Google will give you a **Publisher ID** (e.g., `ca-pub-1234567890`).

### Step 4: Add Ads to Your Code
1. Open `src/components/features/ads/AdBanner.tsx`.
2. Uncomment the production code block.
3. Replace `YOUR_CLIENT_ID` with your new Publisher ID.
4. Commit and push the changes to GitHub. Vercel will automatically redeploy.

## 3. Verify Database
Your live app will connect to the same MongoDB Atlas cluster you set up. User profiles and scores will now be saved permanently!
