const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY || "";

const PROMPT_A = `# PF Visual Learner — JSON Generator Prompt
# Paste this ENTIRE prompt to Claude, then replace [CONCEPT] at the bottom.
# Claude will output the Agent 5 JSON that you paste into CLAUDE_RENDERER_PROMPT.md

---

You are an expert Konva.js developer and C++ educator generating interactive learning diagrams for beginner Programming Fundamentals (PF) students at a university level.

Your output will be rendered by a Konva.js engine that interprets JSON canvas specs. You must follow every rule below with zero deviation.

---

## YOUR TASK

Generate exactly 5 milestone objects as a JSON array for the concept I give you at the bottom of this prompt.

---

## OUTPUT FORMAT — ABSOLUTELY NON-NEGOTIABLE

- Return ONLY a raw JSON array
- Start with \`[\` and end with \`]\`
- NO markdown, NO backticks, NO explanation before or after
- EXACTLY 5 objects in the array
- Every object follows this exact structure:

\`\`\`
{
  "milestone_number": 1,
  "title": "Short Title",
  "explanation_html": "<p>At least 4 sentences. Use <strong>bold</strong> for key terms and <code>code</code> for C++ snippets. Explain what the diagram shows, what the student should click, and the key concept.</p>",
  "canvas_spec": {
    "width": 700,
    "height": 380,
    "background": "#1E1E2E",
    "state": { },
    "shapes": [ ],
    "buttons": [ ],
    "animations": [ ]
  }
}
\`\`\`

---

## CANVAS SPEC — SHAPES

Use ONLY these exact type strings (case-sensitive):
\`"Rect"\` \`"Circle"\` \`"Text"\` \`"Arrow"\` \`"Line"\` \`"Ellipse"\` \`"Group"\`

### Rect
\`\`\`json
{ "type": "Rect", "id": "box_id", "x": 100, "y": 80, "width": 120, "height": 44, "fill": "#181825", "stroke": "#89B4FA", "strokeWidth": 2, "cornerRadius": 6, "opacity": 1 }
\`\`\`

### Circle
\`\`\`json
{ "type": "Circle", "id": "dot_id", "x": 200, "y": 100, "radius": 10, "fill": "#F9E2AF", "opacity": 1 }
\`\`\`

### Text — ALL 8 FIELDS MANDATORY
\`\`\`json
{ "type": "Text", "id": "lbl_id", "x": 100, "y": 86, "width": 120, "text": "Label", "fontSize": 13, "fill": "#CDD6F4", "fontFamily": "JetBrains Mono", "align": "center" }
\`\`\`

### Arrow
\`\`\`json
{ "type": "Arrow", "id": "arr_id", "points": [100, 80, 200, 80], "stroke": "#6272a4", "fill": "#6272a4", "strokeWidth": 2, "pointerLength": 8, "pointerWidth": 6 }
\`\`\`

### Line (use for diamonds/polygons)
\`\`\`json
{ "type": "Line", "id": "diamond_id", "points": [80, 0, 160, 30, 80, 60, 0, 30], "closed": true, "fill": "#181825", "stroke": "#F9E2AF", "strokeWidth": 2 }
\`\`\`

### Group
\`\`\`json
{ "type": "Group", "id": "grp_id", "x": 100, "y": 80, "children": [ ] }
\`\`\`
Children use coordinates RELATIVE to the group's x,y.

---

## SHAPE RULES — THESE WILL BREAK THE RENDERER IF VIOLATED

**RULE 1 — NO TEXT PROPERTY ON NON-TEXT SHAPES.**
Rect, Circle, Arrow, Line, Ellipse NEVER have a \`"text"\` field.
Always make a separate Text shape for any label.

**RULE 2 — EVERY Text shape needs ALL 8 fields:**
\`id\`, \`x\`, \`y\`, \`width\`, \`text\`, \`fontSize\`, \`fill\`, \`fontFamily\`, \`align\`
Missing any one of these crashes the renderer.

**RULE 3 — EVERY shape modified by animation needs a unique \`id\`.**

**RULE 4 — CANVAS BOUNDARY. Hard limits:**
- No shape: \`x < 0\` or \`x > 690\`
- No shape: \`y < 0\` or \`y > 370\`
- No Rect or Text: \`x + width > 700\`
- No Arrow point: x > 700 or y > 380
- Check every shape before finalizing.

**RULE 5 — MAX 15 shapes per milestone.**
Keep diagrams focused. 8–12 shapes is ideal.

---

## STATE FORMAT

Declare every variable animations will read or write:
\`\`\`json
{ "step": 0, "i": 0, "limit": 5, "phase": "init", "done": false }
\`\`\`
Only include variables actually used in this milestone's animations.
NEVER put arrays or objects as state values — only numbers, strings, booleans.

---

## BUTTONS FORMAT

\`\`\`json
{ "id": "btn_step", "label": "▶ Next Step", "style": "primary", "action": "stepForward" }
{ "id": "btn_reset", "label": "↺ Reset", "style": "warning", "action": "reset" }
\`\`\`

Styles: \`"primary"\` | \`"success"\` | \`"warning"\` | \`"danger"\`

**MANDATORY: Every milestone MUST have:**
1. At least one action button (stepForward or similar)
2. A reset button with \`"action": "reset"\`

---

## ANIMATIONS FORMAT

\`\`\`json
{
  "trigger": "stepForward",
  "steps": [
    { "state_update": "step", "value_expr": "state.step + 1" },
    { "target_id": "counter_txt", "property": "text", "value_expr": "'Step: ' + (state.step + 1)" },
    { "target_id": "box_0", "property": "fill", "value_expr": "state.step === 0 ? '#89B4FA33' : '#181825'" }
  ]
}
\`\`\`

**THE MOST IMPORTANT ANIMATION RULE:**
\`state_update\` steps run first using the OLD state.
Shape update steps (\`target_id\`) run second using the NEW state.
So to reference the NEW value of \`state.step\` in a shape update, compute it inline:

\`\`\`
WRONG: "value_expr": "'i = ' + state.i"          ← reads OLD i
RIGHT: "value_expr": "'i = ' + (state.i + 1)"    ← computes new i inline
\`\`\`

**RESET trigger is MANDATORY** — must restore ALL changed shapes and ALL state vars to initial values.

**MAX 12 steps per trigger.**

**Available properties to animate:**
\`text\`, \`x\`, \`y\`, \`fill\`, \`stroke\`, \`opacity\`, \`strokeWidth\`, \`width\`, \`height\`, \`radius\`, \`shadowBlur\`, \`visible\`, \`points\`, \`fontSize\`, \`scaleX\`, \`scaleY\`

---

## COLOR PALETTE — USE ONLY THESE

| Role | Hex |
|---|---|
| Canvas background | \`#1E1E2E\` |
| Panel / cell background | \`#181825\` |
| Darker background | \`#13131f\` |
| Primary blue | \`#89B4FA\` |
| Success green | \`#A6E3A1\` |
| Error red | \`#F38BA8\` |
| Warning yellow | \`#F9E2AF\` |
| Body text | \`#CDD6F4\` |
| Muted gray | \`#6272a4\` |
| Purple accent | \`#CBA6F7\` |
| Teal accent | \`#94E2D5\` |
| Orange accent | \`#FAB387\` |

---

## THE 5-MILESTONE LEARNING ARC — FOLLOW EXACTLY

### MILESTONE 1 — MOTIVATION
**Purpose:** Show WHY this concept exists. What problem does it solve?
**Must show:** Visual contrast — the "without" state vs the "with" state.
**Interaction:** One button transforms the diagram from messy/inefficient to organized.
**Must have:** At least 5 visual elements in the "without" state. status_label explains what changed.

### MILESTONE 2 — CORE STRUCTURE
**Purpose:** Show the most basic form of the concept with every part labeled.
**Must show:** Colored zones for each part. A live state tracker (step counter or variable display).
**Interaction:** Step-through button walks through each labeled part one at a time.
**Must have:** \`state: { "step": 0 }\` and a status_label that updates with each step.

### MILESTONE 3 — EXECUTION / ANATOMY
**Purpose:** Show how the concept executes step by step.
**Must show:** A moving indicator (Circle dot or Arrow) that advances through the diagram. A counter or table that builds as user clicks.
**Interaction:** "Next Step" button advances the indicator and updates the counter.
**Must have:** A Circle or Arrow shape that changes \`x\` or \`y\` position via animation.

### MILESTONE 4 — VARIANTS / EDGE CASES
**Purpose:** Show an important variation or edge case of the concept.
**Must show:** Side-by-side comparison of two related things, OR a toggle between two states.
**Interaction:** Toggle button or two separate buttons to switch between variants.
**Must have:** A clear visual difference between the two variants using color contrast.

### MILESTONE 5 — REAL-WORLD USE CASE
**Purpose:** Solve a practical problem using this concept with real data.
**Must show:** Actual data values (scores, temperatures, names, etc.), a pointer that sweeps through data, and a result that builds step by step.
**Interaction:** "Process Next" button advances through data one item at a time.
**Must have:** A final result displayed in green (\`#A6E3A1\`) when all data is processed.

---

## STATUS LABEL — MANDATORY IN ALL 5 MILESTONES

Every milestone MUST have a Text shape with id \`"status_label"\`:
\`\`\`json
{ "type": "Text", "id": "status_label", "x": 20, "y": 340, "width": 660, "text": "Click the button to begin.", "fontSize": 12, "fill": "#6272a4", "fontFamily": "JetBrains Mono", "align": "center" }
\`\`\`
This label MUST update in every animation trigger to describe what just happened in plain English.

---

## CONCEPT-SPECIFIC DIAGRAM RULES

### For ARRAYS:
- Show cells as individual Rect boxes in a row, gap between them
- Index labels \`[0]\`, \`[1]\` go BELOW each cell as separate Text shapes
- Values go INSIDE cells as separate Text shapes
- Memory addresses (\`0x100\`, \`0x104\`) go below index labels in M3
- Moving pointer: Circle that changes \`x\` position

### For LOOPS:
- Show the 4 phases: Init → Check → Body → Update
- Condition check = Line diamond shape (4-point closed polygon)
- Counter variable = Rect + Text that updates each iteration
- Loop-back arrow goes on the LEFT side, never through content

### For FUNCTIONS:
- Caller box and function box as separate Rects
- Parameters = Arrow from caller to function
- Return value = different colored Arrow going back
- Stack frame = labeled Rect with variable Texts inside

### For IF/ELSE:
- Diamond for condition (Line, closed:true, 4 points)
- TRUE path goes DOWN, FALSE path goes RIGHT
- Both paths must visually merge at a bottom point

### For STRUCTS:
- Large Rect with horizontal Line dividers inside
- Each member = Text label left + value Text right
- Multiple struct instances = separate large Rects side by side

### For SORTING:
- Array cells as Rect boxes
- Active comparison = highlighted stroke on two adjacent cells
- Swap = two cells exchange x positions
- Sorted region = cells turn green progressively

---

## JSON SYNTAX RULES — VIOLATIONS CAUSE PARSE ERRORS

1. Comma between EVERY property: \`"a": 1, "b": 2\` not \`"a": 1 "b": 2\`
2. Comma between EVERY array element
3. NO trailing comma before \`}\` or \`]\`
4. All strings use double quotes \`"\` never single quotes \`'\`
5. value_expr strings ARE allowed to use single quotes internally: \`"value_expr": "'hello ' + state.i"\`

---

## FINAL CHECKLIST — VERIFY BEFORE OUTPUTTING

- [ ] Exactly 5 milestone objects
- [ ] Every milestone has \`milestone_number\`, \`title\`, \`explanation_html\`, \`canvas_spec\`
- [ ] Every \`canvas_spec\` has \`width:700\`, \`height:380\`, \`background\`, \`state\`, \`shapes\`, \`buttons\`, \`animations\`
- [ ] Every milestone has a stepForward (or equivalent) button AND a reset button
- [ ] Every milestone has a reset animation trigger
- [ ] Every Text shape has all 8 fields: \`id\`, \`x\`, \`y\`, \`width\`, \`text\`, \`fontSize\`, \`fill\`, \`fontFamily\`, \`align\`
- [ ] No shape has \`x + width > 700\`
- [ ] No Rect/Circle/Arrow/Line has a \`"text"\` property
- [ ] Every shape referenced in animations has a unique \`id\`
- [ ] Every milestone has a \`status_label\` Text shape
- [ ] State only contains numbers, strings, or booleans — no arrays or objects
- [ ] MAX 15 shapes per milestone
- [ ] MAX 12 steps per animation trigger
- [ ] value_expr computes new values INLINE (not relying on stale state)
- [ ] Milestone 5 shows real data and a final result

---

## CONCEPT TO GENERATE:
\n`;

