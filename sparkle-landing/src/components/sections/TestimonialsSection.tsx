import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "I've never understood coding this easily before.",
      author: 'Sarah Chen',
      role: 'Computer Science Student',
    },
    {
      quote: 'It feels like Sparkle reads my mind.',
      author: 'Marcus Johnson',
      role: 'Self-Taught Developer',
    },
    {
      quote: 'The visuals made abstract concepts finally make sense.',
      author: 'Emily Rodriguez',
      role: 'Career Switcher',
    },
  ];

  return (
    <section className="py-20 md:py-28 px-6 bg-neutral">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair italic text-4xl md:text-5xl font-semibold mb-4">
            What early learners say about Sparkle
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-xl p-8 shadow-md"
            >
              <Quote style={{ color: '#B2FF00' }} className="mb-4" size={32} />
              <p className="text-lg italic text-gray-700 mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div>
                <p className="font-medium text-secondary">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
