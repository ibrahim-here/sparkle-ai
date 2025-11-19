import { createContext, useContext, useState, ReactNode } from 'react';
import type { SurveyResponse } from '../api/onboarding.api';

interface OnboardingContextType {
  currentQuestion: number;
  responses: SurveyResponse[];
  setCurrentQuestion: (question: number) => void;
  addResponse: (response: SurveyResponse) => void;
  updateResponse: (questionId: string, selectedOptions: string[]) => void;
  resetSurvey: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);

  const addResponse = (response: SurveyResponse) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === response.questionId);
      if (existing) {
        return prev.map(r => r.questionId === response.questionId ? response : r);
      }
      return [...prev, response];
    });
  };

  const updateResponse = (questionId: string, selectedOptions: string[]) => {
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, selectedOptions } : r);
      }
      return [...prev, { questionId, selectedOptions }];
    });
  };

  const resetSurvey = () => {
    setCurrentQuestion(0);
    setResponses([]);
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentQuestion,
        responses,
        setCurrentQuestion,
        addResponse,
        updateResponse,
        resetSurvey,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};
