import philosophy from '../data/diagramPhilosophy.json' with { type: 'json' };

/**
 * Agent 4: Diagram Philosopher
 * Pure JS — no API call.
 * Looks up the 5 milestone philosophies for the concept from diagramPhilosophy.json.
 * Also attaches the non-negotiable diagram rules to the context.
 * The returned object is passed directly into Agent 5 as part of its context.
 */
export function runAgent4(agent1Result) {
    const { concept_key } = agent1Result;

    console.log(`[Agent 4] Looking up diagram philosophy for: "${concept_key}"`);

    // ── Primary lookup ──
    let selectedPhilosophy = philosophy[concept_key];

    // ── Fallback: try partial key match ──
    // e.g. if concept_key is "cpp_structure" but philosophy has "variables"
    if (!selectedPhilosophy) {
        const allKeys = Object.keys(philosophy);
        const partialMatch = allKeys.find(key =>
            key.includes(concept_key) || concept_key.includes(key)
        );
        if (partialMatch) {
            console.warn(`[Agent 4] No exact match for "${concept_key}" — using partial match "${partialMatch}"`);
            selectedPhilosophy = philosophy[partialMatch];
        }
    }

    // ── Hard fallback: generic philosophy ──
    if (!selectedPhilosophy) {
        console.warn(`[Agent 4] No philosophy found for "${concept_key}" — using generic fallback`);
        selectedPhilosophy = buildGenericPhilosophy(concept_key);
    }

    // ── Validate milestones array ──
    if (!selectedPhilosophy.milestones || selectedPhilosophy.milestones.length === 0) {
        console.warn(`[Agent 4] Philosophy for "${concept_key}" has no milestones — using generic`);
        selectedPhilosophy = buildGenericPhilosophy(concept_key);
    }

    if (selectedPhilosophy.milestones.length < 5) {
        console.warn(`[Agent 4] Only ${selectedPhilosophy.milestones.length} milestones found — padding to 5`);
        selectedPhilosophy.milestones = padMilestones(selectedPhilosophy.milestones, concept_key);
    }

    // ── Always enforce the global non-negotiables ──
    const GLOBAL_NON_NEGOTIABLES = [
        "Return EXACTLY 5 milestones — no more, no less",
        "Canvas size: fixed 700x380px — NO element may overflow these boundaries",
        "Color palette: bg=#1E1E2E, panel=#181825, primary=#89B4FA, success=#A6E3A1, error=#F38BA8, warning=#F9E2AF, text=#CDD6F4, muted=#6272a4",
        "Every Text shape MUST have: id, x, y, width, fontSize, fill, fontFamily, align",
        "No Rect/Circle/Arrow/Line/Ellipse may have a 'text' property — use separate Text shapes",
        "Every shape modified by animation MUST have a unique id",
        "Every milestone MUST have a stepForward button AND a reset button",
        "Every milestone MUST have a reset animation that restores all shapes and state",
        "Flowchart diamonds: use Line shape with closed:true and 4 points",
        "Code shown on canvas must be syntactically valid C++",
        "There MUST be a status_label or phase_label Text that updates to explain current state",
        "Milestone 5 MUST be a real-world use case with real data values shown on canvas",
        "value_expr in animations must compute new values inline — do not rely on stale state after state_update",
        "Array diagrams: individual Rect cells with gap, index labels below, values inside as separate Text shapes",
    ];

    // Merge with any concept-specific non_negotiables from the philosophy file
    const conceptNonNegotiables = selectedPhilosophy.non_negotiables || [];
    const mergedNonNegotiables = [
        ...GLOBAL_NON_NEGOTIABLES,
        ...conceptNonNegotiables.filter(rule => !GLOBAL_NON_NEGOTIABLES.includes(rule)),
    ];

    console.log(`[Agent 4] ✓ Philosophy loaded — ${selectedPhilosophy.milestones.length} milestones, ${mergedNonNegotiables.length} non-negotiables`);

    return {
        description: selectedPhilosophy.description || `Interactive visualization for ${concept_key}`,
        milestones: selectedPhilosophy.milestones,
        non_negotiables: mergedNonNegotiables,
        concept_key,
    };
}

// ─── BUILD GENERIC PHILOSOPHY (last resort fallback) ──────
function buildGenericPhilosophy(concept_key) {
    const conceptName = concept_key.replace(/_/g, ' ');
    return {
        description: `Visual learning for ${conceptName}`,
        milestones: [
            {
                id: 1,
                title: `What is ${conceptName}?`,
                philosophy: `Show the core concept visually. Use labeled boxes to represent the key elements. Add a button that reveals or animates the concept in action. Show a status label that updates to explain each step.`
            },
            {
                id: 2,
                title: `${conceptName} — Basic Structure`,
                philosophy: `Show the syntax and structure with color-coded zones. Each zone should be a different color. Step-through button walks through each part. Show a variable tracker on canvas.`
            },
            {
                id: 3,
                title: `${conceptName} — Step by Step`,
                philosophy: `Animate the execution of the concept. A moving dot or highlighted box shows the current step. A live table on the right builds as user steps through. Show all state variables updating.`
            },
            {
                id: 4,
                title: `${conceptName} — Variations`,
                philosophy: `Show an edge case or important variation. Side-by-side comparison if applicable. Toggle button lets user switch between variations. Highlight the key difference visually.`
            },
            {
                id: 5,
                title: `${conceptName} — Real Use Case`,
                philosophy: `Show a practical real-world problem solved with this concept. Use real data values (numbers, strings, array contents). Pointer or marker sweeps through data. Result builds step by step. Final result highlighted in green.`
            },
        ],
        non_negotiables: [],
    };
}

// ─── PAD MILESTONES TO 5 ──────────────────────────────────
function padMilestones(existing, concept_key) {
    const conceptName = concept_key.replace(/_/g, ' ');
    const generic = buildGenericPhilosophy(concept_key).milestones;
    const padded = [...existing];

    while (padded.length < 5) {
        const nextId = padded.length + 1;
        padded.push(generic[nextId - 1] || {
            id: nextId,
            title: `${conceptName} — Part ${nextId}`,
            philosophy: `Continue exploring ${conceptName} with an interactive diagram. Show state changes and user interactions.`
        });
    }

    return padded;
}