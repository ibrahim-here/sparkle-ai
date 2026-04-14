import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCiZGGpHurJv1yrj7BMWDaZXACXmPCmk6Q");

export async function runAgent1(userQuery) {
    const systemPrompt = `You are a prompt engineering expert specializing in computer science education for beginner C++ students (Programming Fundamentals course).

Your job is to take a raw student question and rewrite it as a precise, structured query that will be used to:
1. Validate the topic against the PF course syllabus
2. Retrieve relevant textbook content
3. Generate interactive visual learning diagrams

Output ONLY a valid JSON object with exactly these fields:
{
  "intent": "A one-sentence description of what the student wants to learn",
  "concept_key": "one of the allowed keys listed below",
  "audience": "beginner C++ student",
  "enriched_query": "A detailed, precise rewrite of the question that includes: the concept name, what aspect of it the student is asking about, relevant C++ syntax keywords, and the learning goal. Minimum 2 sentences.",
  "keywords": ["array", "of", "relevant", "search", "terms"],
  "complexity_level": "beginner | intermediate | advanced"
}

concept_key MUST be EXACTLY one of these values (no variations, no other values):
computer_architecture | programming_intro | variables | operators | if_else | loops | nested_loops | functions | function_advanced | file_handling | arrays | sorting | cstrings | 2d_arrays | structs

Rules:
- If the query maps to multiple concepts, pick the MOST SPECIFIC one
- "what are loops" → loops (not nested_loops)
- "bubble sort" → sorting (not arrays)
- "string length" → cstrings (not arrays)
- "2d array" or "matrix" → 2d_arrays
- "struct" or "structure" → structs
- If you cannot confidently map the query to ANY of the allowed concept_keys, still pick the closest one and note it in the intent
- Output ONLY the JSON object. No markdown, no backticks, no explanation.`;

    const modelInstance = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        systemInstruction: systemPrompt,
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,
            maxOutputTokens: 400
        }
    });

    try {
        const result = await modelInstance.generateContent({
            contents: [
                { role: "user", parts: [{ text: `Student question: "${userQuery}"` }] },
            ],
        });

        const raw = result.response.text();
        const parsed = JSON.parse(raw);

        const VALID_KEYS = [
            'computer_architecture', 'programming_intro', 'variables', 'operators',
            'if_else', 'loops', 'nested_loops', 'functions', 'function_advanced',
            'file_handling', 'arrays', 'sorting', 'cstrings', '2d_arrays', 'structs'
        ];

        if (!parsed.concept_key || !VALID_KEYS.includes(parsed.concept_key)) {
            console.warn(`[Agent 1] Invalid concept_key "${parsed.concept_key}" — attempting fuzzy fix`);
            parsed.concept_key = fuzzyMatchConceptKey(userQuery, VALID_KEYS);
        }

        if (!parsed.enriched_query || parsed.enriched_query.length < 20) {
            parsed.enriched_query = `Explain the concept of ${parsed.concept_key.replace(/_/g, ' ')} in C++ for a beginner student. Include syntax, purpose, and a simple example.`;
        }

        if (!parsed.keywords || !Array.isArray(parsed.keywords)) {
            parsed.keywords = parsed.concept_key.replace(/_/g, ' ').split(' ');
        }

        if (!parsed.intent) {
            parsed.intent = `Student wants to understand ${parsed.concept_key.replace(/_/g, ' ')} in C++`;
        }

        parsed.original_query = userQuery;

        console.log(`[Agent 1] ✓ concept_key: "${parsed.concept_key}" | intent: "${parsed.intent}"`);
        return parsed;

    } catch (error) {
        console.error('[Agent 1] Error:', error);

        const fallbackKey = fuzzyMatchConceptKey(userQuery, [
            'computer_architecture', 'programming_intro', 'variables', 'operators',
            'if_else', 'loops', 'nested_loops', 'functions', 'function_advanced',
            'file_handling', 'arrays', 'sorting', 'cstrings', '2d_arrays', 'structs'
        ]);

        return {
            intent: `Student wants to understand ${fallbackKey.replace(/_/g, ' ')}`,
            concept_key: fallbackKey,
            audience: 'beginner C++ student',
            enriched_query: `Explain ${fallbackKey.replace(/_/g, ' ')} in C++ for a beginner. Include definition, syntax, and a simple example.`,
            keywords: fallbackKey.split('_'),
            complexity_level: 'beginner',
            original_query: userQuery,
            fallback: true,
        };
    }
}

function fuzzyMatchConceptKey(query) {
    const q = query.toLowerCase();

    const keywordMap = {
        'loop': 'loops', 'while': 'loops', 'for loop': 'loops', 'do while': 'loops', 'iteration': 'loops',
        'nested loop': 'nested_loops', 'loop inside': 'nested_loops',
        'array': 'arrays', 'arr[': 'arrays', 'index': 'arrays',
        'sort': 'sorting', 'bubble': 'sorting', 'selection sort': 'sorting', 'insertion sort': 'sorting',
        'string': 'cstrings', 'cstring': 'cstrings', 'char array': 'cstrings', 'null terminator': 'cstrings',
        '2d': '2d_arrays', 'matrix': '2d_arrays', 'two dimensional': '2d_arrays',
        'struct': 'structs', 'structure': 'structs',
        'function': 'functions', 'return': 'functions', 'parameter': 'functions',
        'overload': 'function_advanced', 'default param': 'function_advanced',
        'if': 'if_else', 'else': 'if_else', 'condition': 'if_else', 'branch': 'if_else',
        'variable': 'variables', 'datatype': 'variables', 'int ': 'variables',
        'operator': 'operators', 'arithmetic': 'operators', 'logical': 'operators',
        'file': 'file_handling', 'fstream': 'file_handling', 'ifstream': 'file_handling',
        'cpu': 'computer_architecture', 'memory': 'computer_architecture', 'fetch': 'computer_architecture',
        'compile': 'programming_intro', 'compiler': 'programming_intro', 'program': 'programming_intro',
    };

    for (const [keyword, key] of Object.entries(keywordMap)) {
        if (q.includes(keyword)) return key;
    }

    return 'loops';
}