// ─── SYSTEM PROMPT ────────────────────────────────────────
const SYSTEM_PROMPT = `You are an expert React + Konva.js developer and computer science educator specializing in interactive visual learning for beginner C++ students.

Your job is to generate exactly 5 milestone components for a given PF (Programming Fundamentals) concept. Each milestone is a complete, self-contained interactive learning experience using Konva.js for canvas diagrams.

═══════════════════════════════════════════════════════════
OUTPUT FORMAT — ABSOLUTELY CRITICAL
═══════════════════════════════════════════════════════════

Return ONLY a valid JSON array. 
- NO markdown
- NO backticks
- NO explanation text before or after
- NO preamble
- Start your response with [ and end with ]
- The array must contain EXACTLY 5 objects

Each object has this exact structure:
{
  "milestone_number": 1,
  "title": "Short Title Here",
  "explanation_html": "<p>Full explanation with <strong>key terms bold</strong> and <code>code snippets</code>. Must be at least 4 sentences explaining the concept, what the diagram shows, and what the user should do to interact with it.</p>",
  "canvas_spec": { ...see Canvas Spec Format below... }
}

═══════════════════════════════════════════════════════════
CANVAS SPEC FORMAT
═══════════════════════════════════════════════════════════

{
  "width": 700,
  "height": 380,
  "background": "#1E1E2E",
  "state": { ...all variables this milestone needs... },
  "shapes": [ ...array of shape objects... ],
  "buttons": [ ...array of button objects... ],
  "animations": [ ...array of animation trigger objects... ]
}

─── SHAPE TYPES (EXACT TYPE NAMES — NO VARIATIONS) ───

Use ONLY these exact type strings: "Rect", "Circle", "Text", "Arrow", "Line", "Ellipse", "Group"
NEVER use: "rectangle", "rect", "box", "circle", "text", "arrow", "line", "ellipse", "group"

Rect:
{
  "type": "Rect",
  "id": "unique_snake_case_id",
  "x": 100, "y": 50,
  "width": 160, "height": 44,
  "fill": "#181825",
  "stroke": "#89B4FA",
  "strokeWidth": 2,
  "cornerRadius": 8,
  "opacity": 1
}

Circle:
{
  "type": "Circle",
  "id": "unique_id",
  "x": 350, "y": 80,
  "radius": 10,
  "fill": "#F9E2AF",
  "opacity": 1
}

Text:
{
  "type": "Text",
  "id": "unique_id",
  "x": 100, "y": 55,
  "width": 160,
  "text": "Your Label Here",
  "fontSize": 13,
  "fill": "#CDD6F4",
  "fontFamily": "JetBrains Mono",
  "align": "center",
  "fontStyle": "normal"
}

Arrow:
{
  "type": "Arrow",
  "id": "unique_id",
  "points": [100, 74, 100, 110],
  "fill": "#6272a4",
  "stroke": "#6272a4",
  "strokeWidth": 1.5,
  "pointerLength": 8,
  "pointerWidth": 6
}

Line:
{
  "type": "Line",
  "id": "unique_id",
  "points": [80, 0, 160, 22, 80, 44, 0, 22],
  "closed": true,
  "fill": "#181825",
  "stroke": "#F9E2AF",
  "strokeWidth": 2
}

═══════════════════════════════════════════════════════════
CRITICAL SHAPE RULES
═══════════════════════════════════════════════════════════

RULE 1 — NO TEXT INSIDE SHAPES:
Rect, Circle, Arrow, Line do NOT have a "text" property.
Always create a SEPARATE Text shape for labels.

RULE 2 — EVERY INTERACTIVE SHAPE NEEDS A UNIQUE ID.

RULE 3 — ALL TEXT SHAPES NEED: id, x, y, width, text, fontSize, fill, fontFamily, align

RULE 4 — CANVAS BOUNDARY: x + width <= 700, y + height <= 380. No exceptions.

═══════════════════════════════════════════════════════════
BUTTONS FORMAT
═══════════════════════════════════════════════════════════

{ "id": "btn_step", "label": "▶ Run One Step", "style": "primary", "action": "stepForward" }
{ "id": "btn_reset", "label": "↺ Reset", "style": "warning", "action": "reset" }

Button styles: "primary" | "success" | "warning" | "danger"
MANDATORY: Every milestone MUST have a stepForward button AND a reset button.

═══════════════════════════════════════════════════════════
ANIMATIONS FORMAT
═══════════════════════════════════════════════════════════

{
  "trigger": "stepForward",
  "steps": [
    { "state_update": "i", "value_expr": "state.i + 1" },
    { "target_id": "counter_text", "property": "text", "value_expr": "'i = ' + (state.i + 1)" },
    { "target_id": "status_label", "property": "fill", "value_expr": "'#A6E3A1'" }
  ]
}

ANIMATION ORDERING: compute new values INLINE — do not rely on state after state_update.
RESET: every milestone MUST have a reset trigger restoring all shapes and state.

═══════════════════════════════════════════════════════════
COLOR PALETTE
═══════════════════════════════════════════════════════════

Background: #1E1E2E | Panel: #181825 | Primary: #89B4FA | Success: #A6E3A1
Error: #F38BA8 | Warning: #F9E2AF | Text: #CDD6F4 | Muted: #6272a4

═══════════════════════════════════════════════════════════
MANDATORY MILESTONE PROGRESSION
═══════════════════════════════════════════════════════════

MILESTONE 1 — MOTIVATION: Show the problem this concept solves. Visual contrast.
MILESTONE 2 — CORE STRUCTURE: Basic form, labeled zones, state tracker.
MILESTONE 3 — EXECUTION: Moving indicator, live step table builds as user clicks.
MILESTONE 4 — VARIANTS/EDGE CASES: Side-by-side comparison or toggle.
MILESTONE 5 — REAL-WORLD USE CASE: Real data, pointer sweeps, result builds live.

═══════════════════════════════════════════════════════════
CONTENT RULES
═══════════════════════════════════════════════════════════

1. EXACTLY 5 milestones — never fewer, never more.
2. Code on canvas must be valid C++.
3. Every Text shape must have: id, x, y, width, fontSize, fill, fontFamily, align.
4. Every animated shape must have a unique id.
5. There MUST be a status_label Text that updates during animation.
6. Milestone 5 MUST show a real-world use case with real data values.
7. value_expr must compute new values inline — never rely on stale state.

═══════════════════════════════════════════════════════════
JSON SYNTAX — CRITICAL
═══════════════════════════════════════════════════════════

COMMAS ARE MANDATORY between every property and every array element.
STRINGS must use double quotes only.
NO trailing commas before ] or }.
KEEP SHAPES SIMPLE — fewer shapes per milestone = less chance of JSON errors.
Limit shapes array to MAX 20 shapes per milestone.
Limit animation steps to MAX 15 steps per trigger.
`;

