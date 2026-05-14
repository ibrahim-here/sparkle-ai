import os
import json
import asyncio
import re
from typing import List, Dict, Any
from dotenv import load_dotenv
from utils.ai_utils import call_ai, call_groq

# Load env vars so the key is always fresh
load_dotenv(override=True)

# --- Visual Agent Key Config ---
# Primary provider: Groq (stable, no 503s)
GROQ_PRIMARY_KEY  = os.getenv("visual_agent_groq")
GROQ_BACKUP_KEY   = os.getenv("visual_agent_groq_backup")
# Fallback provider: Gemini (used only if both Groq keys fail)
GEMINI_PRIMARY_KEY = os.getenv("visual_agent")

def call_visual_ai(prompt: str, temperature: float = 0.3, json_mode: bool = False) -> str | None:
    """Try local Ollama first, then fall back to Groq/Gemini."""
    import requests
    try:
        print(f"[Visual Agent] Trying local Ollama (gpt-oss:20b-cloud)...")
        payload = {
            "model": "gpt-oss:20b-cloud",
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": 8192
            }
        }
        if json_mode:
            payload["format"] = "json"
            
        res = requests.post("http://localhost:11434/api/generate", json=payload, timeout=180)
        res.raise_for_status()
        data = res.json()
        if data.get("response"):
            print("[Visual Agent] Ollama successful.")
            return data["response"]
    except Exception as e:
        print(f"[Visual Agent] Ollama failed: {e}. Falling back to Groq...")

    # 1. Groq attempt (primary + backup)
    result = call_groq(
        prompt,
        temperature=temperature,
        primary_key=GROQ_PRIMARY_KEY,
        backup_key=GROQ_BACKUP_KEY,
        json_mode=json_mode
    )
    if result:
        return result

    # 2. Gemini fallback (uses its own backup key via KEY_FALLBACK_MAP)
    print("[Visual Agent] Groq failed, falling back to Gemini...")
    return call_ai(prompt, temperature=temperature, api_key=GEMINI_PRIMARY_KEY, json_mode=json_mode)

# Configuration
CHAPTERS_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "chapters"))

# Agent 2: Scope Map 
SCOPE_MAP = {
    'computer_architecture': {'week': 1, 'lecture': 1, 'chapter_file': 'chapter2', 'topic_cluster': 'Computer Architecture, Memory, Fetch-Decode-Execute Cycle'},
    'programming_intro': {'week': 1, 'lecture': 2, 'chapter_file': 'chapter2', 'topic_cluster': 'Programming Languages, Compiling, Linking, Loading, Variables'},
    'variables': {'week': 2, 'lecture': 3, 'chapter_file': 'chapter2', 'topic_cluster': 'Variables, Data Types, Assignment, Input/Output'},
    'operators': {'week': 3, 'lecture': 5, 'chapter_file': 'chapter4', 'topic_cluster': 'Arithmetic, Logical, Relational Operators, Operator Precedence'},
    'if_else': {'week': 4, 'lecture': 7, 'chapter_file': 'chapter4', 'topic_cluster': 'If/Else Statements, Nested Selection, Conditional Branching'},
    'loops': {'week': 5, 'lecture': 9, 'chapter_file': 'chapter5', 'topic_cluster': 'While Loop, For Loop, Do-While Loop, Repetition Structures'},
    'nested_loops': {'week': 6, 'lecture': 11, 'chapter_file': 'chapter5', 'topic_cluster': 'Nested Loops, Nested Control Structures, Pattern Problems'},
    'functions': {'week': 7, 'lecture': 13, 'chapter_file': 'chapter6', 'topic_cluster': 'Function Definition, Parameters, Return Types, Pass by Value, Pass by Reference, Stack'},
    'function_advanced': {'week': 8, 'lecture': 16, 'chapter_file': 'chapter6', 'topic_cluster': 'Function Overloading, Default Parameters, Top-Down Design, Built-in Functions, Scope'},
    'file_handling': {'week': 9, 'lecture': 17, 'chapter_file': 'chapter7', 'topic_cluster': 'File I/O, ifstream, ofstream, Reading and Writing Text Files'},
    'arrays': {'week': 9, 'lecture': 18, 'chapter_file': 'chapter7', 'topic_cluster': 'Arrays, Memory Layout, Element Access, Initialization, Traversal, Search'},
    'sorting': {'week': 11, 'lecture': 21, 'chapter_file': 'chapter7', 'topic_cluster': 'Bubble Sort, Selection Sort, Insertion Sort, Even/Odd Sort, Merging Arrays'},
    'cstrings': {'week': 12, 'lecture': 23, 'chapter_file': 'chapter7', 'topic_cluster': 'CStrings, Null-Terminated Arrays, String Functions, Character Arrays'},
    '2d_arrays': {'week': 13, 'lecture': 25, 'chapter_file': 'chapter7', 'topic_cluster': '2D Arrays, Row/Column Major Order, Matrix Operations, Diagonal Processing'},
    'structs': {'week': 16, 'lecture': 30, 'chapter_file': 'chapter7', 'topic_cluster': 'Structs, Member Access, Arrays of Structs, Passing Structs to Functions'},
}

