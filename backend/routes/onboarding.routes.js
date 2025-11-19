import express from 'express';
import { submitSurvey, getOnboardingStatus } from '../controllers/onboarding.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// All onboarding routes require authentication
router.use(protect);

// POST /api/onboarding/submit - Submit survey responses
router.post('/submit', submitSurvey);

// GET /api/onboarding/status - Get onboarding status
router.get('/status', getOnboardingStatus);

export default router;