// ─── AGENT 5 MAIN FUNCTION ────────────────────────────────
export async function runAgent5(context) {
  const {
    concept,
    enriched_query,
    milestones_philosophy,
    syllabus_meta,
  } = context;

  // ── CHANGE 1: Skip bulk attempt — go directly to per-milestone ──
  // Reason: bulk attempt requests 5 milestones in one call which
  // generates ~22-24k chars of JSON, exceeding Claude's reliable
  // output window and causing truncation + parse failures every time.
  console.log("[Agent 5] Generating milestones one at a time...");
  const milestones = [];

  for (let i = 1; i <= 5; i++) {
    try {
      console.log(`[Agent 5] Generating milestone ${i}/5...`);
      const singleMessage = buildSingleMilestoneMessage({
        concept,
        enriched_query,
        milestoneNumber: i,
        previousMilestones: milestones,
        milestones_philosophy,
        syllabus_meta,
      });

      const raw = await callClaude(singleMessage, 0.2);
      const parsed = extractSingleMilestone(raw, i);

      if (parsed) {
        milestones.push(parsed);
        console.log(`[Agent 5] ✓ Milestone ${i} generated`);
      } else {
        console.warn(`[Agent 5] ✗ Milestone ${i} failed — using fallback`);
        milestones.push(buildFallbackMilestone(i, concept));
      }

      // Small delay between calls to avoid rate limits
      if (i < 5) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (err) {
      console.warn(`[Agent 5] Milestone ${i} error:`, err.message);
      milestones.push(buildFallbackMilestone(i, concept));
    }
  }

  const validated = validateMilestones(milestones, concept);

  return {
    success: validated.length > 0,
    milestones: validated,
    raw: "per-milestone generation",
  };
}

// ─── CALL CLAUDE ──────────────────────────────────────────
async function callClaude(userMessage, temperature = 0.2) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLAUDE_API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 3000, // ── CHANGE 2: was 8192, caused truncation on single milestone responses
      temperature,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Claude API error: ${err.error?.message || response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ─── BUILD SINGLE MILESTONE MESSAGE ──────────────────────
function buildSingleMilestoneMessage({ concept, enriched_query, milestoneNumber, previousMilestones, milestones_philosophy, syllabus_meta }) {
  const milestoneDescriptions = [
    "MOTIVATION — Show WHY this concept exists. Visual contrast: scattered/messy state vs organized state. One button reveals the solution.",
    "CORE STRUCTURE — Show the most basic form. Label every part with colored zones. Step-through button walks through structure. Show state tracker.",
    "EXECUTION — Show execution step by step. Moving dot or arrow indicator. Live table or counter that updates. Next Step button.",
    "VARIANTS — Show an edge case or important variation. Side-by-side comparison. Toggle button to switch between variants.",
    "REAL-WORLD USE CASE — Practical problem with real data values. Pointer sweeps through data step by step. Result builds live. Final answer highlighted in green.",
  ];

  const prevContext = previousMilestones.length > 0
    ? `\nPrevious milestones used these concepts: ${previousMilestones.map(m => m.title).join(", ")}. Maintain visual consistency.`
    : "";

  return `Generate EXACTLY 1 milestone object (milestone number ${milestoneNumber} of 5) for the concept: "${concept}"

STUDENT QUERY: "${enriched_query}"
${syllabus_meta ? `COURSE CONTEXT: Week ${syllabus_meta.week} — ${syllabus_meta.topic_cluster}` : ""}
${prevContext}

THIS MILESTONE'S PURPOSE:
${milestoneDescriptions[milestoneNumber - 1]}

MILESTONE PHILOSOPHY:
${milestones_philosophy?.milestones?.[milestoneNumber - 1]
      ? JSON.stringify(milestones_philosophy.milestones[milestoneNumber - 1], null, 2)
      : milestoneDescriptions[milestoneNumber - 1]}

Return a JSON object (NOT an array) with this exact structure:
{
  "milestone_number": ${milestoneNumber},
  "title": "...",
  "explanation_html": "<p>...</p>",
  "canvas_spec": {
    "width": 700,
    "height": 380,
    "background": "#1E1E2E",
    "state": { ... },
    "shapes": [ ... MAX 15 shapes ... ],
    "buttons": [ stepForward button + reset button ],
    "animations": [ stepForward trigger + reset trigger ]
  }
}

RULES:
- Return ONLY the JSON object — no array wrapper, no markdown
- MAX 15 shapes in shapes array
- MAX 12 steps per animation trigger
- Canvas: x + width must be <= 700, y + height must be <= 380
- Every Text shape needs: id, x, y, width, fontSize, fill, fontFamily, align
- Must have status_label Text that updates during animation
- Must have stepForward button AND reset button
- Must have stepForward animation AND reset animation`;
}

// ─── EXTRACT SINGLE MILESTONE ─────────────────────────────
function extractSingleMilestone(rawText, expectedNumber) {
  let cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  // If it's wrapped in an array, unwrap it
  if (cleaned.startsWith("[")) {
    try {
      const arr = JSON.parse(cleaned);
      if (Array.isArray(arr) && arr.length > 0) return arr[0];
    } catch {
      // Try to extract first object
      const firstObj = cleaned.slice(1, cleaned.lastIndexOf("]")).trim();
      cleaned = firstObj;
    }
  }

  // Find the object boundaries
  const startIdx = cleaned.indexOf("{");
  const endIdx = cleaned.lastIndexOf("}");

  if (startIdx === -1 || endIdx === -1) {
    console.warn(`[Agent 5] No JSON object found for milestone ${expectedNumber}`);
    return null;
  }

  const jsonStr = cleaned.slice(startIdx, endIdx + 1);

  try {
    const parsed = JSON.parse(jsonStr);
    parsed.milestone_number = expectedNumber; // enforce correct number
    return parsed;
  } catch (e) {
    console.warn(`[Agent 5] Parse failed for milestone ${expectedNumber}:`, e.message);
    try {
      const repaired = attemptJSONRepair(jsonStr);
      const parsed = JSON.parse(repaired);
      parsed.milestone_number = expectedNumber;
      return parsed;
    } catch (e2) {
      console.error(`[Agent 5] Repair failed for milestone ${expectedNumber}:`, e2.message);
      return null;
    }
  }
}

// ─── ROBUST JSON REPAIR ───────────────────────────────────
function attemptJSONRepair(jsonStr) {
  let s = jsonStr;

  // 1. Remove control characters
  // eslint-disable-next-line no-control-regex
  s = s.replace(/[\u0000-\u001F\u007F-\u009F]/g, " ");

  // 2. Fix trailing commas
  s = s.replace(/,\s*]/g, "]");
  s = s.replace(/,\s*}/g, "}");

  // 3. Fix missing commas between properties: "val" "key": → "val", "key":
  s = s.replace(/("(?:[^"\\]|\\.)*")\s+("(?:[^"\\]|\\.)*"\s*:)/g, '$1, $2');

  // 4. Fix missing commas after numbers/booleans before a key
  s = s.replace(/(\b(?:true|false|null|\d+(?:\.\d+)?)\b)\s+("(?:[^"\\]|\\.)*"\s*:)/g, '$1, $2');

  // 5. Fix missing commas between } { and ] {
  s = s.replace(/\}\s*\{/g, "}, {");
  s = s.replace(/\]\s*\{/g, "], {");
  s = s.replace(/\}\s*\[/g, "}, [");

  // 6. Fix missing commas after } or ] before a string key
  s = s.replace(/\}\s*("(?:[^"\\]|\\.)*"\s*:)/g, '}, $1');
  s = s.replace(/\]\s*("(?:[^"\\]|\\.)*"\s*:)/g, '], $1');

  // 7. Handle truncated JSON — close all open brackets/braces
  const stack = [];
  let inString = false;
  let escape = false;

  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{' || ch === '[') stack.push(ch);
    else if (ch === '}') { if (stack[stack.length - 1] === '{') stack.pop(); }
    else if (ch === ']') { if (stack[stack.length - 1] === '[') stack.pop(); }
  }

  // Close any unclosed string first
  if (inString) s += '"';

  // Close unclosed brackets in reverse order
  while (stack.length > 0) {
    const open = stack.pop();
    s += open === '{' ? '}' : ']';
  }

  // 8. Final cleanup of trailing commas
  s = s.replace(/,\s*}/g, "}");
  s = s.replace(/,\s*]/g, "]");

  return s;
}

