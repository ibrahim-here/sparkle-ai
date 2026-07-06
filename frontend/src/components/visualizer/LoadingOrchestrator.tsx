import React from 'react';
import { Rocket, Search, Database, Cpu, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const steps = [
    { id: 1, icon: <Search />, label: "Prompt Engineering", desc: "Refining your query for visual learning..." },
    { id: 2, icon: <Cpu />, label: "Scope Validation", desc: "Checking against the PF course syllabus..." },
    { id: 3, icon: <Database />, label: "Knowledge Retrieval", desc: "Extracting relevant textbook content..." },
    { id: 4, icon: <Sparkles />, label: "Diagram Philosophy", desc: "Designing the learning arc for the diagrams..." },
    { id: 5, icon: <Rocket />, label: "Canvas Generation", desc: "Creating interactive Konva.js milestones..." }
];

export default function LoadingOrchestrator({ step }: { step: number }) {
    return (
        <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-12">
                <div className="relative">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto border border-primary/20 animate-pulse">
                        <div className="text-primary">
                            {steps[step - 1]?.icon || <Sparkles size={40} />}
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-primary/5 blur-3xl -z-10 rounded-full"></div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-3xl font-black gradient-text uppercase tracking-tighter">
                        {steps[step - 1]?.label || "Generating..."}
                    </h2>
                    <p className="text-white/40 text-sm font-medium">
                        {steps[step - 1]?.desc || "Please wait while our AI agents work together."}
                    </p>
                </div>

                <div className="flex justify-between items-center px-4 relative">
                    <div className="absolute left-4 right-4 h-0.5 bg-white/5 -z-10 top-1/2 -translate-y-1/2"></div>
                    {steps.map((s) => (
                        <motion.div
                            key={s.id}
                            initial={false}
                            animate={{
                                scale: s.id === step ? 1.2 : 1,
                                opacity: s.id <= step ? 1 : 0.2,
                                backgroundColor: s.id === step ? "#8B5CF6" : s.id < step ? "#8B5CF6" : "transparent"
                            }}
                            className={`w-3 h-3 rounded-full border border-primary/40`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
