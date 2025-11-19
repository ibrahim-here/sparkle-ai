import api from './axios';

export interface SurveyResponse {
  questionId: string;
  selectedOptions: string[];
}

export interface LearningStyle {
  visual: number;
  auditory: number;
  reading: number;
  kinesthetic: number;
}

export interface OnboardingStatusResponse {
  success: boolean;
  completed: boolean;
  completedAt?: string;
  learningStyle?: LearningStyle;
}

export interface SubmitSurveyResponse {
  success: boolean;
  message: string;
  learningStyle: LearningStyle;
}

export const onboardingAPI = {
  getStatus: async (): Promise<OnboardingStatusResponse> => {
    const response = await api.get('/api/onboarding/status');
    return response.data;
  },

  submitSurvey: async (responses: SurveyResponse[]): Promise<SubmitSurveyResponse> => {
    const response = await api.post('/api/onboarding/submit', { responses });
    return response.data;
  },
};
