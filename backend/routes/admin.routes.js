import express from 'express';
import User from '../models/User.model.js';
import SurveyResponse from '../models/SurveyResponse.model.js';

const router = express.Router();

// Get all users with their onboarding data
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all survey responses
router.get('/surveys', async (req, res) => {
  try {
    const surveys = await SurveyResponse.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: surveys.length,
      surveys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
