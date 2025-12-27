# 🚀 Deployment Guide: CareerQuest - The Apocalypse

Deploy with **Render** (Backend) and **Vercel** (Frontend).

---

## Backend: Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com) and sign up/login
2. Connect your GitHub account

### Step 2: Deploy Backend
1. Click **New → Web Service**
2. Connect your repository and select the `backend` folder as root directory
3. Configure:
   - **Name**: `careerquest-api`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 4: Configure MongoDB Atlas (Database)
 since you already created an account:
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. In your Cluster, click **Connect** → **Drivers**
3. Copy the **connection string** (starts with `mongodb+srv://`)
4. Replace `<password>` with your database user password
5. **CRITICAL Step**: Go to **Network Access** (left sidebar)
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere** (`0.0.0.0/0`)
   - This allows Render's servers to reach your database

### Step 5: Set Environment Variables on Render
In Render dashboard → Your Service → **Environment**, add these variables:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Your new Atlas connection string (e.g. `mongodb+srv://user:pass@...`) |
| `JWT_SECRET` | Generate a secure random string |
| `JWT_EXPIRE` | `7d` |
| `GOOGLE_CLIENT_ID` | Your Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth secret |
| `GOOGLE_CALLBACK_URL` | `https://YOUR-RENDER-URL.onrender.com/api/auth/google/callback` |
| `GEMINI_API_KEY` | Your Gemini API key |
| `CLIENT_URL` | `https://YOUR-VERCEL-URL.vercel.app` |
| `MAX_FILE_SIZE` | `5242880` |

### Step 6: Deploy
Click **Create Web Service**. Note your URL (e.g., `https://careerquest-api.onrender.com`).

---

## Frontend: Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Connect your GitHub account

### Step 2: Deploy Frontend
1. Click **Add New → Project**
2. Import your repository
3. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`

### Step 3: Set Environment Variable
In Vercel dashboard → Settings → Environment Variables, add:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |

### Step 4: Deploy
Click **Deploy**. Your app will be live at `https://your-project.vercel.app`.

---

## Post-Deployment Checklist

- [ ] Update Google OAuth authorized redirect URIs in Google Cloud Console
- [ ] Test user registration and login
- [ ] Verify API connectivity (check browser Network tab)
- [ ] Test all major features (quests, guilds, oracle, etc.)

---

## Troubleshooting

**CORS Errors?**  
Ensure `CLIENT_URL` on Render matches your Vercel domain exactly.

**API calls failing?**  
Check that `VITE_API_URL` ends with `/api` (e.g., `https://careerquest-api.onrender.com/api`).

**Backend sleeping?**  
Free tier Render services sleep after 15 mins of inactivity. First request may take 30+ seconds.
