import { motion } from 'framer-motion';

interface HeroSectionProps {
  onGetStarted: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section
      id="hero"
      className="min-h-screen flex items-center justify-center relative overflow-hidden bg-secondary pt-20 cyber-grid"
    >
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Animated Scanline */}
      <div className="scanline" />

      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col items-center relative z-10">
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full glass border border-white/10 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50">System Version 1.0.1 - Live</span>
        </motion.div>

        {/* Main Heading */}
        <div className="text-center mb-8 relative">
          <motion.h1
            className="text-6xl md:text-8xl lg:text-9xl font-extrabold mb-4 tracking-tighter leading-[0.9] text-white"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            Extreme<br />
            <span className="gradient-text">Personalization</span>
          </motion.h1>

          <motion.div
            className="absolute -right-12 top-0 hidden lg:block"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <div className="glass-neon px-4 py-2 rounded-xl text-primary text-xs font-bold border border-primary/20 animate-float">
              AI ADAPTIVE
            </div>
          </motion.div>
        </div>

        {/* Subheading */}
        <motion.p
          className="text-lg md:text-xl text-white/50 mb-12 max-w-2xl leading-relaxed text-center font-light tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Transcend traditional learning. Our agents decompose complex concepts into your specific mental models, instantly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-6 items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <button
            onClick={onGetStarted}
            className="h-16 px-10 bg-primary text-secondary font-black rounded-2xl shadow-glow-primary hover:translate-y-[-2px] transition-all duration-300 active:scale-95 uppercase tracking-widest text-sm"
          >
            Initialize Path
          </button>

        </motion.div>

        {/* Floating Decorative Elements */}
        <div className="mt-20 flex gap-12 opacity-20 filter grayscale contrast-200">
          {/* Add some minimalist geometric icons or numbers here if needed */}
        </div>
      </div>
    </section>
  );
};
