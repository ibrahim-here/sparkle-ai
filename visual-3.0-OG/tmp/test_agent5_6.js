import { runAgent5 } from '../src/agents/agent5_konvaGenerator.js';
import { runAgent6 } from '../src/agents/agent6_htmlRenderer.js';
import fs from 'fs';

const context = {
    concept: "Functions in C++",
    concept_key: "functions",
    enriched_query: "what are function in c++",
    retrieved_chunks: [
        "A function is a block of code that performs a specific task.",
        "Functions help in code reusability."
    ],
    milestones_philosophy: null,
    syllabus_meta: null
};

async function test() {
    console.log("Running Agent 5...");
    const a5 = await runAgent5(context);
    console.log("Agent 5 success:", a5.success);
    
    if (a5.success) {
        console.log("Running Agent 6...");
        const a6 = await runAgent6(a5.milestones, context.concept);
        console.log("Agent 6 success:", a6.success);
        if (a6.success) {
            fs.writeFileSync('./tmp/final_output.html', a6.html);
            console.log("Wrote HTML to tmp/final_output.html");
            console.log("\\n--- HTML SNIPPET ---");
            console.log(a6.html.substring(0, 1000) + "...");
        } else {
            console.error("Agent 6 Error:", a6.error);
        }
    } else {
        console.error("Agent 5 Error:", a5.error);
    }
}

test();
