# 🚀 Deploying Campus Skill Connect Frontend on Vercel

This guide walks you through deploying the **Vite + React frontend** to **Vercel**.

---

## 📋 Prerequisites

1. **Vercel Account**: Sign up or log in at [vercel.com](https://vercel.com).
2. **Live Backend URL**: Ensure your backend is deployed at:
   ```
   https://cskbackend.vercel.app
   ```

---

## 🛠️ Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Code to GitHub
Push the frontend configuration to your GitHub repository:
```bash
git add .
git commit -m "Configure frontend for Vercel deployment with live API URL"
git push origin main
```

### Step 2: Import Project in Vercel
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select your GitHub repository (`Campus-Skill-Connect`).
3. Under **Project Name**, name it (e.g. `campus-skill-connect-frontend` or `campus-skill-connect`).
4. Under **Framework Preset**, select **Vite**.
5. Under **Root Directory**, click **Edit** and choose `frontend`.
6. Ensure Build and Output Settings are:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables
Expand the **Environment Variables** section and add:

| Key | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://cskbackend.vercel.app` | Points frontend to your live Vercel backend |

### Step 4: Deploy
Click **Deploy**. Vercel will build and deploy your React application in ~15-25 seconds, giving you a live URL (e.g. `https://campus-skill-connect.vercel.app`).

---

## ⚡ Method 2: Deploy via Vercel CLI

You can also deploy directly from your terminal:

```bash
# Navigate to the frontend directory
cd frontend

# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod
```
During the prompt:
- **Set up and deploy?** -> `Y`
- **Which scope?** -> (Select your account)
- **Link to existing project?** -> `N`
- **What’s your project’s name?** -> `campus-skill-connect-frontend`
- **In which directory is your code located?** -> `./`
- **Want to modify build settings?** -> `N` (Vite preset will be detected automatically)

Then add `VITE_API_URL=https://cskbackend.vercel.app` in the Vercel project settings under **Environment Variables** and redeploy.

---

## ✨ Features Included for Vercel

1. **SPA Client Routing**: `vercel.json` ensures that refreshing on subroutes like `/dashboard`, `/login`, `/register`, or `/profile/:id` will not produce 404 errors.
2. **Centralized API Config (`src/config/api.js`)**: All API calls dynamically connect to `https://cskbackend.vercel.app` in production and fallback cleanly during local development.
3. **Optimized Build**: Built with Vite producing minified and gzip-optimized assets.
