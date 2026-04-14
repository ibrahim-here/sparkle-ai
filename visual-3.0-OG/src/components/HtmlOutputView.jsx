import React from 'react';
import { ArrowLeft, RefreshCw, LayoutTemplate } from 'lucide-react';

export default function HtmlOutputView({ htmlContent, onReset }) {
    return (
        <div className="min-h-screen bg-[#0d0d14] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header controls (outside the iframe to guarantee they work regardless of what Claude generates) */}
            <div className="w-full bg-[#13131f] border-b border-[#1a1a2e] px-8 py-4 flex items-center justify-between shadow-md z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#89B4FA]/10 rounded-xl text-[#89B4FA]">
                        <LayoutTemplate size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-[#CDD6F4] tracking-tight">Interactive Canvas View</h2>
                        <p className="text-[#6272a4] text-xs font-mono">Powered by Konva.js</p>
                    </div>
                </div>
                
                <div className="flex gap-4">
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1E1E2E] border border-[#2a2a3e] rounded-xl font-semibold text-sm text-[#CDD6F4] hover:bg-[#252535] hover:text-white transition-all shadow-sm"
                    >
                        <RefreshCw size={16} className="text-[#89B4FA]" />
                        New Search
                    </button>
                    <button
                        onClick={onReset}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#89B4FA]/10 border border-[#89B4FA]/30 text-[#89B4FA] rounded-xl font-bold text-sm hover:bg-[#89B4FA]/20 transition-all shadow-lg shadow-[#89B4FA]/5"
                    >
                        <ArrowLeft size={16} />
                        Back to Home
                    </button>
                </div>
            </div>

            {/* If body padding from the Claude CSS creates scrollbars inside the iframe when we don't want them, 
                we ensure the iframe scales to full height. */}
            <div className="flex-1 w-full bg-[#0d0d14] relative">
                <iframe
                    title="Interactive Diagram"
                    srcDoc={htmlContent}
                    className="absolute inset-0 w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin"
                />
            </div>
        </div>
    );
}
