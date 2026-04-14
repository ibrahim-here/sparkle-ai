import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface FinalCTASectionProps {
  onGetStarted: () => void;
}

export const FinalCTASection = ({ onGetStarted }: FinalCTASectionProps) => {
  return (
    <section className="py-32 md:py-40 px-6 bg-gradient-to-b from-neutral to-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-5xl md:text-6xl font-semibold mb-8">
            Ready to learn the way your brain loves?
          </h2>
          
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Button onClick={onGetStarted} size="large" className="text-xl px-16 py-5">
              Get Started with Sparkle AI
            </Button>
          </motion.div>
          
          <p className="text-gray-600 mt-6">
            Takes less than a minute to personalize your learning style
          </p>
        </motion.div>
      </div>
    </section>
  );
};
