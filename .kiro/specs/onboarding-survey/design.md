# Design Document

## Overview

The Onboarding Survey feature provides a personalized learning assessment for new Sparkle AI users. After successful authentication, first-time users are greeted by an animated Sparkle character and guided through a 5-question survey to determine their learning style preferences. The system stores responses in MongoDB and redirects users to a ChatGPT-style dashboard interface.

## Architecture

### Frontend Architecture

```
sparkle-landing/src/
├── pages/
│   ├── OnboardingPage.tsx          # Main onboarding container
│   └── DashboardPage.tsx            # Main dashboard after onboarding
├── components/
│   ├── onboarding/
│   │   ├── SparkleGreeting.tsx     # Animated greeting component
│   │   ├── SurveyQuestion.tsx      # Individual question component
│   │   ├── SurveyProgress.tsx      # Progress indicator
│   │   └── SurveyComplete.tsx      # Completion animation
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx     # Main dashboard layout
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── ChatInterface.tsx       # Main chat area
│   │   └── InputField.tsx          # Message input component
│   └── notifications/
│       └── Toast.tsx                # Success/error notifications
├── context/
│   └── OnboardingContext.tsx        # Survey state management
├── api/
│   └── onboarding.api.ts            # API calls for survey
└── hooks/
    └── useOnboarding.ts             # Custom hook for onboarding logic
```

### Backend Architecture

```
backend/
├── models/
│   ├── User.model.js                # Extended with onboarding fields
│   └── SurveyResponse.model.js      # Survey responses schema
├── controllers/
│   └── onboarding.controller.js     # Survey submission logic
├── routes/
│   └── onboarding.routes.js         # Survey API endpoints
└── middleware/
    └── onboarding.middleware.js     # Check onboarding status
```

## Components and Interfaces

### 1. Toast Notification Component

**Purpose:** Display success/error messages after authentication

**Props:**
```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}
```

**Features:**
- Auto-dismiss after specified duration (default 3s)
- Slide-in animation from top
- Green background for success, red for error
- Close button for manual dismissal

### 2. SparkleGreeting Component

**Purpose:** Animated introduction with Sparkle character

**Props:**
```typescript
interface SparkleGreetingProps {
  onComplete: () => void;
}
```

**Features:**
- Sparkle icon scales in with bounce effect
- Typewriter effect for greeting text
- Subtle floating animation for Sparkle icon
- Auto-advances after 2 seconds

**Animation Sequence:**
1. Sparkle icon fades in and scales (0.5s)
2. Floating animation begins (continuous)
3. Text types out character by character (1s)
4. Pause for 2 seconds
5. Fade out and call onComplete

### 3. SurveyQuestion Component

**Purpose:** Display individual survey questions with multiple-choice options

**Props:**
```typescript
interface SurveyQuestionProps {
  question: {
    id: string;
    text: string;
    options: Array<{
      id: string;
      text: string;
      icon?: string;
    }>;
  };
  selectedOptions: string[];
  onSelectionChange: (optionIds: string[]) => void;
  onNext: () => void;
  currentQuestion: number;
  totalQuestions: number;
}
```

**Features:**
- Multiple selection support (checkboxes)
- Visual feedback on selection (border highlight)
- Disabled "Next" button until selection made
- Smooth fade transition between questions
- Icons for visual learners

### 4. SurveyProgress Component

**Purpose:** Show progress through the survey

**Props:**
```typescript
interface SurveyProgressProps {
  current: number;
  total: number;
}
```

**Features:**
- Progress bar with percentage fill
- Question counter (e.g., "Question 2 of 5")
- Animated progress bar transitions

### 5. DashboardLayout Component

**Purpose:** Main dashboard container with sidebar and chat interface

**Props:**
```typescript
interface DashboardLayoutProps {
  user: User;
}
```

**Features:**
- Responsive sidebar (collapsible on mobile)
- Dark theme similar to ChatGPT
- Sidebar navigation items
- User profile section at bottom

### 6. ChatInterface Component

**Purpose:** Main chat area with input field

**Features:**
- Centered "What can I help with?" prompt
- Large input field with rounded corners
- Voice input button
- Send button
- Auto-focus on mount
- Enter to send, Shift+Enter for new line

## Data Models

### Extended User Model

```javascript
const UserSchema = new mongoose.Schema({
  // Existing fields...
  email: { type: String, required: true, unique: true },
  password: { type: String },
  name: { type: String, required: true },
  
  // New onboarding fields
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  onboardingCompletedAt: {
    type: Date
  },
  learningStyle: {
    visual: { type: Number, default: 0 },      // Score 0-100
    auditory: { type: Number, default: 0 },
    reading: { type: Number, default: 0 },
    kinesthetic: { type: Number, default: 0 }
  }
});
```

### SurveyResponse Model

```javascript
const SurveyResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  responses: [{
    questionId: {
      type: String,
      required: true
    },
    selectedOptions: [{
      type: String,
      required: true
    }]
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
});
```

