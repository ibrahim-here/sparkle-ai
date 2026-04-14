
import fs from 'fs';
import path from 'path';
import { Groq } from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY || '';
const groq = new Groq({ apiKey });

import { runAgent1 } from './src/agents/agent1_promptEngineer.js';
import { runAgent2 } from './src/agents/agent2_scopeValidator.js';
import { runAgent3 } from './src/agents/agent3_embeddingRetriever.js';
import { runAgent4 } from './src/agents/agent4_diagramPhilosopher.js';
import { runAgent5 } from './src/agents/agent5_konvaGenerator.js';
import { runAgent6 } from './src/agents/agent6_htmlRenderer.js';

const userQuery = "what are function in c++";

async function main() {
    console.log("--- START TEST RUN (ACTUAL AGENTS) ---");
    
    console.log("Running Agent 1...");
    const a1 = await runAgent1(userQuery);
    console.log("AGENT 1 OUTPUT:", JSON.stringify(a1, null, 2));

    console.log("Running Agent 2...");
    const a2 = runAgent2(a1);
    console.log("AGENT 2 OUTPUT:", JSON.stringify(a2, null, 2));

    console.log("Running Agent 3...");
    const a3 = await runAgent3(a1, a2);
    console.log("AGENT 3 OUTPUT:", JSON.stringify(a3, null, 2));

    console.log("Running Agent 4...");
    const a4 = runAgent4(a1);
    console.log("AGENT 4 OUTPUT:", JSON.stringify(a4, null, 2));

    console.log("Running Agent 5 (Generative Phase)...");
    const context = {
        concept: a1.concept_key.replace(/_/g, ' '),
        concept_key: a1.concept_key,
        enriched_query: a1.enriched_query,
        retrieved_chunks: a3.retrieved_chunks,
        milestones_philosophy: a4.milestones,
        syllabus_meta: a2
    };
    
    const a5Result = await runAgent5(context);
    console.log("AGENT 5 STATUS:", a5Result.success ? "SUCCESS" : "FAILED");
    if (a5Result.success) {
        console.log("AGENT 5 MILESTONES (FULL OUTPUT):");
        console.log(JSON.stringify(a5Result.milestones, null, 2));

        console.log("Running Agent 6 (HTML Renderer)...");
        const a6Result = await runAgent6(a5Result.milestones, context.concept);
        console.log("AGENT 6 STATUS:", a6Result.success ? "SUCCESS" : "FAILED");
        if (a6Result.success) {
            console.log("Writing Agent 6 HTML to tmp/test_output.html");
            fs.writeFileSync('./tmp/test_output.html', a6Result.html || '');
        } else {
            console.error("Agent 6 Error:", a6Result.error);
        }
    } else {
        console.error("Agent 5 Error:", a5Result.error);
    }
}


main();
