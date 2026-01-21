import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, GitBranch } from 'lucide-react';

export const DemoSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const slides = [
    {
      title: 'Input Your Question',
      content: (
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-lg shadow-lg p-6 border-2" style={{ borderColor: '#B2FF00' }}>
              <div className="flex items-center gap-3 mb-4">
                <Search style={{ color: '#B2FF00' }} size={24} />
                <input
                  type="text"
                  value="I want to learn recursion"
                  readOnly
                  className="flex-1 text-lg font-medium outline-none"
                />
              </div>
              <button 
                className="px-6 py-2 rounded-full font-medium"
                style={{ backgroundColor: '#B2FF00', color: '#000000' }}
              >
                Generate Path
              </button>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Auto-Generated Milestones',
      content: (
        <div className="flex items-center justify-center h-full">
          <div className="w-full max-w-2xl space-y-4">
            {['Understand base case', 'Practice examples', 'Visualize recursion tree', 'Build real projects'].map((milestone, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg shadow-md p-4 flex items-center gap-3"
              >
                <CheckCircle2 style={{ color: '#B2FF00' }} size={24} />
                <span className="font-medium">{milestone}</span>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    {
      title: 'Visual Learning',
      content: (
        <div className="flex items-center justify-center h-full">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <GitBranch size={120} style={{ color: '#B2FF00' }} className="mx-auto" />
            <p className="text-center mt-4 text-gray-600 font-medium">
              Interactive SVG Visualization
            </p>
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, slides.length]);

  return (
    <section className="py-20 md:py-32 px-6 bg-neutral">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-4">
            From "I want to learn recursion" → to full mastery
          </h2>
          <p className="text-lg text-gray-600">
            See how Sparkle takes a simple request and turns it into interactive, visual lessons.
          </p>
        </motion.div>

        <div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Browser Chrome */}
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 bg-white rounded px-3 py-1 text-sm text-gray-500">
              sparkle.ai/learn
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8 md:p-12 min-h-[400px] relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="h-full"
              >
                {slides[currentSlide].content}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 pb-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSlide ? 'w-8' : 'bg-gray-300'
                }`}
                style={index === currentSlide ? { backgroundColor: '#B2FF00' } : {}}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
