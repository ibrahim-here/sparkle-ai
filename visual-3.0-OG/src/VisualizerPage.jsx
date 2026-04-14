import React, { useState } from 'react';
import InputScreen from './components/InputScreen';
import LoadingOrchestrator from './components/LoadingOrchestrator';
import DynamicMilestoneDashboard from './components/DynamicMilestoneDashboard';

// Import Agents
import { runAgent1 } from './agents/agent1_promptEngineer';
import { runAgent2 } from './agents/agent2_scopeValidator';
import { runAgent3 } from './agents/agent3_embeddingRetriever';
import { runAgent4 } from './agents/agent4_diagramPhilosopher';
import { runAgent5 } from './agents/agent5_konvaGenerator';

const APP_STATE = {
  HOME: 'HOME',
  LOADING: 'LOADING',
  VIEWING: 'VIEWING',
  ERROR: 'ERROR'
};

export default function App() {
  const [state, setState] = useState(APP_STATE.HOME);
  const [loadingStep, setLoadingStep] = useState(1);
  const [milestones, setMilestones] = useState([]);
  const [conceptName, setConceptName] = useState('');
  const [errorHeader, setErrorHeader] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const orchestrateAgents = async (userQuery) => {
    setState(APP_STATE.LOADING);
    setLoadingStep(1);

    try {
      // Step 1: Prompt Engineer
      const agent1Result = await runAgent1(userQuery);
      setLoadingStep(2);

      // Step 2: Scope Validator
      const agent2Result = runAgent2(agent1Result);
      if (!agent2Result.in_scope) {
        throw { header: 'Out of Scope', message: agent2Result.error };
      }
      setLoadingStep(3);

      // Step 3: Embedding Retriever
      const agent3Result = await runAgent3(agent1Result, agent2Result);
      setLoadingStep(4);

      // Step 4: Diagram Philosopher
      const agent4Result = runAgent4(agent1Result);
      setLoadingStep(5);

      // Step 5: Konva Generator
      const concept = agent1Result.concept_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

      const context = {
        concept,
        concept_key: agent1Result.concept_key,
        milestones_philosophy: agent4Result.milestones,
        enriched_query: agent1Result.enriched_query,
        retrieved_chunks: agent3Result.retrieved_chunks,
        syllabus_meta: {
          week: agent2Result.week,
          lecture: agent2Result.lecture,
          topic_cluster: agent2Result.topic_cluster,
        }
      };

      const result = await runAgent5(context);

      if (!result.success || !result.milestones || result.milestones.length === 0) {
        throw { header: 'AI Generation Failed', message: result.error || 'Agent 5 could not generate milestones.' };
      }

      setMilestones(result.milestones);
      setConceptName(concept);
      setState(APP_STATE.VIEWING);

    } catch (err) {
      console.error('Agent Orchestration Error:', err);
      setErrorHeader(err.header || 'AI Generation Failed');
      setErrorMessage(err.message || 'Something went wrong while generating your diagrams. Please try again.');
      setState(APP_STATE.ERROR);
    }
  };

  const handleReset = () => {
    setState(APP_STATE.HOME);
    setMilestones([]);
    setConceptName('');
    setLoadingStep(1);
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans selection:bg-purple-100">
      {state === APP_STATE.HOME && (
        <InputScreen onLearn={orchestrateAgents} />
      )}

      {state === APP_STATE.LOADING && (
        <LoadingOrchestrator step={loadingStep} />
      )}

      {state === APP_STATE.VIEWING && (
        <DynamicMilestoneDashboard
          milestones={milestones}
          conceptName={conceptName}
          onReset={handleReset}
        />
      )}

      {state === APP_STATE.ERROR && (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
            <span className="text-red-500 text-4xl">!</span>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-800">{errorHeader}</h2>
            <p className="text-gray-500 max-w-md mx-auto">{errorMessage}</p>
          </div>
          <button
            onClick={handleReset}
            className="px-8 py-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all font-bold text-gray-600 shadow-sm"
          >
            Back to Home
          </button>
        </div>
      )}
    </div>
  );
}