// ─── EXTRACT AND PARSE JSON (kept for reference, no longer called) ───
// eslint-disable-next-line no-unused-vars
function extractAndParseJSON(rawText) {
  let cleaned = rawText
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/gi, "")
    .trim();

  let startIdx = cleaned.indexOf("[");
  let endIdx = cleaned.lastIndexOf("]");

  if (startIdx === -1 || endIdx === -1 || endIdx <= startIdx) {
    if (cleaned.startsWith("{")) {
      cleaned = "[" + cleaned + "]";
      startIdx = 0;
      endIdx = cleaned.length - 1;
    } else {
      throw new Error("No valid JSON array found in response");
    }
  }

  const jsonStr = cleaned.slice(startIdx, endIdx + 1);

  try {
    return JSON.parse(jsonStr);
  } catch (e1) {
    console.warn("[Agent 5] Direct parse failed:", e1.message);
    const posMatch = e1.message.match(/at position (\d+)/);
    if (posMatch) {
      const pos = parseInt(posMatch[1]);
      console.warn("[Agent 5] Error context:", jsonStr.slice(Math.max(0, pos - 80), Math.min(jsonStr.length, pos + 80)));
    }
  }

  try {
    const repaired = attemptJSONRepair(jsonStr);
    return JSON.parse(repaired);
  } catch (e2) {
    console.warn("[Agent 5] Repair failed:", e2.message);
  }

  console.warn("[Agent 5] Attempting milestone-by-milestone extraction...");
  return extractMilestonesManually(jsonStr);
}

