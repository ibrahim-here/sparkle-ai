import React from 'react';
import { Loader2, CheckCircle2, Circle } from 'lucide-react';

export default function LoadingOrchestrator({ step }) {
    const steps = [
        { id: 1, label: 'Prompt Engineering' },
        { id: 2, label: 'Scope Validation' },
        { id: 3, label: 'Knowledge Retrieval' },
        { id: 4, label: 'Philosophy Mapping' },
        { id: 5, label: 'Diagram Generation' },
        { id: 6, label: 'HTML Rendering' }
    ];

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-2">
                    <Loader2 className="w-12 h-12 text-lavender animate-spin mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Orchestrating AI Agents</h2>
                    <p className="text-gray-400 text-sm italic">"Thinking in logic..."</p>
                </div>

                <div className="space-y-4 bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-lavender/5">
                    {steps.map((s) => (
                        <div key={s.id} className="flex items-center gap-4">
                            {step > s.id ? (
                                <CheckCircle2 className="text-success w-6 h-6" />
                            ) : step === s.id ? (
                                <Loader2 className="text-lavender w-6 h-6 animate-spin" />
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-100" />
                            )}
                            <span className={`text-lg font-medium ${step === s.id ? 'text-gray-800' : 'text-gray-300'}`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
