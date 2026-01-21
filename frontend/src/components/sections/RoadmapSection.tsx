import { motion } from 'framer-motion';

export const RoadmapSection = () => {
  return (
    <section id="about" className="py-20 md:py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-8">
            The future of learning is personal
          </h2>
          
          <div className="space-y-6 text-lg text-gray-700 leading-loose">
            <p>
              We're starting with{' '}
              <span className="px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(178, 255, 0, 0.2)' }}>
                Programming Fundamentals
              </span>{' '}
              —{' '}
              <span className="px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(178, 255, 0, 0.2)' }}>variables</span>,{' '}
              <span className="px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(178, 255, 0, 0.2)' }}>loops</span>,{' '}
              <span className="px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(178, 255, 0, 0.2)' }}>conditions</span>, and{' '}
              <span className="px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(178, 255, 0, 0.2)' }}>recursion</span>.
            </p>
            
            <p>
              Next, Sparkle AI will expand into{' '}
              <span className="font-medium">math</span>,{' '}
              <span className="font-medium">physics</span>, and beyond.
            </p>
            
            <p className="text-xl font-medium text-secondary pt-4">
              Personalized, visual learning — for everyone.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
