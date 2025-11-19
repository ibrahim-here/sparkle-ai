# Sparkle AI Authentication Setup Guide

Complete guide to set up authentication with MongoDB and Google OAuth.

## 📋 Prerequisites

- Node.js installed
- MongoDB Atlas account
- Google Cloud Console account

## 🚀 Quick Start

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (M0 Free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

#### Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "Sparkle AI")
3. Enable "Google+ API":
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: "Web application"
   - Name: "Sparkle AI Web Client"
   - Authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback`
     - `http://localhost:5173/auth/callback`
5. Copy Client ID and Client Secret

#### Create .env File

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
NODE_ENV=development

# Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sparkle-ai?retryWrites=true&w=majority

# Generate a random secret (use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key-here

JWT_EXPIRE=7d

# Your Google OAuth credentials
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

#### Start Backend Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

### 2. Frontend Setup

#### Create .env File

```bash
cd sparkle-landing
cp .env.example .env
```

Edit `sparkle-landing/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

#### Start Frontend

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## ✅ Testing Authentication

### Test Email/Password Signup

1. Open `http://localhost:5173`
2. Click "Get Started"
3. Fill in the signup form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. You should be logged in!

### Test Email/Password Login

1. Click "Sign In"
2. Enter your credentials
3. Click "Sign In"

### Test Google OAuth

1. Click "Sign in with Google"
2. Select your Google account
3. Grant permissions
4. You'll be redirected back and logged in

### Test Logout

1. Click on your profile in the navigation
2. Click "Logout"

## 🔍 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
- Check your connection string in `.env`
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify database user credentials

**Google OAuth Error:**
- Verify redirect URIs in Google Console
- Check Client ID and Secret in `.env`
- Ensure Google+ API is enabled

### Frontend Issues

**CORS Error:**
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in backend `.env`

**Token Not Persisting:**
- Check browser localStorage
- Verify JWT_SECRET is set in backend

## 📁 Project Structure

```
sparkle-ai/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   ├── controllers/
│   │   └── auth.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── validation.middleware.js
│   ├── models/
│   │   └── User.model.js
│   ├── routes/
│   │   └── auth.routes.js
│   ├── utils/
│   │   └── jwt.utils.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
└── sparkle-landing/
    ├── src/
    │   ├── api/
    │   │   ├── axios.ts
    │   │   └── auth.api.ts
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── AuthModal.tsx
    │   │   │   ├── LoginForm.tsx
    │   │   │   └── SignupForm.tsx
    │   │   └── layout/
    │   │       └── Navigation.tsx (updated)
    │   ├── context/
    │   │   └── AuthContext.tsx
    │   ├── App.tsx (updated)
    │   └── main.tsx
    ├── .env
    └── package.json
```

## 🎯 Features Implemented

- ✅ Email/password signup
- ✅ Email/password login
- ✅ Google OAuth authentication
- ✅ JWT token management
- ✅ Protected routes
- ✅ User profile display
- ✅ Logout functionality
- ✅ Error handling
- ✅ Form validation
- ✅ MongoDB integration
- ✅ Password hashing with bcrypt

## 🔐 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT tokens with 7-day expiration
- HTTP-only token storage
- CORS protection
- Input validation
- MongoDB injection prevention
- Error handling without exposing sensitive data

## 📝 API Endpoints

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user (protected)

## 🎉 Next Steps

1. Test all authentication flows
2. Customize the UI to match your brand
3. Add password reset functionality
4. Implement email verification
5. Add user profile editing
6. Deploy to production

## 📞 Support

If you encounter any issues, check:
1. Backend logs in terminal
2. Frontend console in browser DevTools
3. Network tab for API requests
4. MongoDB Atlas logs

Happy coding! 🚀