# --- Agent 1: Prompt Engineer ---
async def run_agent1(user_query: str) -> Dict[str, Any]:
    system_prompt = """You are the official **Visualizer Agent** of Sparkle AI, a prompt engineering expert specializing in computer science education for beginner C++ students.
Your job is to take a raw student question and rewrite it as a precise, structured query that will be used to generate interactive visual learning diagrams.

Output ONLY a valid JSON object with exactly these fields:
{
  "intent": "...",
  "concept_key": "...",
  "audience": "beginner C++ student",
  "enriched_query": "...",
  "keywords": [...],
  "complexity_level": "beginner | intermediate | advanced"
}

concept_key MUST be chosen from the following list ONLY IF the user's query aligns with it:
[computer_architecture, programming_intro, variables, operators, if_else, loops, nested_loops, functions, function_advanced, file_handling, arrays, sorting, cstrings, 2d_arrays, structs]

CRITICAL: If the user asks about an advanced topic or a concept NOT explicitly covered by the list above (e.g., classes, pointers, OOP, trees, networking, advanced data structures), you MUST set concept_key to "out_of_scope"."""
    
    prompt = f"{system_prompt}\n\nStudent question: \"{user_query}\""
    response = await asyncio.to_thread(call_visual_ai, prompt, 0.1, True)
    
    if not response:
        return {
            "intent": "Unknown",
            "concept_key": "loops",
            "enriched_query": user_query,
            "original_query": user_query
        }
    
    return clean_and_parse_json(response, fallback={
        "intent": f"Understand {user_query}",
        "concept_key": "loops",
        "enriched_query": f"Explain {user_query} in C++ for a beginner.",
        "original_query": user_query
    })

# --- Agent 2: Scope Validator ---
def run_agent2(agent1_result: Dict[str, Any]) -> Dict[str, Any]:
    concept_key = agent1_result.get('concept_key')
    if concept_key in SCOPE_MAP:
        res = SCOPE_MAP[concept_key]
        return {**res, "in_scope": True, "concept_key": concept_key}
    
    # Custom error message for user
    if concept_key == "out_of_scope":
        return {"in_scope": False, "error": "This topic is outside the scope of our current C++ curriculum. Please ask about variables, loops, arrays, etc."}
        
    return {"in_scope": False, "error": f"Topic '{concept_key}' is outside PF scope."}

# --- Agent 3: Keyword-based Retriever (Replaced Vector DB with JSONL) ---
def extract_all_text(data: Dict[str, Any]) -> str:
    parts = []
    if 'concepts' in data: parts.append(" ".join([str(c) for c in data['concepts']]))
    if 'explanations' in data: parts.append(" ".join([str(e) for e in data['explanations']]))
    if 'definitions' in data: parts.append(" ".join([f"{d.get('term','')} {d.get('definition','')}" if isinstance(d, dict) else str(d) for d in data['definitions']]))
    if 'text' in data: parts.append(str(data['text']))
    return " ".join(parts).lower()

