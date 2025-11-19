import mongoose from 'mongoose';

const surveyResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true // Each user can only have one survey response
  },
  responses: [{
    questionId: {
      type: String,
      required: [true, 'Question ID is required']
    },
    selectedOptions: [{
      type: String,
      required: [true, 'Selected option is required']
    }]
  }],
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster user lookups
surveyResponseSchema.index({ userId: 1 });

const SurveyResponse = mongoose.model('SurveyResponse', surveyResponseSchema);

export default SurveyResponse;
