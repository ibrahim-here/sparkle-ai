import User from '../models/User.model.js';

// Middleware to check if user has completed onboarding
export const checkOnboardingStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('onboardingCompleted');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Attach onboarding status to request
    req.onboardingCompleted = user.onboardingCompleted;

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to require onboarding completion
export const requireOnboarding = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('onboardingCompleted');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.onboardingCompleted) {
      return res.status(403).json({
        success: false,
        message: 'Onboarding must be completed to access this resource',
        requiresOnboarding: true
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to prevent accessing onboarding if already completed
export const preventCompletedOnboarding = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('onboardingCompleted');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.onboardingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding already completed',
        alreadyCompleted: true
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
