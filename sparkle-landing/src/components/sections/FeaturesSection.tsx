import { motion } from 'framer-motion';
import { Card } from '../ui/Card';

export const FeaturesSection = () => {
  const features = [
    {
      icon: '/icons/tree.png',
      title: 'Adaptive Learning Paths',
      description: 'Sparkle adjusts content for your preferred learning style.',
    },
    {
      icon: '/icons/stacked.png',
      title: 'Visual SVG Lessons',
      description: 'Interactive diagrams that make concepts click instantly.',
    },
    {
      icon: '/icons/community.png',
      title: 'Community Learning',
      description: 'Share your notes — AI ensures quality and safety.',
    },
    {
      icon: '/icons/ai-chip.png',
      title: 'Always Learning',
      description: 'Sparkle evolves as you do, improving with every session.',
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-4">
            Built for learners, powered by AI
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-neutral hover:scale-105">
                <div className="mb-6 w-24 h-24 flex items-center justify-center">
                  <img 
                    src={feature.icon} 
                    alt={feature.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
