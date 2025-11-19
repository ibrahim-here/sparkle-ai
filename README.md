# ✨ Sparkle AI

An AI-powered personalized learning platform for programming beginners. Sparkle AI adapts to your learning style through an intelligent onboarding survey and provides customized coding education.

## 🎯 Features

- **Personalized Learning Assessment**: 5-question survey to determine your learning style (visual, auditory, reading/writing, kinesthetic)
- **User Authentication**: Secure signup/login with email or Google OAuth
- **Interactive Onboarding**: Animated Sparkle character guides new users through the setup
- **Modern Dashboard**: ChatGPT-style interface for AI-powered learning
- **Learning Style Analytics**: Stores and analyzes user preferences for personalized content

## 🚀 Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Passport.js** for Google OAuth
- **bcrypt** for password hashing

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Google OAuth credentials (optional)

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd sparkle-landing
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🎨 Brand Colors

- **Primary (Lime Green)**: `#B2FF00`
- **Secondary (Black)**: `#000000`
- **Accent (White)**: `#FFFFFF`
- **Neutral**: `#F3F3F3`

## 📊 Database Schema

### User Model
- Email, password, name
- Authentication provider (local/google)
- Onboarding status
- Learning style scores (visual, auditory, reading, kinesthetic)

### Survey Response Model
- User reference
- Question responses with selected options
- Completion timestamp

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login with credentials
- `GET /api/auth/google` - Google OAuth login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Onboarding
- `POST /api/onboarding/submit` - Submit survey responses
- `GET /api/onboarding/status` - Check onboarding completion

### Admin (Development)
- `GET /api/admin/users` - View all users
- `GET /api/admin/surveys` - View all survey responses

## 🎓 Learning Style Assessment

The onboarding survey assesses 4 learning styles:

1. **Visual** (25-40%): Prefers diagrams, charts, and visual representations
2. **Auditory** (20-35%): Learns best through listening and explanations
3. **Reading/Writing** (25-40%): Prefers written documentation and text
4. **Kinesthetic** (25-40%): Hands-on coding and experimentation

Scores are calculated based on survey responses and stored for personalized content delivery.

## 🛠️ Development

### Project Structure
```
sparkle-ai/
├── backend/                 # Express.js backend
│   ├── config/             # Database and passport config
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Auth and validation middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── utils/              # Helper functions
├── sparkle-landing/        # React frontend
│   ├── src/
│   │   ├── api/           # API service layer
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── .kiro/                 # Kiro AI specs and documentation
```

## 📝 License

MIT License - feel free to use this project for learning and development.

## 👨‍💻 Author

Ibrahim - [GitHub](https://github.com/ibrahim-here)

## 🙏 Acknowledgments

- Built with Kiro AI assistance
- Inspired by modern AI learning platforms
- Design influenced by ChatGPT's clean interface
