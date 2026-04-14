import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const questions = [
    // Section A — Learning Style
    {
      id: 'q1',
      text: 'When learning something new, what helps you understand it quickest?',
      options: [
        { id: 'q1_a', text: 'A diagram or illustration', icon: '📊' },
        { id: 'q1_b', text: 'Written notes or examples', icon: '📝' },
        { id: 'q1_c', text: 'Trying it myself', icon: '🛠️' },
      ],
    },
    {
      id: 'q2',
      text: 'In class, what do you naturally pay attention to first?',
      options: [
        { id: 'q2_a', text: 'Drawings or visuals on the board', icon: '🎨' },
        { id: 'q2_b', text: 'The written points or slides', icon: '📄' },
        { id: 'q2_c', text: 'Any demonstrations or activities', icon: '🔬' },
      ],
    },
    {
      id: 'q3',
      text: 'What type of content makes a topic easy for you?',
      options: [
        { id: 'q3_a', text: 'Charts, graphs, or images', icon: '📉' },
        { id: 'q3_b', text: 'Well-written examples and definitions', icon: '📖' },
        { id: 'q3_c', text: 'Hands-on tasks or exercises', icon: '✍️' },
      ],
    },
    {
      id: 'q4',
      text: 'If you forget a concept, how do you best recall it?',
      options: [
        { id: 'q4_a', text: 'I picture the diagram or layout', icon: '🖼️' },
        { id: 'q4_b', text: 'I remember the written notes', icon: '📓' },
        { id: 'q4_c', text: 'I remember doing an activity with it', icon: '🧠' },
      ],
    },
    {
      id: 'q5',
      text: 'How do you prefer instructions for a new assignment?',
      options: [
        { id: 'q5_a', text: 'Visual step-by-step guide', icon: '🗺️' },
        { id: 'q5_b', text: 'Written instructions', icon: '📜' },
        { id: 'q5_c', text: 'A quick demo or sample task', icon: '🧪' },
      ],
    },
    // Questions 6-20 removed to keep the survey short and engaging,
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
      // Enrich responses with text before sending for AI analysis
      const enrichedResponses = responses.map(r => {
        const question = questions.find(q => q.id === r.questionId);
        return {
          ...r,
          questionText: question?.text || '',
          selectedOptionsText: r.selectedOptions.map(optId =>
            question?.options.find(o => o.id === optId)?.text || ''
          )
        };
      });
      await onboardingAPI.submitSurvey(enrichedResponses);
      await refreshUser();
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
