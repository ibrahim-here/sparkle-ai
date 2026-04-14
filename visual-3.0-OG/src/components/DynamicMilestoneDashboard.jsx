import React, { useState, useRef, useEffect } from 'react';
import KonvaDiagramRenderer from './KonvaDiagramRenderer';
import { ChevronLeft, ChevronRight, Play, CheckCircle2, Info, Lightbulb, Zap, Rocket } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import gsap from 'gsap';

const MILESTONE_ICONS = [
    <Rocket className="text-primary" />,
    <Lightbulb className="text-yellow-400" />,
    <Zap className="text-blue-400" />,
    <Play className="text-success" />,
    <CheckCircle2 className="text-purple-400" />
];

const MILESTONE_TYPES = ["Motivation", "Analogy", "Mechanical Step", "Full Logic", "Conclusion"];

export default function DynamicMilestoneDashboard({ milestones = [], onReset }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);
    const rendererRef = useRef(null);

    useEffect(() => {
        // Entrance animation for the dashboard
        gsap.fromTo(".milestone-card", 
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out" }
        );
    }, []);

    if (!milestones || milestones.length === 0) return null;

    const current = milestones[activeIndex];
    const canvasSpec = current.canvas_spec || {};

    const buttonStyles = {
        primary: "bg-primary text-background hover:shadow-primary/20",
        success: "bg-success text-background hover:shadow-success/20",
        warning: "bg-warning text-background hover:shadow-warning/20",
        danger: "bg-error text-background hover:shadow-error/20"
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-background text-chart_text font-sans p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Visualizer focus (8 cols) */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="glass-panel-heavy rounded-[1.5rem] p-4 lg:p-6 relative overflow-hidden group min-h-[460px] flex flex-col border border-white/5">
                           
                           <div className="flex items-center justify-between mb-4">
                               <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/20 text-xs font-bold">
                                       {activeIndex + 1}
                                   </div>
                                   <h2 className="text-xl font-bold">{current.title}</h2>
                               </div>
                               <button 
                                    onClick={onReset}
                                    className="px-4 py-1.5 text-xs glass-panel hover:bg-white/10 transition-all rounded-xl font-bold border-white/10"
                                >
                                    New Search
                                </button>
                           </div>

                           <div className="flex-1 flex flex-col items-center justify-center bg-black/20 rounded-2xl overflow-hidden border border-white/5">
                                <KonvaDiagramRenderer 
                                    ref={rendererRef}
                                    diagramData={canvasSpec} 
                                />
                           </div>

                           {/* Dynamic Controls Bar */}
                           <div className="mt-6 pt-4 border-t border-white/5 flex flex-wrap gap-3 justify-center">
                                {(() => {
                                    const buttons = [...(canvasSpec.buttons || [])];
                                    const animations = canvasSpec.animations || [];

                                    if (buttons.length === 0 && animations.length > 0) {
                                        const hasTriggered = animations.some(a => a.trigger);
                                        if (hasTriggered) {
                                            animations.filter(a => a.trigger).forEach(a => {
                                                buttons.push({ id: `auto-${a.trigger}`, label: `▶ ${a.trigger}`, action: a.trigger, style: 'primary' });
                                            });
                                        } else {
                                            buttons.push({ id: 'auto-play', label: '▶ Play Animation', action: 'stepForward', style: 'primary' });
                                        }
                                    }

                                    if (!buttons.some(b => b.action === 'reset')) {
                                        buttons.push({ id: 'auto-reset', label: '↺ Reset', action: 'reset', style: 'warning' });
                                    }

                                    return buttons.map((btn, idx) => {
                                        const label = btn.label || btn.text || "Action";
                                        const action = btn.action || "stepForward";
                                        const id = btn.id || `btn-${idx}`;
                                        const style = btn.style || (action === 'reset' ? 'warning' : 'primary');

                                        return (
                                            <button
                                                key={id}
                                                onClick={() => rendererRef.current?.handleAction(action)}
                                                className={`px-5 py-2.5 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 ${buttonStyles[style] || buttonStyles.primary}`}
                                            >
                                                {label}
                                            </button>
                                        );
                                    });
                                })()}
                                <button
                                    onClick={() => rendererRef.current?.resetDiagram()}
                                    className="px-5 py-2.5 glass-panel rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-white/10 border-white/10"
                                >
                                    ↺ Reset View
                                </button>
                           </div>
                        </div>
                    </div>

                    {/* Explanatory sidebar (4 cols) */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="glass-panel-heavy rounded-[1.5rem] p-6 h-full flex flex-col shadow-xl border border-white/5">
                            <div className="flex items-center justify-between mb-4 border-b border-primary/10 pb-3">
                                <div className="flex items-center gap-2 text-primary">
                                    <Info size={16} />
                                    <span className="text-xs font-black uppercase tracking-wider">Lesson Context</span>
                                </div>
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 px-2 py-0.5 bg-primary/5 rounded-md border border-primary/10">
                                    Step {activeIndex + 1}/5
                                </div>
                            </div>
                            
                            <div className="flex-1 text-chart_text/80 leading-relaxed overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                                <div 
                                    className="prose prose-invert prose-p:text-xs prose-li:text-xs prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:rounded"
                                    dangerouslySetInnerHTML={{ __html: current.explanation_html }}
                                />
                            </div>

                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5">
                                <button
                                    disabled={activeIndex === 0}
                                    onClick={() => setActiveIndex(prev => prev - 1)}
                                    className="p-3 glass-panel rounded-xl hover:bg-white/10 disabled:opacity-5 transition-all border-white/5"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex gap-1.5">
                                    {[0,1,2,3,4].map(i => (
                                        <div 
                                            key={i} 
                                            className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'bg-primary w-4' : 'bg-white/10'}`} 
                                        />
                                    ))}
                                </div>

                                <button
                                    disabled={activeIndex === 4}
                                    onClick={() => setActiveIndex(prev => prev + 1)}
                                    className="p-3 bg-primary text-background rounded-xl hover:opacity-90 disabled:opacity-5 transition-all shadow-lg hover:shadow-primary/20"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
