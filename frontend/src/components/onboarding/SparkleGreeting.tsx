import { useState, useEffect } from 'react';
import { SparkleIcon } from '../icons/SparkleIcon';

interface SparkleGreetingProps {
  onComplete: () => void;
}

const SparkleGreeting = ({ onComplete }: SparkleGreetingProps) => {
  const [showIcon, setShowIcon] = useState(false);
  const [showText, setShowText] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const fullText = "Hi! I'm Sparkle, let's be friends!";

  useEffect(() => {
    // Show icon with animation
    setTimeout(() => setShowIcon(true), 100);

    // Start typewriter effect after icon animation
    setTimeout(() => setShowText(true), 600);
  }, []);

  useEffect(() => {
    if (!showText) return;

    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
        // Wait 2 seconds after typing completes, then call onComplete
        setTimeout(onComplete, 2000);
      }
    }, 50); // 50ms per character for smooth typing

    return () => clearInterval(typingInterval);
  }, [showText, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Sparkle Icon with animations */}
      <div
        className={`transition-all duration-500 ${
          showIcon
            ? 'opacity-100 scale-100 animate-float'
            : 'opacity-0 scale-50'
        }`}
      >
        <div className="w-32 h-32">
          <SparkleIcon className="w-full h-full" />
        </div>
      </div>

      {/* Greeting Text with typewriter effect */}
      {showText && (
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-black">
            {displayedText}
            <span className="animate-blink">|</span>
          </h1>
        </div>
      )}
    </div>
  );
};

export default SparkleGreeting;
