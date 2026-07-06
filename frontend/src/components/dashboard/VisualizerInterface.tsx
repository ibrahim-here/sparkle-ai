import React, { useState } from 'react';
import LoadingOrchestrator from '../visualizer/LoadingOrchestrator';
import DynamicMilestoneDashboard from '../visualizer/DynamicMilestoneDashboard';
import { Search, Sparkles } from 'lucide-react';
import api from '../../api/axios';

const APP_STATE = {
  HOME: 'HOME',
  LOADING: 'LOADING',
  VIEWING: 'VIEWING',
  ERROR: 'ERROR'
};

export default function VisualizerInterface() {
  const [state, setState] = useState(APP_STATE.HOME);
  const [loadingStep, setLoadingStep] = useState(1);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [errorHeader, setErrorHeader] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [query, setQuery] = useState('');

  const orchestrateVisualizer = async (userQuery: string) => {
    setState(APP_STATE.LOADING);
    setLoadingStep(1);

    try {
      const progressTimer = setInterval(() => {
        setLoadingStep(prev => (prev < 5 ? prev + 1 : prev));
      }, 3000);

      const response = await api.post('/api/visualizer/generate', 
        { query: userQuery }
      );

      clearInterval(progressTimer);
      setLoadingStep(5);
      
      const result = response.data;

      if (!result.success || !result.milestones || result.milestones.length === 0) {
        throw { header: 'AI Generation Failed', message: 'The AI could not generate diagrams for this topic.' };
      }

      setMilestones(result.milestones);
      setState(APP_STATE.VIEWING);

    } catch (err: any) {
      console.error('Visualizer Error:', err);
      
      let header = 'AI Generation Failed';
      let message = 'Something went wrong while generating your diagrams. Please try again.';

      // Extract specific error details from backend if available (Axios error)
      if (err.response?.data?.detail) {
        message = err.response.data.detail;
        if (err.response.status === 400) {
          header = 'Topic Out of Scope';
        }
      } else if (err.header) {
        // Handle custom thrown objects from within the try block
        header = err.header;
        message = err.message || message;
      } else if (err.message) {
        // Fallback for generic JS errors
        message = err.message;
      }

      setErrorHeader(header);
      setErrorMessage(message);
      setState(APP_STATE.ERROR);
    }
  };

  const handleReset = () => {
    setState(APP_STATE.HOME);
    setMilestones([]);
    setLoadingStep(1);
  };

  return (
    <div className="flex flex-col bg-secondary text-white font-sans min-h-full">
      {state === APP_STATE.HOME && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 cyber-grid">
            <div className="max-w-2xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest animate-neon-pulse mb-4">
                        <Sparkles size={14} />
                        AI Visualizer Agent
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black gradient-text tracking-tighter leading-none">
                        VISUALIZE YOUR<br />CODE LOGIC
                    </h1>
                    <p className="text-white/40 text-lg max-w-lg mx-auto font-medium">
                        Enter any C++ concept and our AI will build interactive diagrams 
                        to help you master the mental models.
                    </p>
                </div>

                <div className="glass rounded-[2rem] p-2 flex items-center shadow-2xl focus-within:ring-2 ring-primary/50 transition-all">
                    <input 
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && query && orchestrateVisualizer(query)}
                        placeholder="e.g., How do nested loops work?"
                        className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-white text-lg placeholder:text-white/20"
                    />
                    <button 
                        onClick={() => query && orchestrateVisualizer(query)}
                        className="bg-primary p-4 rounded-3xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Search size={24} className="text-white" />
                    </button>
                </div>
            </div>
        </div>
      )}

      {state === APP_STATE.LOADING && (
        <LoadingOrchestrator step={loadingStep} />
      )}

      {state === APP_STATE.VIEWING && (
        <DynamicMilestoneDashboard
          milestones={milestones}
          onReset={handleReset}
        />
      )}

      {state === APP_STATE.ERROR && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
            <span className="text-red-500 text-4xl">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">{errorHeader}</h2>
            <p className="text-white/40 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-4 glass rounded-2xl hover:bg-white/10 transition-all font-bold text-white shadow-sm"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}
