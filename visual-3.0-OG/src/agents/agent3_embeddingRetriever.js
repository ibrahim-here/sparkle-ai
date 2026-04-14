/**
 * Agent 3: Embedding Retriever
 * Pure JS — no API call.
 * Searches JSONL chapter files using keyword overlap scoring.
 * Returns top relevant text chunks to feed into Agent 5.
 */

// ── Vite glob import — loads all JSONL files as raw strings ──
const chapters = import.meta.glob('../data/chapter/*.jsonl', { query: '?raw', eager: true });

export async function runAgent3(agent1Result, agent2Result) {
    const { enriched_query, concept_key, keywords = [] } = agent1Result;
    const { chapter_file, topic_cluster, in_scope } = agent2Result;

    // ── Guard: skip if out of scope ──
    if (!in_scope) {
        console.warn('[Agent 3] Skipping — topic is out of scope');
        return { retrieved_chunks: [] };
    }

    console.log(`[Agent 3] Retrieving from "${chapter_file}" for concept "${concept_key}"`);

    // ── Load the chapter JSONL file ──
    const filename = `../data/chapter/${chapter_file}_dataset.jsonl`;
    let rawData = chapters[filename];

    // Handle Vite raw import (may return object with .default)
    if (rawData && typeof rawData !== 'string' && rawData.default) {
        rawData = rawData.default;
    }

    if (!rawData || typeof rawData !== 'string') {
        console.warn(`[Agent 3] File not found: ${filename}`);
        return {
            retrieved_chunks: [
                `No textbook material found for "${concept_key}". The diagram will be generated using general C++ knowledge.`
            ]
        };
    }

    // ── Parse JSONL lines ──
    const lines = rawData
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0);

    if (lines.length === 0) {
        console.warn(`[Agent 3] Empty file: ${filename}`);
        return { retrieved_chunks: [`Empty dataset for ${chapter_file}.`] };
    }

    // ── Build search terms from all available signals ──
    const searchTerms = buildSearchTerms(enriched_query, concept_key, keywords, topic_cluster);

    console.log(`[Agent 3] Search terms: [${searchTerms.join(', ')}]`);

    // ── Score each line ──
    const scoredChunks = lines.map((line, lineIdx) => {
        try {
            const data = JSON.parse(line);
            const textContent = extractAllText(data).toLowerCase();
            const score = computeScore(textContent, searchTerms, concept_key);
            return { data, score, lineIdx };
        } catch {
            return { data: null, score: 0, lineIdx };
        }
    }).filter(chunk => chunk.data !== null);

    // ── Sort by score descending ──
    scoredChunks.sort((a, b) => b.score - a.score);

    // ── Take top 5 chunks ──
    const TOP_N = 5;
    const topChunks = scoredChunks.slice(0, TOP_N);

    if (topChunks.length === 0 || topChunks[0].score === 0) {
        console.warn('[Agent 3] No relevant chunks found — returning general fallback');
        // Return the first 3 lines of the file as a general fallback
        const fallbackChunks = scoredChunks.slice(0, 3).map(c => formatChunk(c.data));
        return {
            retrieved_chunks: fallbackChunks.length > 0
                ? fallbackChunks
                : [`General content for ${concept_key.replace(/_/g, ' ')} from the PF course.`]
        };
    }

    console.log(`[Agent 3] ✓ Found ${topChunks.length} relevant chunks (top score: ${topChunks[0].score})`);

    // ── Format chunks into readable text for Agent 5 ──
    const formattedChunks = topChunks.map(chunk => formatChunk(chunk.data));

    return {
        retrieved_chunks: formattedChunks,
    };
}

// ─── BUILD SEARCH TERMS ───────────────────────────────────
function buildSearchTerms(enriched_query, concept_key, keywords, topic_cluster) {
    const terms = new Set();

    // From enriched query — words longer than 3 chars
    enriched_query
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 3)
        .forEach(w => terms.add(w.replace(/[^a-z0-9]/g, '')));

    // From concept key
    concept_key.split('_').forEach(w => terms.add(w));
    terms.add(concept_key.replace(/_/g, ' '));

    // From Agent 1 keywords array
    if (Array.isArray(keywords)) {
        keywords.forEach(k => terms.add(k.toLowerCase()));
    }

    // From topic cluster
    if (topic_cluster) {
        topic_cluster
            .toLowerCase()
            .split(/[,\s]+/)
            .filter(w => w.length > 3)
            .forEach(w => terms.add(w));
    }

    // Remove empty strings
    terms.delete('');
    terms.delete('the');
    terms.delete('and');
    terms.delete('for');
    terms.delete('with');

    return [...terms];
}

// ─── EXTRACT ALL TEXT FROM A JSONL RECORD ─────────────────
function extractAllText(data) {
    const parts = [];

    if (data.concepts && Array.isArray(data.concepts))
        parts.push(data.concepts.join(' '));

    if (data.explanations && Array.isArray(data.explanations))
        parts.push(data.explanations.join(' '));

    if (data.definitions && Array.isArray(data.definitions))
        parts.push(data.definitions.map(d => `${d.term || ''} ${d.definition || ''}`).join(' '));

    if (data.examples && Array.isArray(data.examples))
        parts.push(data.examples.map(e => typeof e === 'string' ? e : JSON.stringify(e)).join(' '));

    if (data.code_examples && Array.isArray(data.code_examples))
        parts.push(data.code_examples.join(' '));

    if (data.text && typeof data.text === 'string')
        parts.push(data.text);

    if (data.content && typeof data.content === 'string')
        parts.push(data.content);

    if (data.description && typeof data.description === 'string')
        parts.push(data.description);

    // Catch-all: stringify any remaining string values
    if (parts.length === 0) {
        Object.values(data).forEach(v => {
            if (typeof v === 'string') parts.push(v);
            if (Array.isArray(v)) parts.push(v.filter(x => typeof x === 'string').join(' '));
        });
    }

    return parts.join(' ');
}

// ─── COMPUTE RELEVANCE SCORE ──────────────────────────────
function computeScore(textContent, searchTerms, concept_key) {
    let score = 0;

    searchTerms.forEach(term => {
        // Exact word match = 2 points
        const wordRegex = new RegExp(`\\b${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
        const matches = (textContent.match(wordRegex) || []).length;
        score += matches * 2;

        // Substring match = 1 point
        if (textContent.includes(term.toLowerCase())) score += 1;
    });

    // Bonus: exact concept_key match
    if (textContent.includes(concept_key.replace(/_/g, ' '))) score += 5;
    if (textContent.includes(concept_key.replace(/_/g, ''))) score += 3;

    return score;
}

// ─── FORMAT A CHUNK INTO READABLE TEXT ───────────────────
function formatChunk(data) {
    const parts = [];

    if (data.concepts?.length)
        parts.push(`Concepts: ${data.concepts.join(', ')}`);

    if (data.definitions?.length)
        parts.push(`Definitions: ${data.definitions.map(d => `${d.term}: ${d.definition}`).join(' | ')}`);

    if (data.explanations?.length)
        parts.push(`Explanations: ${data.explanations.join(' ')}`);

    if (data.examples?.length)
        parts.push(`Examples: ${data.examples.map(e => typeof e === 'string' ? e : JSON.stringify(e)).join(' | ')}`);

    if (data.code_examples?.length)
        parts.push(`Code: ${data.code_examples.join(' | ')}`);

    if (data.text)
        parts.push(data.text);

    if (data.content)
        parts.push(data.content);

    // If nothing structured was found, return raw
    if (parts.length === 0) {
        return JSON.stringify(data).slice(0, 500);
    }

    return parts.join('\n');
}