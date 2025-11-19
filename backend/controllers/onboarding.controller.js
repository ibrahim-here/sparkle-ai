import User from '../models/User.model.js';
import SurveyResponse from '../models/SurveyResponse.model.js';

// Learning style mapping for each option
const LEARNING_STYLE_MAP = {
  // Question 1: How do you prefer to learn?
  'q1_diagrams': { visual: 25, reading: 5, auditory: 0, kinesthetic: 0 },
  'q1_reading': { visual: 0, reading: 25, auditory: 0, kinesthetic: 5 },
  'q1_videos': { visual: 15, reading: 0, auditory: 25, kinesthetic: 0 },
  'q1_coding': { visual: 5, reading: 0, auditory: 0, kinesthetic: 25 },
  
  // Question 2: Content format preference
  'q2_infographics': { visual: 25, reading: 5, auditory: 0, kinesthetic: 0 },
  'q2_instructions': { visual: 0, reading: 25, auditory: 0, kinesthetic: 5 },
  'q2_interactive': { visual: 10, reading: 0, auditory: 20, kinesthetic: 10 },
  'q2_challenges': { visual: 0, reading: 5, auditory: 0, kinesthetic: 25 },
  
  // Question 3: Learning pace
  'q3_fast': { visual: 10, reading: 10, auditory: 10, kinesthetic: 10 },
  'q3_slow': { visual: 10, reading: 15, auditory: 10, kinesthetic: 5 },
  'q3_bitesized': { visual: 15, reading: 10, auditory: 15, kinesthetic: 10 },
  'q3_deepdive': { visual: 5, reading: 20, auditory: 5, kinesthetic: 10 },
  
  // Question 4: Problem-solving approach
  'q4_examples': { visual: 25, reading: 5, auditory: 0, kinesthetic: 0 },
  'q4_documentation': { visual: 0, reading: 25, auditory: 0, kinesthetic: 5 },
  'q4_explanation': { visual: 5, reading: 5, auditory: 25, kinesthetic: 0 },
  'q4_trial': { visual: 0, reading: 0, auditory: 0, kinesthetic: 25 },
  
  // Question 5: Practice style
  'q5_gamified': { visual: 15, reading: 0, auditory: 10, kinesthetic: 15 },
  'q5_structured': { visual: 5, reading: 20, auditory: 5, kinesthetic: 10 },
  'q5_projects': { visual: 10, reading: 5, auditory: 5, kinesthetic: 25 },
  'q5_collaborative': { visual: 5, reading: 5, auditory: 20, kinesthetic: 10 }
};

// Calculate learning style scores from survey responses
const calculateLearningStyle = (responses) => {
  const scores = {
    visual: 0,
    auditory: 0,
    reading: 0,
    kinesthetic: 0
  };

  // Sum up scores from all selected options
  responses.forEach(response => {
    response.selectedOptions.forEach(optionId => {
      const styleScores = LEARNING_STYLE_MAP[optionId];
      if (styleScores) {
        scores.visual += styleScores.visual;
        scores.auditory += styleScores.auditory;
        scores.reading += styleScores.reading;
        scores.kinesthetic += styleScores.kinesthetic;
      }
    });
  });

  // Normalize scores to 0-100 range
  const total = scores.visual + scores.auditory + scores.reading + scores.kinesthetic;
  if (total > 0) {
    scores.visual = Math.round((scores.visual / total) * 100);
    scores.auditory = Math.round((scores.auditory / total) * 100);
    scores.reading = Math.round((scores.reading / total) * 100);
    scores.kinesthetic = Math.round((scores.kinesthetic / total) * 100);
  }

  return scores;
};

// Submit survey responses
export const submitSurvey = async (req, res, next) => {
  try {
    const { responses } = req.body;
    const userId = req.user._id;

    // Validate responses
    if (!responses || !Array.isArray(responses) || responses.length !== 5) {
      return res.status(400).json({
        success: false,
        message: 'Invalid survey responses. Expected 5 questions.'
      });
    }

    // Validate each response has required fields
    for (const response of responses) {
      if (!response.questionId || !response.selectedOptions || !Array.isArray(response.selectedOptions)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid response format'
        });
      }
    }

    // Check if user already completed onboarding
    const user = await User.findById(userId);
    if (user.onboardingCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Onboarding already completed'
      });
    }

    // Calculate learning style scores
    const learningStyle = calculateLearningStyle(responses);

    // Save or update survey response
    await SurveyResponse.findOneAndUpdate(
      { userId },
      {
        userId,
        responses,
        completedAt: new Date()
      },
      { upsert: true, new: true }
    );

    // Update user with onboarding completion and learning style
    user.onboardingCompleted = true;
    user.onboardingCompletedAt = new Date();
    user.learningStyle = learningStyle;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Survey submitted successfully',
      learningStyle
    });
  } catch (error) {
    next(error);
  }
};

// Get onboarding status
export const getOnboardingStatus = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select('onboardingCompleted onboardingCompletedAt learningStyle');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      completed: user.onboardingCompleted,
      completedAt: user.onboardingCompletedAt,
      learningStyle: user.learningStyle
    });
  } catch (error) {
    next(error);
  }
};