## Survey Questions Design

### Question 1: Visual Learning Preference
**Text:** "How do you prefer to learn new programming concepts?"

**Options:**
- 📊 Through diagrams, flowcharts, and visual representations
- 📖 By reading documentation and written tutorials
- 🎥 Watching video tutorials and demonstrations
- 💻 Writing code and experimenting hands-on

### Question 2: Content Format Preference
**Text:** "Which type of learning content appeals to you most?"

**Options:**
- 🎨 Infographics and visual guides
- 📝 Step-by-step written instructions
- 🎬 Interactive video lessons
- 🔨 Coding challenges and exercises

### Question 3: Learning Pace
**Text:** "What learning pace works best for you?"

**Options:**
- 🐇 Fast-paced with quick overviews
- 🐢 Slow and detailed explanations
- ⚡ Bite-sized lessons I can complete quickly
- 🎯 In-depth deep dives into topics

### Question 4: Problem-Solving Approach
**Text:** "When you encounter a coding problem, you prefer to:"

**Options:**
- 👀 See examples and visual solutions
- 📚 Read through documentation thoroughly
- 🎧 Watch someone explain the solution
- 🛠️ Try different approaches until it works

### Question 5: Practice Style
**Text:** "How do you like to practice coding?"

**Options:**
- 🎮 Gamified coding challenges
- 📋 Structured exercises with clear goals
- 🚀 Building real projects from scratch
- 👥 Collaborative coding with others

## API Endpoints

### POST /api/onboarding/submit
**Purpose:** Submit survey responses

**Request Body:**
```typescript
{
  responses: Array<{
    questionId: string;
    selectedOptions: string[];
  }>;
}
```

**Response:**
```typescript
{
  success: boolean;
  message: string;
  learningStyle: {
    visual: number;
    auditory: number;
    reading: number;
    kinesthetic: number;
  };
}
```

### GET /api/onboarding/status
**Purpose:** Check if user has completed onboarding

**Response:**
```typescript
{
  completed: boolean;
  completedAt?: string;
}
```

## Routing Logic

### Authentication Flow
```
User signs up/logs in
  ↓
Check onboarding status
  ↓
  ├─ Not completed → /onboarding
  │    ↓
  │  Complete survey
  │    ↓
  │  Save to DB
  │    ↓
  └─ Completed → /dashboard
```

### Route Protection
- `/onboarding` - Requires authentication, redirects to dashboard if already completed
- `/dashboard` - Requires authentication, redirects to onboarding if not completed

## Error Handling

### Survey Submission Errors
1. **Network Error:** Display toast with retry button
2. **Validation Error:** Highlight invalid fields
3. **Server Error:** Show friendly error message with support contact

### Database Errors
1. **Save Failure:** Retry logic with exponential backoff (3 attempts)
2. **Connection Timeout:** Display offline message
3. **Duplicate Submission:** Silently succeed and redirect

## Testing Strategy

### Unit Tests
- Toast component rendering and auto-dismiss
- Survey question selection logic
- Progress calculation
- Learning style score calculation

### Integration Tests
- Complete onboarding flow from greeting to dashboard
- Survey submission and database save
- Routing logic based on onboarding status
- Authentication state persistence

### E2E Tests
- New user signup → onboarding → dashboard flow
- Returning user login → direct to dashboard
- Survey completion with various answer combinations
- Error handling and retry mechanisms

## Performance Considerations

1. **Lazy Loading:** Load dashboard components only after onboarding
2. **Animation Performance:** Use CSS transforms for smooth 60fps animations
3. **API Optimization:** Batch survey responses in single request
4. **Caching:** Cache onboarding status in localStorage
5. **Image Optimization:** Use SVG for Sparkle icon

## Accessibility

1. **Keyboard Navigation:** Full keyboard support for survey
2. **Screen Readers:** ARIA labels for all interactive elements
3. **Focus Management:** Proper focus order through survey
4. **Color Contrast:** WCAG AA compliant color schemes
5. **Animation Preferences:** Respect prefers-reduced-motion

## UI/UX Design Notes

### Color Scheme
- Primary: Black (#000000)
- Success: Green (#10B981)
- Background: White (#FFFFFF)
- Dark Mode: Dark gray (#1F1F1F) for dashboard

### Typography
- Headings: Playfair Display
- Body: Inter
- Code: Fira Code

### Spacing
- Consistent 8px grid system
- Generous padding for touch targets (min 44px)

### Animations
- Greeting: 2s total duration
- Question transitions: 300ms fade
- Progress bar: 400ms ease-out
- Toast: 200ms slide-in

## Security Considerations

1. **Authentication Required:** All onboarding endpoints require valid JWT
2. **Rate Limiting:** Max 5 survey submissions per hour per user
3. **Input Validation:** Sanitize all survey responses
4. **CSRF Protection:** Use CSRF tokens for form submissions
