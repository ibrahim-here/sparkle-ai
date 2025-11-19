# Sparkle AI Backend API

Backend authentication service for Sparkle AI with MongoDB, JWT, and Google OAuth.

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

- **MongoDB URI**: Get from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **JWT Secret**: Generate a random string
- **Google OAuth**: Get from [Google Cloud Console](https://console.cloud.google.com/)

### 3. Set Up MongoDB Atlas

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for development)
5. Get connection string and add to `.env`

### 4. Set Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### 5. Run the Server

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### Sign Up (Email/Password)
```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login (Email/Password)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Google OAuth
```http
GET /api/auth/google
```
Redirects to Google OAuth consent screen.

#### Get Current User (Protected)
```http
GET /api/auth/me
Authorization: Bearer <jwt_token>
```

#### Logout (Protected)
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

### Health Check
```http
GET /health
```

## Project Structure

```
backend/
├── config/
│   ├── database.js       # MongoDB connection
│   └── passport.js       # Passport Google OAuth config
├── controllers/
│   └── auth.controller.js # Authentication logic
├── middleware/
│   ├── auth.middleware.js      # JWT verification
│   ├── error.middleware.js     # Error handling
│   └── validation.middleware.js # Input validation
├── models/
│   └── User.model.js     # User schema
├── routes/
│   └── auth.routes.js    # Authentication routes
├── utils/
│   └── jwt.utils.js      # JWT helper functions
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Entry point
```

## Testing with Postman/Thunder Client

1. **Sign Up**: POST to `/api/auth/signup` with email, password, name
2. **Login**: POST to `/api/auth/login` with email, password
3. **Copy the token** from the response
4. **Get User**: GET to `/api/auth/me` with `Authorization: Bearer <token>` header

## Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation
- ✅ CORS protection
- ✅ MongoDB injection prevention
- ✅ Error handling
- ✅ Environment variables for secrets

## Next Steps

After backend is running, integrate with the React frontend by:
1. Creating auth context
2. Building login/signup forms
3. Storing JWT tokens
4. Making authenticated requests