// ─── MANUAL MILESTONE EXTRACTION (last resort) ────────────
function extractMilestonesManually(jsonStr) {
  const milestones = [];

  const milestonePattern = /"milestone_number"\s*:\s*(\d+)/g;
  const positions = [];
  let match;

  while ((match = milestonePattern.exec(jsonStr)) !== null) {
    positions.push({ num: parseInt(match[1]), pos: match.index });
  }

  console.log(`[Agent 5] Found ${positions.length} milestone markers`);

  for (let i = 0; i < positions.length; i++) {
    let objStart = positions[i].pos;
    while (objStart > 0 && jsonStr[objStart] !== '{') objStart--;

    const objEnd = i + 1 < positions.length
      ? (() => {
        let p = positions[i + 1].pos;
        while (p > 0 && jsonStr[p] !== '{') p--;
        return p;
      })()
      : jsonStr.length;

    let objStr = jsonStr.slice(objStart, objEnd).trim();

    if (objStr.endsWith(",")) objStr = objStr.slice(0, -1);

    try {
      const repaired = attemptJSONRepair(objStr);
      const parsed = JSON.parse(repaired);
      milestones.push(parsed);
      console.log(`[Agent 5] ✓ Extracted milestone ${positions[i].num}`);
    } catch (e) {
      console.warn(`[Agent 5] ✗ Could not extract milestone ${positions[i].num}:`, e.message);
      milestones.push(buildFallbackMilestone(positions[i].num, "the concept"));
    }
  }

  if (milestones.length === 0) {
    throw new Error("Could not extract any milestones from response");
  }

  return milestones;
}

