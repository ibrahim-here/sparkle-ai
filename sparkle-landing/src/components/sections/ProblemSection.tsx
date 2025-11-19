import { motion } from 'framer-motion';
import { Frown, Smile } from 'lucide-react';

export const ProblemSection = () => {
  return (
    <section className="py-20 md:py-32 px-6 bg-neutral">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-6">
              Learning isn't one-size-fits-all. But most tools treat it that way.
            </h2>
            <p className="text-lg text-gray-700 leading-loose">
              Every learner is different — some understand best with visuals, others with examples 
              or deep reasoning. Traditional learning platforms make you adapt to them. 
              Sparkle AI flips the script.
            </p>
          </motion.div>

          {/* Illustration */}
          <motion.div
            className="flex justify-center items-center gap-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center">
              <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Frown size={64} className="text-red-500" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Traditional Learning</p>
            </div>
            
            <div className="text-4xl text-primary">→</div>
            
            <div className="text-center">
              <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Smile size={64} className="text-primary" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Sparkle AI</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
