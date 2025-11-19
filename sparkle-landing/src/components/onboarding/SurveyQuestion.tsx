import { useState } from 'react';
import { Button } from '../ui/Button';
import SurveyProgress from './SurveyProgress';

interface Option {
  id: string;
  text: string;
  icon?: string;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

interface SurveyQuestionProps {
  question: Question;
  selectedOptions: string[];
  onSelectionChange: (optionIds: string[]) => void;
  onNext: () => void;
  currentQuestion: number;
  totalQuestions: number;
  loading?: boolean;
}

const SurveyQuestion = ({
  question,
  selectedOptions,
  onSelectionChange,
  onNext,
  currentQuestion,
  totalQuestions,
  loading = false,
}: SurveyQuestionProps) => {
  const [fadeIn, setFadeIn] = useState(true);

  const handleOptionToggle = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      onSelectionChange(selectedOptions.filter(id => id !== optionId));
    } else {
      onSelectionChange([...selectedOptions, optionId]);
    }
  };

  const handleNext = () => {
    setFadeIn(false);
    setTimeout(() => {
      onNext();
      setFadeIn(true);
    }, 300);
  };

  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
      <div className="space-y-8">
        {/* Progress Bar */}
        <SurveyProgress current={currentQuestion} total={totalQuestions} />

        {/* Question */}
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-black">
            {question.text}
          </h2>
          <p className="text-gray-600 text-sm">Select all that apply</p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedOptions.includes(option.id);
            return (
              <button
                key={option.id}
                onClick={() => handleOptionToggle(option.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left flex items-center gap-4 ${
                  isSelected
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white text-black hover:border-gray-400'
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'bg-white border-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-4 h-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                {option.icon && (
                  <span className="text-2xl flex-shrink-0">{option.icon}</span>
                )}

                {/* Text */}
                <span className="flex-1 font-medium">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleNext}
            disabled={selectedOptions.length === 0 || loading}
            className="px-8"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Submitting...
              </span>
            ) : isLastQuestion ? (
              'Complete'
            ) : (
              'Next'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SurveyQuestion;
