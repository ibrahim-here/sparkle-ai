import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCTASectionProps {
  onGetStarted: () => void;
}

export const FinalCTASection = ({ onGetStarted }: FinalCTASectionProps) => {
  return (
    <section className="py-32 md:py-40 px-6 bg-secondary relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Cyber grid */}
      <div className="absolute inset-0 cyber-grid opacity-30" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Label */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={14} className="text-primary" />
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-primary/80">Start Now</span>
          </motion.div>

          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-white mb-6 leading-[0.95]">
            Ready to learn<br />
            <span className="gradient-text">your way?</span>
          </h2>

          <p className="text-white/40 text-lg font-light mb-12 max-w-xl mx-auto">
            Personalize your learning in under a minute. Let Sparkle's agents adapt to your mind.
          </p>

          <motion.button
            onClick={onGetStarted}
            className="inline-flex items-center gap-3 h-16 px-12 bg-primary text-secondary font-black rounded-2xl shadow-glow-primary hover:translate-y-[-2px] hover:shadow-[0_0_40px_rgba(139,92,246,0.6)] transition-all duration-300 active:scale-95 uppercase tracking-widest text-sm"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Get Started
            <ArrowRight size={18} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
