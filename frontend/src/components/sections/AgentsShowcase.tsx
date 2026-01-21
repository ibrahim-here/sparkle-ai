import { motion } from 'framer-motion';
import { Sparkles, Zap, Eye, Brain } from 'lucide-react';

const agents = [
    {
        id: 'explainer',
        name: 'In-Depth Explainer',
        description: 'Deconstructs complex architectures into fundamental principles using first-principles thinking.',
        icon: Brain,
        color: '#B2FF00',
        delay: 0.1
    },
    {
        id: 'analogy',
        name: 'Analogy Architect',
        description: 'Maps abstract technical concepts to familiar real-world mental models for intuitive grasping.',
        icon: Zap,
        color: '#00F0FF',
        delay: 0.2
    },
    {
        id: 'visual',
        name: 'Visual Synthesizer',
        description: 'Generates mental blueprints and spatial representations of data flows and systems.',
        icon: Eye,
        color: '#FF00E5',
        delay: 0.3
    }
];

export const AgentsShowcase = () => {
    return (
        <section id="agents" className="py-32 relative bg-secondary overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="mb-20">
                    <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="text-white text-sm font-bold tracking-[0.3em] uppercase mb-4"
                    >
                        Neural Interface
                    </motion.h2>
                    <motion.h3
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-6xl font-bold text-white tracking-tighter"
                    >
                        Deployed <span className="gradient-text">Intelligence</span>
                    </motion.h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {agents.map((agent) => (
                        <motion.div
                            key={agent.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: agent.delay, duration: 0.5 }}
                            whileHover={{ y: -10 }}
                            className="group relative p-8 rounded-3xl glass border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden"
                        >
                            {/* Background Glow */}
                            <div
                                className="absolute -right-4 -top-4 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full"
                                style={{ backgroundColor: agent.color }}
                            />

                            <div className="relative z-10">
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-8 bg-white/5 border border-white/10 group-hover:scale-110 transition-transform duration-500"
                                    style={{ color: agent.color }}
                                >
                                    <agent.icon size={28} />
                                </div>

                                <h4 className="text-2xl font-bold text-white mb-4 tracking-tight group-hover:text-primary transition-colors duration-300">
                                    {agent.name}
                                </h4>

                                <p className="text-white/40 leading-relaxed font-light mb-8 group-hover:text-white/60 transition-colors duration-300">
                                    {agent.description}
                                </p>

                                <div className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-primary" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-white/30 group-hover:text-primary transition-colors duration-300">Active Node</span>
                                </div>
                            </div>

                            {/* Decorative Corner */}
                            <div className="absolute bottom-0 right-0 w-12 h-12 opacity-10 group-hover:opacity-30 transition-opacity">
                                <div className="absolute bottom-4 right-4 w-4 h-[1px] bg-white" />
                                <div className="absolute bottom-4 right-4 w-[1px] h-4 bg-white" />
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