def compute_score(text: str, search_terms: List[str], concept_key: str) -> int:
    score = 0
    for term in search_terms:
        if term in text:
            score += 2
    if concept_key.replace('_', ' ') in text:
        score += 5
    return score

async def run_agent3(agent1_result: Dict[str, Any], agent2_result: Dict[str, Any]) -> Dict[str, Any]:
    chapter_file = agent2_result.get('chapter_file')
    concept_key = agent1_result.get('concept_key', '')
    
    file_path = os.path.join(CHAPTERS_DIR, f"{chapter_file}_dataset.jsonl")
    if not os.path.exists(file_path):
        return {"retrieved_chunks": ["No textbook content found."]}

    search_terms = agent1_result.get('keywords', []) + [concept_key.replace('_', ' ')]
    search_terms = [t.lower() for t in search_terms if t]

    scored_chunks = []
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if not line.strip(): continue
                data = json.loads(line)
                text = extract_all_text(data)
                score = compute_score(text, search_terms, concept_key)
                scored_chunks.append({"text": text, "score": score})
        
        # Sort by score and take top 1 to save massive amounts of tokens per request
        scored_chunks.sort(key=lambda x: x['score'], reverse=True)
        top_chunks = [c['text'] for c in scored_chunks[:1] if c['score'] > 0]
        
        if not top_chunks:
            return {"retrieved_chunks": ["General content for " + concept_key]}
        return {"retrieved_chunks": top_chunks}
    except Exception as e:
        print(f"[Visualizer] Agent 3 Error: {e}")
        return {"retrieved_chunks": ["Retrieval failed."]}

# --- Agent 4: Diagram Philosopher ---
def build_generic_philosophy(concept_key: str) -> Dict[str, Any]:
    concept_name = concept_key.replace('_', ' ')
    return {
        "description": f"Visual learning for {concept_name}",
        "milestones": [
            {
                "id": 1,
                "title": f"What is {concept_name}?",
                "philosophy": "Show the core concept visually. Use labeled boxes to represent the key elements. Add a button that reveals or animates the concept in action. Show a status label that updates to explain each step."
            },
            {
                "id": 2,
                "title": f"{concept_name} — Basic Structure",
                "philosophy": "Show the syntax and structure with color-coded zones. Each zone should be a different color. Step-through button walks through each part. Show a variable tracker on canvas."
            },
            {
                "id": 3,
                "title": f"{concept_name} — Step by Step",
                "philosophy": "Animate the execution of the concept. A moving dot or highlighted box shows the current step. A live table on the right builds as user steps through. Show all state variables updating."
            },
            {
                "id": 4,
                "title": f"{concept_name} — Variations",
                "philosophy": "Show an edge case or important variation. Side-by-side comparison if applicable. Toggle button lets user switch between variations. Highlight the key difference visually."
            },
            {
                "id": 5,
                "title": f"{concept_name} — Real Use Case",
                "philosophy": "Show a practical real-world problem solved with this concept. Use real data values (numbers, strings, array contents). Pointer or marker sweeps through data. Result builds step by step. Final result highlighted in green."
            }
        ],
        "non_negotiables": []
    }

