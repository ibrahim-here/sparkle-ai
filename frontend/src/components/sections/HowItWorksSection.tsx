import { motion } from 'framer-motion';
import { Search, BrainCircuit, Rocket } from 'lucide-react';

interface HowItWorksSectionProps {
  onCTAClick: () => void;
}

export const HowItWorksSection = ({ onCTAClick }: HowItWorksSectionProps) => {
  const steps = [
    {
      icon: BrainCircuit,
      title: 'Neural Mapping',
      description: 'Our system analyzes your cognitive learning style through a rapid coding-logic quiz.',
      color: '#B2FF00'
    },
    {
      icon: Search,
      title: 'Choose Fundamental',
      description: 'Select a core programming concept you wish to master—from variables to complex control flows.',
      color: '#00F0FF'
    },
    {
      icon: Rocket,
      title: 'Generate Path',
      description: 'Sparkle synthesizes a personalized beginner-friendly journey tailored to your specific neural style.',
      color: '#FF00E5'
    },
  ];

  return (
    <section id="how-it-works" className="py-32 px-6 bg-secondary relative border-y border-white/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-white text-5xl md:text-6xl font-black mb-6 tracking-tighter">
            Beginner <span className="text-primary italic">Synchronization</span>
          </h2>
          <p className="text-white/40 text-lg max-w-2xl mx-auto font-light tracking-wide">
            A three-step synchronization process to align our AI with your learning patterns.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-white/[0.02] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="mb-8 relative inline-flex">
                  <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center relative z-10 border border-white/10" style={{ color: step.color }}>
                    <step.icon size={32} />
                  </div>
                  <div className="absolute -inset-4 blur-2xl opacity-20" style={{ backgroundColor: step.color }} />
                </div>

                <div className="text-[10px] text-white/30 font-bold uppercase tracking-[0.4em] mb-4">Phase 0{index + 1}</div>
                <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{step.title}</h3>
                <p className="text-white/40 leading-relaxed font-light">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <button
            onClick={onCTAClick}
            className="px-12 py-5 glass border border-primary/20 text-primary font-bold rounded-2xl hover:bg-primary/5 transition-all duration-300 uppercase tracking-widest text-xs"
          >
            Start Synchronization
          </button>
        </motion.div>
      </div>
    </section>
  );
};
