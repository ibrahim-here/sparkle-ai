# Authentication System Implementation Plan

## Backend Setup

- [x] 1. Initialize Node.js backend project



  - Create `backend` folder in project root
  - Initialize npm project with `npm init`
  - Install dependencies: express, mongoose, bcryptjs, jsonwebtoken, passport, passport-google-oauth20, cors, dotenv, express-validator
  - Create basic Express server structure
  - _Requirements: All_

- [ ] 2. Configure MongoDB connection
  - Set up MongoDB Atlas account and cluster
  - Create database user and get connection string
  - Create Mongoose connection configuration
  - Add connection string to .env file
  - Test database connection
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [ ] 3. Create User model
  - Define Mongoose schema for User
  - Add email, password, name, profilePicture, authProvider, googleId fields
  - Add timestamps (createdAt, lastLogin)
  - Create indexes on email field
  - Add password hashing pre-save hook
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

## Authentication Logic

- [ ] 4. Implement email/password signup
- [ ] 4.1 Create signup route handler
  - Validate email format and password strength
  - Check if email already exists
  - Hash password with bcrypt
  - Create user document in MongoDB
  - Generate JWT token
  - Return user data and token
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 4.2 Add input validation middleware
  - Validate email format
  - Validate password length (min 8 characters)
  - Validate required fields
  - _Requirements: 1.5_

- [ ] 5. Implement email/password login
- [ ] 5.1 Create login route handler
  - Find user by email
  - Compare password with hashed password
  - Update lastLogin timestamp
  - Generate JWT token
  - Return user data and token
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5.2 Add error handling for invalid credentials
  - Return 401 for wrong password
  - Return 401 for non-existent email
  - _Requirements: 2.2_

- [ ] 6. Implement Google OAuth
- [ ] 6.1 Configure Passport Google Strategy
  - Set up Google OAuth credentials
  - Configure Passport strategy
  - Handle OAuth callback
  - _Requirements: 3.1, 3.2_

- [ ] 6.2 Create Google auth routes
  - Create `/auth/google` route to initiate OAuth
  - Create `/auth/google/callback` route for callback
  - Find or create user in MongoDB
  - Generate JWT token
  - Redirect to frontend with token
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## Session Management

- [ ] 7. Implement JWT authentication
- [ ] 7.1 Create JWT utility functions
  - Function to generate JWT token
  - Function to verify JWT token
  - Set token expiration to 7 days
  - _Requirements: 4.1, 4.3_

- [ ] 7.2 Create auth middleware
  - Extract token from Authorization header
  - Verify token validity
  - Attach user to request object
  - Handle expired tokens
  - _Requirements: 4.2, 4.3_

- [ ] 7.3 Create protected route example
  - Create `/auth/me` route
  - Use auth middleware
  - Return current user data
  - _Requirements: 4.2, 5.4_

## Frontend Integration


- [ ] 8. Set up authentication context
- [ ] 8.1 Create AuthContext and AuthProvider
  - Define auth state (user, loading, error)
  - Create login, signup, logout functions
  - Store JWT in localStorage


  - Add axios interceptor for auth header
  - _Requirements: 6.2, 6.3_

- [ ] 8.2 Create axios instance with interceptors
  - Add Authorization header to requests
  - Handle 401 errors (logout user)
  - _Requirements: 6.3_

- [ ] 9. Create authentication UI components
- [ ] 9.1 Create AuthModal component
  - Modal with tabs for Login/Signup
  - Toggle between login and signup forms
  - Close modal on successful auth
  - _Requirements: 6.1_

- [ ] 9.2 Create LoginForm component
  - Email and password inputs
  - Form validation
  - Submit handler calling login API
  - Display error messages
  - Google sign-in button
  - _Requirements: 6.1, 6.5_

- [ ] 9.3 Create SignupForm component
  - Name, email, and password inputs
  - Form validation
  - Submit handler calling signup API
  - Display error messages
  - Google sign-up button
  - _Requirements: 6.1, 6.5_

- [ ] 9.4 Create GoogleAuthButton component
  - Button to initiate Google OAuth
  - Redirect to backend Google auth route
  - Handle OAuth callback
  - _Requirements: 6.1_

- [ ] 10. Integrate auth with landing page
- [ ] 10.1 Update Navigation component
  - Show user profile when logged in
  - Show login/signup buttons when logged out
  - Add logout functionality
  - _Requirements: 6.1_

- [ ] 10.2 Update button handlers in App.tsx
  - Open AuthModal on "Get Started" click
  - Open AuthModal on "Sign In" click
  - Redirect to dashboard after login
  - _Requirements: 6.1, 6.4_

- [ ] 10.3 Create ProtectedRoute component
  - Wrapper for authenticated routes
  - Redirect to login if not authenticated
  - _Requirements: 6.4_

## Environment Configuration

- [ ] 11. Set up environment variables
  - Create backend .env file with MongoDB URI, JWT secret, Google credentials
  - Create frontend .env file with API URL
  - Add .env to .gitignore
  - Create .env.example files for reference
  - _Requirements: All_

## Testing and Validation

- [ ] 12. Test authentication flow
  - Test email/password signup
  - Test email/password login
  - Test Google OAuth flow
  - Test protected routes
  - Test token expiration
  - Test error handling
  - _Requirements: All_