def run_agent4(agent1_result: Dict[str, Any]) -> Dict[str, Any]:
    concept_key = agent1_result.get('concept_key', '')
    
    # Try loading philosophy.json
    philosophy_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'diagramPhilosophy.json')
    selected = None
    try:
        with open(philosophy_path, 'r', encoding='utf-8') as f:
            all_philosophy = json.load(f)
            selected = all_philosophy.get(concept_key)
            if not selected:
                # partial match
                for k in all_philosophy.keys():
                    if concept_key in k or k in concept_key:
                        selected = all_philosophy[k]
                        break
    except Exception as e:
        print(f"[Agent 4] Error loading philosophy.json: {e}")

    if not selected or 'milestones' not in selected:
        selected = build_generic_philosophy(concept_key)
        
    while len(selected['milestones']) < 5:
        generic = build_generic_philosophy(concept_key)
        next_id = len(selected['milestones']) + 1
        selected['milestones'].append(generic['milestones'][next_id - 1])

    GLOBAL_NON_NEGOTIABLES = [
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
    ]

    return {
        "description": selected.get('description', f"Interactive visualization for {concept_key}"),
        "milestones": selected['milestones'],
        "non_negotiables": GLOBAL_NON_NEGOTIABLES + selected.get('non_negotiables', []),
        "concept_key": concept_key
    }

# --- Agent 5: Konva Generator ---
async def run_agent5_milestone(context: Dict[str, Any], milestone_num: int) -> Dict[str, Any]:
    system_prompt = """You are the official **Visualizer Agent** of Sparkle AI, an expert React + Konva.js developer and computer science educator specializing in interactive visual learning for beginner C++ students.

Your job is to generate exactly 1 milestone component for a given PF (Programming Fundamentals) concept. Each milestone is a complete, self-contained interactive learning experience using Konva.js for canvas diagrams.

═══════════════════════════════════════════════════════════
OUTPUT FORMAT — ABSOLUTELY CRITICAL
═══════════════════════════════════════════════════════════

Return ONLY a valid JSON object. 
- NO markdown
- NO backticks
- NO explanation text before or after
- NO preamble

The object has this exact structure:
{
  "milestone_number": X,
  "title": "Short Title Here",
  "explanation_html": "<p>Full explanation with <strong>key terms bold</strong> and <code>code snippets</code>. Must be at least 4 sentences explaining the concept, what the diagram shows, and what the user should do to interact with it.</p>",
  "canvas_spec": {
    "width": 700,
    "height": 380,
    "background": "#1E1E2E",
    "state": { ...all variables this milestone needs... },
    "shapes": [ ...array of shape objects... ],
    "buttons": [ ...array of button objects... ],
    "animations": [ ...array of animation trigger objects... ]
  }
}

─── SHAPE TYPES (EXACT TYPE NAMES — NO VARIATIONS) ───
Use ONLY these exact type strings: "Rect", "Circle", "Text", "Arrow", "Line", "Ellipse", "Group"
NEVER use: "rectangle", "rect", "box", "circle", "text", "arrow", "line", "ellipse", "group"

Rect:
{ "type": "Rect", "id": "unique_id", "x": 100, "y": 50, "width": 160, "height": 44, "fill": "#181825", "stroke": "#89B4FA", "strokeWidth": 2, "cornerRadius": 8, "opacity": 1 }

Circle:
{ "type": "Circle", "id": "unique_id", "x": 350, "y": 80, "radius": 10, "fill": "#F9E2AF", "opacity": 1 }

Text:
{ "type": "Text", "id": "unique_id", "x": 100, "y": 55, "width": 160, "text": "Your Label Here", "fontSize": 13, "fill": "#CDD6F4", "fontFamily": "JetBrains Mono", "align": "center", "fontStyle": "normal" }

Arrow:
{ "type": "Arrow", "id": "unique_id", "points": [100, 74, 100, 110], "fill": "#6272a4", "stroke": "#6272a4", "strokeWidth": 1.5, "pointerLength": 8, "pointerWidth": 6 }

Line:
{ "type": "Line", "id": "unique_id", "points": [80, 0, 160, 22, 80, 44, 0, 22], "closed": true, "fill": "#181825", "stroke": "#F9E2AF", "strokeWidth": 2 }

CRITICAL SHAPE RULES:
RULE 1 — NO TEXT INSIDE SHAPES: Rect, Circle, Arrow, Line do NOT have a "text" property. Always create a SEPARATE Text shape for labels.
RULE 2 — EVERY INTERACTIVE SHAPE NEEDS A UNIQUE ID.
RULE 3 — ALL TEXT SHAPES NEED: id, x, y, width, text, fontSize, fill, fontFamily, align.
RULE 4 — CANVAS BOUNDARY: x + width <= 700, y + height <= 380. No exceptions.

═══════════════════════════════════════════════════════════
BUTTONS FORMAT
═══════════════════════════════════════════════════════════
{ "id": "btn_step", "label": "▶ Run One Step", "style": "primary", "action": "stepForward" }
{ "id": "btn_reset", "label": "↺ Reset", "style": "warning", "action": "reset" }
Styles: "primary" | "success" | "warning" | "danger".
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
JSON SYNTAX — CRITICAL
COMMAS ARE MANDATORY between every property and every array element.
STRINGS must use double quotes only.
NO trailing commas before ] or }.
Limit shapes array to MAX 20 shapes per milestone.
Limit animation steps to MAX 15 steps per trigger."""

    philosophy_str = json.dumps(context['milestones_philosophy'][milestone_num-1], indent=2)
    rules_str = "\\n".join(context.get('non_negotiables', []))

    prompt = f"""{system_prompt}
    
Generate EXACTLY 1 milestone object (milestone number {milestone_num} of 5) for the concept: "{context['concept']}"

Context from textbook: {context['retrieved_chunks']}

THIS MILESTONE'S PHILOSOPHY:
{philosophy_str}

NON-NEGOTIABLE RULES:
{rules_str}

Output ONLY the JSON object. NO markdown formatting blocks like ```json."""

    max_retries = 3
    for attempt in range(max_retries):
        response = await asyncio.to_thread(call_visual_ai, prompt, 0.2, True)
        
        if not response:
            print(f"[Visualizer] Agent 5 Milestone {milestone_num} Attempt {attempt+1} Error: AI returned no response.")
            continue

        parsed = clean_and_parse_json(response, fallback=None)
        if parsed is not None:
            # Enforce milestone_number in case model forgot it
            if isinstance(parsed, dict):
                parsed["milestone_number"] = milestone_num
            return parsed
        else:
            print(f"[Visualizer] Agent 5 Milestone {milestone_num} Attempt {attempt+1} Error: JSON parse failed. Retrying...")
            
    return {"milestone_number": milestone_num, "error": f"Failed to generate valid JSON after {max_retries} attempts."}


