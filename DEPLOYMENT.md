# 🚀 Deployment Guide

## Backend Deployment (Render.com)

### Step 1: Prepare Backend for Deployment

1. Make sure your `backend/package.json` has a start script:
```json
"scripts": {
  "start": "node server.js",
  "dev": "nodemon server.js"
}
```

### Step 2: Deploy to Render

1. Go to [Render.com](https://render.com/) and sign up
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `ibrahim-here/sparkle-ai`
4. Configure the service:
   - **Name**: `sparkle-ai-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add Environment Variables (click "Advanced" → "Add Environment Variable"):
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_CALLBACK_URL=https://your-backend-url.onrender.com/api/auth/google/callback
   FRONTEND_URL=https://sparkle-ai-lime.vercel.app
   PORT=5000
   ```

6. Click **"Create Web Service"**

7. Wait for deployment (5-10 minutes)

8. Copy your backend URL (e.g., `https://sparkle-ai-backend.onrender.com`)

### Step 3: Update Google OAuth Redirect URIs

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth credentials
3. Add to **Authorized redirect URIs**:
   ```
   https://your-backend-url.onrender.com/api/auth/google/callback
   ```
4. Add to **Authorized JavaScript origins**:
   ```
   https://sparkle-ai-lime.vercel.app
   ```

## Frontend Deployment (Vercel)

### Step 1: Update Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
4. Click **"Save"**

### Step 2: Redeploy Frontend

1. Go to **"Deployments"** tab
2. Click the three dots on the latest deployment
3. Click **"Redeploy"**

OR

Push a new commit to trigger automatic deployment:
```bash
git add .
git commit -m "Update production API URL"
git push origin main
```

## Testing

1. Visit your frontend: https://sparkle-ai-lime.vercel.app
2. Click "Get Started" button
3. Try signing up with email/password
4. Complete the onboarding survey
5. Check if you reach the dashboard

## Troubleshooting

### Buttons Still Not Working?

1. **Check Browser Console** (F12):
   - Look for CORS errors
   - Look for network errors
   - Check if API URL is correct

2. **Check Backend Logs** (Render Dashboard):
   - Go to your service → "Logs"
   - Look for errors

3. **Common Issues**:
   - **CORS Error**: Make sure `FRONTEND_URL` in backend env matches your Vercel URL
   - **404 Errors**: Backend might not be deployed correctly
   - **500 Errors**: Check MongoDB connection string

### Backend Not Starting?

1. Check Render logs for errors
2. Verify all environment variables are set
3. Make sure MongoDB Atlas allows connections from anywhere (0.0.0.0/0)

### MongoDB Connection Issues?

1. Go to MongoDB Atlas
2. Click "Network Access"
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

## Alternative: Deploy Backend to Railway

If Render doesn't work, try [Railway.app](https://railway.app/):

1. Sign up at Railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Node.js
5. Add environment variables in the "Variables" tab
6. Deploy!

## Cost

- **Frontend (Vercel)**: Free
- **Backend (Render/Railway)**: Free tier available
- **MongoDB Atlas**: Free tier (M0)
- **Total**: $0/month for development

## Production Checklist

- [ ] Backend deployed and running
- [ ] Frontend environment variable updated
- [ ] Google OAuth redirect URIs updated
- [ ] MongoDB allows connections from anywhere
- [ ] Test signup/login flow
- [ ] Test onboarding survey
- [ ] Test dashboard access
