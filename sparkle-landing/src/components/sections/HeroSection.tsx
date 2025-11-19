import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export const HeroSection = ({ onGetStarted, onSignIn }: HeroSectionProps) => {
  return (
    <section 
      id="hero" 
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white pt-20"
      style={{
        background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(178, 255, 0, 0.85), transparent)',
        backgroundColor: 'white'
      }}
    >
      <div className="w-full max-w-5xl mx-auto px-6 flex flex-col items-center relative z-10">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <span className="text-sm font-playfair text-gray-700">Exciting announcement 🎉</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          className="font-playfair text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight leading-tight text-center text-gray-900"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          A learning platform that works for you
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl leading-relaxed font-playfair text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Build beautiful learning paths for your goals, interests, and side projects, without having to think about design.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button onClick={onGetStarted} size="large" className="min-w-[140px]">
            Try it free →
          </Button>
          <button
            onClick={onSignIn}
            className="px-6 py-3 text-gray-700 hover:text-gray-900 font-medium transition-colors font-playfair"
          >
            Learn more
          </button>
        </motion.div>
      </div>
    </section>
  );
};