// ─── FALLBACK MILESTONE ───────────────────────────────────
function buildFallbackMilestone(num, concept) {
  const titles = [
    "Why We Need This",
    "Core Structure",
    "Step-by-Step Execution",
    "Variants & Edge Cases",
    "Real-World Application",
  ];

  return {
    milestone_number: num,
    title: titles[num - 1] || `Milestone ${num}`,
    explanation_html: `<p>This milestone covers <strong>${concept}</strong> — part ${num} of 5. The diagram below shows an interactive visualization. Click the Step button to walk through the concept step by step. Use Reset to start over.</p>`,
    canvas_spec: {
      width: 700,
      height: 380,
      background: "#1E1E2E",
      state: { step: 0 },
      shapes: [
        {
          type: "Text", id: "fallback_title",
          x: 20, y: 60, width: 660,
          text: `${concept} — Milestone ${num}`,
          fontSize: 22, fill: "#89B4FA",
          fontFamily: "JetBrains Mono", align: "center",
        },
        {
          type: "Text", id: "fallback_msg",
          x: 20, y: 160, width: 660,
          text: "Content is being generated. Please try again.",
          fontSize: 14, fill: "#6272a4",
          fontFamily: "JetBrains Mono", align: "center",
        },
        {
          type: "Text", id: "status_label",
          x: 20, y: 320, width: 660,
          text: "Click Reset to reload.",
          fontSize: 12, fill: "#6272a4",
          fontFamily: "JetBrains Mono", align: "center",
        },
      ],
      buttons: [
        { id: "btn_step", label: "▶ Step", style: "primary", action: "stepForward" },
        { id: "btn_reset", label: "↺ Reset", style: "warning", action: "reset" },
      ],
      animations: [
        {
          trigger: "stepForward",
          steps: [
            { state_update: "step", value_expr: "state.step + 1" },
            { target_id: "status_label", property: "text", value_expr: "'Step ' + (state.step + 1)" },
          ],
        },
        {
          trigger: "reset",
          steps: [
            { state_update: "step", value_expr: "0" },
            { target_id: "status_label", property: "text", value_expr: "'Click Reset to reload.'" },
          ],
        },
      ],
    },
  };
}

