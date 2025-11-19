import express from 'express';
import passport from '../config/passport.js';
import { signup, login, getMe, logout } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateSignup, validateLogin } from '../middleware/validation.middleware.js';
import { generateToken } from '../utils/jwt.utils.js';

const router = express.Router();

// Email/Password Authentication
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);

// Protected Routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  (req, res) => {
    // Generate JWT token
    const token = generateToken(req.user._id, req.user.email);

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

export default router;
