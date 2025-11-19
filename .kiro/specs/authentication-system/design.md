# Authentication System Design

## Overview

The authentication system will consist of a Node.js/Express backend API that handles user registration, login, and Google OAuth, with MongoDB as the database. The React frontend will communicate with this backend via REST API calls.

## Architecture

### High-Level Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│  React Frontend │ ◄─────► │  Express Backend │ ◄─────► │   MongoDB   │
│   (Port 5173)   │  HTTP   │   (Port 5000)    │         │   Atlas     │
└─────────────────┘         └──────────────────┘         └─────────────┘
                                     │
                                     ▼
                            ┌─────────────────┐
                            │  Google OAuth   │
                            │      API        │
                            └─────────────────┘
```

### Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- Passport.js (Google OAuth)
- bcryptjs (password hashing)
- jsonwebtoken (JWT)
- express-validator (input validation)
- cors (cross-origin requests)

**Frontend:**
- React Context API (auth state)
- Axios (HTTP client)
- React Router (navigation)

## Components and Interfaces

### Backend Components

#### 1. User Model (Mongoose Schema)
```typescript
{
  email: String (unique, required)
  password: String (hashed, optional for Google users)
  name: String
  profilePicture: String (URL)
  authProvider: Enum ['local', 'google']
  googleId: String (optional)
  createdAt: Date
  lastLogin: Date
}
```

#### 2. Authentication Routes
- `POST /api/auth/signup` - Email/password registration
- `POST /api/auth/login` - Email/password login
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout user

#### 3. Middleware
- `authMiddleware` - Verify JWT token
- `validateInput` - Validate request body
- `errorHandler` - Global error handling

### Frontend Components

#### 1. Auth Context
```typescript
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
}
```

#### 2. UI Components
- `AuthModal` - Modal for login/signup
- `LoginForm` - Email/password login form
- `SignupForm` - Registration form
- `GoogleButton` - Google OAuth button
- `ProtectedRoute` - Route wrapper for authenticated pages

## Data Models

### User Document (MongoDB)
```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password": "$2a$10$hashedpassword...",
  "name": "John Doe",
  "profilePicture": "https://...",
  "authProvider": "local",
  "googleId": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "lastLogin": "2024-01-01T00:00:00.000Z"
}
```

### JWT Payload
```json
{
  "userId": "ObjectId",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Error Handling

### Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials)
- `409` - Conflict (email already exists)
- `500` - Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Security Considerations

1. **Password Security**
   - Use bcrypt with salt rounds of 10
   - Never store plain text passwords
   - Enforce minimum password length (8 characters)

2. **JWT Security**
   - Store JWT secret in environment variables
   - Use httpOnly cookies or secure localStorage
   - Implement token expiration (7 days)

3. **API Security**
   - Enable CORS with specific origins
   - Rate limiting on auth endpoints
   - Input validation and sanitization
   - HTTPS in production

4. **MongoDB Security**
   - Use MongoDB Atlas with IP whitelist
   - Store connection string in environment variables
   - Enable MongoDB authentication

## Testing Strategy

### Backend Tests
1. Unit tests for authentication logic
2. Integration tests for API endpoints
3. Test Google OAuth flow with mocks

### Frontend Tests
1. Component tests for auth forms
2. Integration tests for auth flow
3. E2E tests for complete user journey

## Environment Variables

```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173

# Frontend (.env)
VITE_API_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## Deployment Considerations

1. **Backend Deployment** (Render/Railway/Heroku)
   - Set environment variables
   - Configure MongoDB Atlas IP whitelist
   - Enable HTTPS

2. **Frontend Deployment** (Vercel/Netlify)
   - Update API URL to production backend
   - Configure OAuth redirect URLs

3. **MongoDB Atlas**
   - Create production cluster
   - Set up database user
   - Configure network access
