import { motion } from 'framer-motion';
import { Button } from '../ui/Button';
import { BookOpen } from 'lucide-react';

interface CommunitySectionProps {
  onCTAClick: () => void;
}

export const CommunitySection = ({ onCTAClick }: CommunitySectionProps) => {
  const contentCards = [
    { title: 'Understanding For Loops', author: '@coder_jane', tags: ['Loops', 'Python'] },
    { title: 'Recursion Explained Simply', author: '@dev_mike', tags: ['Functions', 'Recursion'] },
    { title: 'Variables & Data Types', author: '@learn_with_sam', tags: ['Basics', 'Variables'] },
    { title: 'Conditional Statements Guide', author: '@code_master', tags: ['Conditions', 'Logic'] },
    { title: 'Arrays and Lists', author: '@tech_teacher', tags: ['Data Structures', 'Arrays'] },
    { title: 'Object-Oriented Basics', author: '@oop_guru', tags: ['OOP', 'Classes'] },
  ];

  return (
    <section id="community" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-4">
            Learn together. Grow together.
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Upload your own study notes or visuals. Sparkle's AI ensures everything is accurate 
            and safe — so everyone benefits from collective learning.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contentCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="aspect-video bg-neutral flex items-center justify-center">
                <BookOpen size={48} className="text-gray-400" />
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-2">
                  {card.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-1 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(178, 255, 0, 0.2)', color: '#000000' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-medium mb-1">{card.title}</h3>
                <p className="text-sm text-gray-500">By {card.author}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <Button onClick={onCTAClick} size="large">
            Join the Community
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
