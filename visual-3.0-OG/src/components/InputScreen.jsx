import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function InputScreen({ onLearn }) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (query.trim()) {
            onLearn(query);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-4xl text-center space-y-12 animate-in fade-in zoom-in duration-1000">
                
                <div className="space-y-6">
                    <h1 className="text-6xl md:text-7xl font-bold text-chart_text tracking-tight leading-tight">
                        Generate your <span className="text-lavender">dream logic</span><br />
                        with AI, in seconds.
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto w-full group">
                    <div className="relative flex items-center bg-white p-2 rounded-2xl border-2 border-lavender-light hover:border-lavender transition-all shadow-xl shadow-lavender/5">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="How do functions work in C++?"
                            className="w-full bg-transparent px-6 py-4 text-lg text-chart_text focus:outline-none placeholder:text-gray-300"
                        />
                        <button
                            type="submit"
                            className="bg-gradient-button text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
                        >
                            <Sparkles size={18} />
                            Let's learn
                        </button>
                    </div>
                    {/* Shadow glow effect */}
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 blur-3xl -z-10 opacity-50" />
                </form>

                <div className="space-y-4">
                    <p className="text-gray-400 text-sm font-medium">Recommended for you</p>
                    <div className="flex flex-wrap justify-center gap-3">
                        {['Pointers', 'For Loops', 'Memory Layout', 'Bubble Sort', 'Functions'].map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setQuery(tag)}
                                className="px-5 py-2.5 bg-white border border-gray-100 rounded-full text-sm text-gray-500 hover:text-lavender hover:border-lavender-light hover:shadow-md transition-all"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="pt-8">
                    <button className="text-gray-400 hover:text-lavender text-sm font-medium transition-colors flex items-center gap-1 mx-auto">
                        Announcing Particle Visualizer 3.0 <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
