import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface HowItWorksSectionProps {
  onCTAClick: () => void;
}

export const HowItWorksSection = ({ onCTAClick }: HowItWorksSectionProps) => {
  const steps = [
    {
      icon: '/icons/brain.png',
      title: 'Tell Sparkle how you learn',
      description: 'A short quiz builds your learning profile.',
    },
    {
      icon: '/icons/idea.png',
      title: 'Ask Sparkle anything',
      description: 'Type in something like "I want to learn loops in coding."',
    },
    {
      icon: '/icons/milestone.png',
      title: 'Get a personalized learning path',
      description: 'Sparkle creates milestone-based lessons with visuals and examples made for your brain.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-4">
            Your personal learning companion in 3 simple steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="bg-white shadow-lg text-center h-full">
                <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                  <img 
                    src={step.icon} 
                    alt={step.title}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-sm text-gray-500 font-medium mb-2">Step {index + 1}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </Card>
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
          <Button onClick={onCTAClick} size="large">
            Try It Now
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