def clean_and_parse_json(text: str, fallback: Any = None) -> Any:
    """Robustly clean and parse JSON from AI response."""
    try:
        # Remove potential markdown wrappers
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        text = text.strip()
        
        # Remove trailing commas before closing braces/brackets
        text = re.sub(r",\s*([\]}])", r"\1", text)
        
        # Remove control characters (except newline, tab, cr)
        text = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]", "", text)
        
        return json.loads(text)
    except Exception as e:
        print(f"[Visualizer] JSON Parse Error: {e}")
        # Try to find the first '{' and last '}' as a last resort
        try:
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                return json.loads(text[start:end+1])
        except:
            pass
        return fallback

async def orchestrate_visualizer(user_query: str) -> Dict[str, Any]:
    # 1. Prompt Engineer
    a1 = await run_agent1(user_query)
    
    # 2. Scope
    a2 = run_agent2(a1)
    if not a2['in_scope']:
        return {"success": False, "error": a2['error']}
        
    # 3. Retrieve (Using JSONL now)
    a3 = await run_agent3(a1, a2)
    
    # 4. Philosophy
    a4 = run_agent4(a1)
    
    # 5. Generate Milestones
    context = {
        "concept": a1['concept_key'],
        "retrieved_chunks": a3['retrieved_chunks'],
        "milestones_philosophy": a4['milestones'],
        "non_negotiables": a4['non_negotiables']
    }
    
    milestones = []
    for i in range(1, 6):
        res = await run_agent5_milestone(context, i)
        milestones.append(res)
        await asyncio.sleep(2) # Rate limit protection
    
    return {
        "success": True,
        "concept": a1['concept_key'],
        "milestones": milestones
    }
