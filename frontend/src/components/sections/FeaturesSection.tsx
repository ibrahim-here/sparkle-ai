import { motion } from 'framer-motion';
import { Cpu, Layout, Layers, ShieldCheck } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Layout,
      title: 'Adaptive Interface',
      description: 'The dashboard morphs based on your mental load and complexity of the subject matter.',
      color: '#B2FF00'
    },
    {
      icon: Layers,
      title: 'Decomposition Engine',
      description: 'Break down any subject into semantic layers, from macroscopic views to atomic details.',
      color: '#00F0FF'
    },
    {
      icon: Cpu,
      title: 'Quantum Synthesis',
      description: 'Leveraging multi-agent systems to generate your path across parallel learning styles.',
      color: '#FF00E5'
    },
    {
      icon: ShieldCheck,
      title: 'Validation Core',
      description: 'Real-time assessment feedback loop ensuring zero conceptual entropy during mastery.',
      color: '#B2FF00'
    },
  ];

  return (
    <section id="features" className="py-32 px-6 bg-secondary relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-white text-5xl md:text-7xl font-black mb-8 tracking-tighter">
            System <span className="text-primary">Capacities</span>
          </h2>
          <div className="h-1 w-24 bg-primary rounded-full shadow-glow-primary" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass p-10 rounded-[2.5rem] border border-white/5 hover:border-primary/20 transition-all duration-500 group"
            >
              <div className="mb-8 p-4 bg-white/[0.03] rounded-2xl w-fit group-hover:bg-primary/10 transition-colors" style={{ color: feature.color }}>
                <feature.icon size={40} />
              </div>
              <h3 className="text-3xl font-bold mb-4 text-white hover:text-primary transition-colors tracking-tight">{feature.title}</h3>
              <p className="text-white/40 leading-relaxed text-lg font-light">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
