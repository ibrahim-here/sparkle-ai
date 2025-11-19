import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '../context/OnboardingContext';
import SparkleGreeting from '../components/onboarding/SparkleGreeting';
import SurveyQuestion from '../components/onboarding/SurveyQuestion';
import { onboardingAPI } from '../api/onboarding.api';
import type { SurveyResponse } from '../api/onboarding.api';

const OnboardingPage = () => {
  const [showGreeting, setShowGreeting] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const questions = [
    {
      id: 'q1',
      text: 'How do you prefer to learn new programming concepts?',
      options: [
        { id: 'q1_diagrams', text: 'Through diagrams, flowcharts, and visual representations', icon: '📊' },
        { id: 'q1_reading', text: 'By reading documentation and written tutorials', icon: '📖' },
        { id: 'q1_videos', text: 'Watching video tutorials and demonstrations', icon: '🎥' },
        { id: 'q1_coding', text: 'Writing code and experimenting hands-on', icon: '💻' },
      ],
    },
    {
      id: 'q2',
      text: 'Which type of learning content appeals to you most?',
      options: [
        { id: 'q2_infographics', text: 'Infographics and visual guides', icon: '🎨' },
        { id: 'q2_instructions', text: 'Step-by-step written instructions', icon: '📝' },
        { id: 'q2_interactive', text: 'Interactive video lessons', icon: '🎬' },
        { id: 'q2_challenges', text: 'Coding challenges and exercises', icon: '🔨' },
      ],
    },
    {
      id: 'q3',
      text: 'What learning pace works best for you?',
      options: [
        { id: 'q3_fast', text: 'Fast-paced with quick overviews', icon: '🐇' },
        { id: 'q3_slow', text: 'Slow and detailed explanations', icon: '🐢' },
        { id: 'q3_bitesized', text: 'Bite-sized lessons I can complete quickly', icon: '⚡' },
        { id: 'q3_deepdive', text: 'In-depth deep dives into topics', icon: '🎯' },
      ],
    },
    {
      id: 'q4',
      text: 'When you encounter a coding problem, you prefer to:',
      options: [
        { id: 'q4_examples', text: 'See examples and visual solutions', icon: '👀' },
        { id: 'q4_documentation', text: 'Read through documentation thoroughly', icon: '📚' },
        { id: 'q4_explanation', text: 'Watch someone explain the solution', icon: '🎧' },
        { id: 'q4_trial', text: 'Try different approaches until it works', icon: '🛠️' },
      ],
    },
    {
      id: 'q5',
      text: 'How do you like to practice coding?',
      options: [
        { id: 'q5_gamified', text: 'Gamified coding challenges', icon: '🎮' },
        { id: 'q5_structured', text: 'Structured exercises with clear goals', icon: '📋' },
        { id: 'q5_projects', text: 'Building real projects from scratch', icon: '🚀' },
        { id: 'q5_collaborative', text: 'Collaborative coding with others', icon: '👥' },
      ],
    },
  ];

  const handleGreetingComplete = () => {
    setShowGreeting(false);
  };

  const handleSelectionChange = (optionIds: string[]) => {
    const questionId = questions[currentQuestion].id;
    setResponses(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        return prev.map(r => r.questionId === questionId ? { ...r, selectedOptions: optionIds } : r);
      }
      return [...prev, { questionId, selectedOptions: optionIds }];
    });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Submit survey
      await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await onboardingAPI.submitSurvey(responses);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit survey. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentResponse = responses.find(r => r.questionId === questions[currentQuestion]?.id);

  if (showGreeting) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <SparkleGreeting onComplete={handleGreetingComplete} />
      </div>
    );
  }

  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}
          <SurveyQuestion
            question={questions[currentQuestion]}
            selectedOptions={currentResponse?.selectedOptions || []}
            onSelectionChange={handleSelectionChange}
            onNext={handleNext}
            currentQuestion={currentQuestion + 1}
            totalQuestions={questions.length}
            loading={loading}
          />
        </div>
      </div>
    </OnboardingProvider>
  );
};

export default OnboardingPage;