// ─── VALIDATE MILESTONES ──────────────────────────────────
function validateMilestones(data, concept) {
  if (!Array.isArray(data)) {
    console.error("[Agent 5] Output is not an array");
    return [];
  }

  const valid = [];

  data.forEach((milestone, idx) => {
    if (!milestone) return;

    // Auto-fix canvas dimensions
    if (milestone.canvas_spec) {
      const cs = milestone.canvas_spec;
      cs.width = 700;
      cs.height = 380;

      // Auto-add missing reset button
      if (cs.buttons && !cs.buttons.some(b => b.action === "reset")) {
        cs.buttons.push({ id: "btn_reset_auto", label: "↺ Reset", style: "warning", action: "reset" });
      }

      // Clamp overflowing shapes
      if (cs.shapes) {
        cs.shapes = cs.shapes.map(s => clampShape(s, idx + 1));
      }
    }

    valid.push({
      ...milestone,
      milestone_number: milestone.milestone_number || idx + 1,
      title: milestone.title || `Milestone ${idx + 1}`,
      explanation_html: milestone.explanation_html || `<p>Interactive diagram for <strong>${concept}</strong>.</p>`,
    });
  });

  // Pad to 5 if needed
  while (valid.length < 5) {
    valid.push(buildFallbackMilestone(valid.length + 1, concept));
  }

  return valid.slice(0, 5); // Never return more than 5
}

// ─── CLAMP SHAPE TO CANVAS ────────────────────────────────
function clampShape(shape, milestoneNum) {
  if (!shape) return shape;
  const CANVAS_W = 700;
  const CANVAS_H = 380;
  const clamped = { ...shape };

  if (typeof clamped.x === "number") {
    clamped.x = Math.max(0, Math.min(clamped.x, CANVAS_W - 10));
  }
  if (typeof clamped.y === "number") {
    clamped.y = Math.max(0, Math.min(clamped.y, CANVAS_H - 10));
  }
  if (typeof clamped.x === "number" && typeof clamped.width === "number") {
    const maxW = CANVAS_W - clamped.x - 5;
    if (clamped.width > maxW) clamped.width = Math.max(maxW, 20);
  }
  if (clamped.type === "Arrow" && Array.isArray(clamped.points)) {
    clamped.points = clamped.points.map((v, i) =>
      i % 2 === 0 ? Math.min(Math.max(v, 0), CANVAS_W) : Math.min(Math.max(v, 0), CANVAS_H)
    );
  }
  if (clamped.type === "Group" && Array.isArray(clamped.children)) {
    clamped.children = clamped.children.map(c => clampShape(c, milestoneNum));
  }

  return clamped;
}