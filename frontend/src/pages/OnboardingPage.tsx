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
    {
      id: 'q6',
      text: 'What helps you stay focused during studying?',
      options: [
        { id: 'q6_a', text: 'Color-coded visuals', icon: '🌈' },
        { id: 'q6_b', text: 'Reading examples', icon: '📚' },
        { id: 'q6_c', text: 'Moving around or doing practical work', icon: '🏃' },
      ],
    },
    {
      id: 'q7',
      text: "If you're stuck on a problem, you first look for:",
      options: [
        { id: 'q7_a', text: 'A visual breakdown or diagram', icon: '🧩' },
        { id: 'q7_b', text: 'A written sample solution', icon: '📝' },
        { id: 'q7_c', text: 'A practice question to try', icon: '✏️' },
      ],
    },
    {
      id: 'q8',
      text: 'What type of teacher helps you the most?',
      options: [
        { id: 'q8_a', text: 'One who draws and shows visuals', icon: '👨‍🏫' },
        { id: 'q8_b', text: 'One who provides written notes', icon: '📄' },
        { id: 'q8_c', text: 'One who lets you practice often', icon: '🏋️' },
      ],
    },
    {
      id: 'q9',
      text: 'When learning how something works, you prefer:',
      options: [
        { id: 'q9_a', text: 'A labeled picture of it', icon: '🏷️' },
        { id: 'q9_b', text: 'A written description', icon: '📋' },
        { id: 'q9_c', text: 'Seeing it run or trying it yourself', icon: '⚙️' },
      ],
    },
    {
      id: 'q10',
      text: 'What kind of test preparation works best for you?',
      options: [
        { id: 'q10_a', text: 'Mind-maps and diagrams', icon: '🧠' },
        { id: 'q10_b', text: 'Reading and rewriting notes', icon: '✍️' },
        { id: 'q10_c', text: 'Doing many practice questions', icon: '✅' },
      ],
    },
    // Section B — Study Behavior & Motivation
    {
      id: 'q11',
      text: 'How do you usually start learning a new topic?',
      options: [
        { id: 'q11_a', text: 'Look at visuals to get the idea', icon: '👀' },
        { id: 'q11_b', text: 'Read the introduction', icon: '📖' },
        { id: 'q11_c', text: 'Jump straight into an exercise', icon: '🚀' },
      ],
    },
    {
      id: 'q12',
      text: 'What keeps you motivated?',
      options: [
        { id: 'q12_a', text: 'Seeing progress visually', icon: '📈' },
        { id: 'q12_b', text: 'Clear written goals', icon: '🎯' },
        { id: 'q12_c', text: 'Completing hands-on tasks', icon: '🏆' },
      ],
    },
    {
      id: 'q13',
      text: 'When you lose focus, what helps you return?',
      options: [
        { id: 'q13_a', text: 'Looking at organized notes/diagrams', icon: '🗂️' },
        { id: 'q13_b', text: 'Reading the summary', icon: '📑' },
        { id: 'q13_c', text: 'Taking a short physical break', icon: '☕' },
      ],
    },
    {
      id: 'q14',
      text: 'What kind of class activity feels easiest?',
      options: [
        { id: 'q14_a', text: 'Watching animations or slides', icon: '📽️' },
        { id: 'q14_b', text: 'Reading and solving examples', icon: '💡' },
        { id: 'q14_c', text: 'Labs, experiments, or simulations', icon: '🧪' },
      ],
    },
    {
      id: 'q15',
      text: 'How do you prefer to review your mistakes?',
      options: [
        { id: 'q15_a', text: 'Visual breakdown of what went wrong', icon: '📉' },
        { id: 'q15_b', text: 'Written correction notes', icon: '📝' },
        { id: 'q15_c', text: 'Redoing the activity hands-on', icon: '🔄' },
      ],
    },
    // Section C — Preference for Structure & Approach
    {
      id: 'q16',
      text: 'Which type of examples help you the most?',
      options: [
        { id: 'q16_a', text: 'Illustrated examples', icon: '🖼️' },
        { id: 'q16_b', text: 'Written solved examples', icon: '✅' },
        { id: 'q16_c', text: 'Practical real-life examples', icon: '🌍' },
      ],
    },
    {
      id: 'q17',
      text: 'When learning a long topic, what keeps it easy?',
      options: [
        { id: 'q17_a', text: 'Diagrams dividing the topic', icon: '🔪' },
        { id: 'q17_b', text: 'Reading summaries', icon: '📖' },
        { id: 'q17_c', text: 'Doing small tasks in between', icon: '🧱' },
      ],
    },
    {
      id: 'q18',
      text: 'How do you prefer to take class notes?',
      options: [
        { id: 'q18_a', text: 'Drawing charts or visual cues', icon: '✏️' },
        { id: 'q18_b', text: 'Writing definitions & solved examples', icon: '🖊️' },
        { id: 'q18_c', text: 'Creating flowcharts with steps I can follow', icon: '➡️' },
      ],
    },
    {
      id: 'q19',
      text: 'How do you like to practice a new skill?',
      options: [
        { id: 'q19_a', text: 'Watching someone visually demonstrate', icon: '👁️' },
        { id: 'q19_b', text: 'Reading the steps slowly', icon: '🐢' },
        { id: 'q19_c', text: 'Doing it immediately hands-on', icon: '⚡' },
      ],
    },
    {
      id: 'q20',
      text: 'What type of learning material do you enjoy most?',
      options: [
        { id: 'q20_a', text: 'Graphics, visuals, or animations', icon: '🎨' },
        { id: 'q20_b', text: 'Written guides and sample solutions', icon: '📚' },
        { id: 'q20_c', text: 'Interactive activities or experiments', icon: '⚗️' },
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
