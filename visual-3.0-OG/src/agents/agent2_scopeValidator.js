import syllabus from '../data/syllabus.json' with { type: 'json' };

/**
 * Agent 2: Scope Validator
 * Pure JS — no API call.
 * Validates concept_key against the PF syllabus.
 * Returns scope result + chapter file reference for Agent 3.
 */
export function runAgent2(agent1Result) {
    const { concept_key, original_query } = agent1Result;

    console.log(`[Agent 2] Validating scope for concept_key: "${concept_key}"`);

    // ── Primary mapping: concept_key → syllabus position + chapter file ──
    // chapter_file maps to the JSONL files in /src/data/chapter/
    const SCOPE_MAP = {
        'computer_architecture': { week: 1, lecture: 1, chapter_file: 'chapter2', topic_cluster: 'Computer Architecture, Memory, Fetch-Decode-Execute Cycle' },
        'programming_intro': { week: 1, lecture: 2, chapter_file: 'chapter2', topic_cluster: 'Programming Languages, Compiling, Linking, Loading, Variables' },
        'variables': { week: 2, lecture: 3, chapter_file: 'chapter2', topic_cluster: 'Variables, Data Types, Assignment, Input/Output' },
        'operators': { week: 3, lecture: 5, chapter_file: 'chapter4', topic_cluster: 'Arithmetic, Logical, Relational Operators, Operator Precedence' },
        'if_else': { week: 4, lecture: 7, chapter_file: 'chapter4', topic_cluster: 'If/Else Statements, Nested Selection, Conditional Branching' },
        'loops': { week: 5, lecture: 9, chapter_file: 'chapter5', topic_cluster: 'While Loop, For Loop, Do-While Loop, Repetition Structures' },
        'nested_loops': { week: 6, lecture: 11, chapter_file: 'chapter5', topic_cluster: 'Nested Loops, Nested Control Structures, Pattern Problems' },
        'functions': { week: 7, lecture: 13, chapter_file: 'chapter6', topic_cluster: 'Function Definition, Parameters, Return Types, Pass by Value, Pass by Reference, Stack' },
        'function_advanced': { week: 8, lecture: 16, chapter_file: 'chapter6', topic_cluster: 'Function Overloading, Default Parameters, Top-Down Design, Built-in Functions, Scope' },
        'file_handling': { week: 9, lecture: 17, chapter_file: 'chapter7', topic_cluster: 'File I/O, ifstream, ofstream, Reading and Writing Text Files' },
        'arrays': { week: 9, lecture: 18, chapter_file: 'chapter7', topic_cluster: 'Arrays, Memory Layout, Element Access, Initialization, Traversal, Search' },
        'sorting': { week: 11, lecture: 21, chapter_file: 'chapter7', topic_cluster: 'Bubble Sort, Selection Sort, Insertion Sort, Even/Odd Sort, Merging Arrays' },
        'cstrings': { week: 12, lecture: 23, chapter_file: 'chapter7', topic_cluster: 'CStrings, Null-Terminated Arrays, String Functions, Character Arrays' },
        '2d_arrays': { week: 13, lecture: 25, chapter_file: 'chapter7', topic_cluster: '2D Arrays, Row/Column Major Order, Matrix Operations, Diagonal Processing' },
        'structs': { week: 16, lecture: 30, chapter_file: 'chapter7', topic_cluster: 'Structs, Member Access, Arrays of Structs, Passing Structs to Functions' },
    };

    // ── Check primary map first ──
    if (SCOPE_MAP[concept_key]) {
        const result = SCOPE_MAP[concept_key];
        console.log(`[Agent 2] ✓ In scope — Week ${result.week}, Lecture ${result.lecture}`);
        return {
            in_scope: true,
            week: result.week,
            lecture: result.lecture,
            chapter_file: result.chapter_file,
            topic_cluster: result.topic_cluster,
            concept_key,
        };
    }

    // ── Fallback: search syllabus JSON for partial matches ──
    // This handles edge cases where Agent 1 returned a concept_key not in the primary map
    if (syllabus && Array.isArray(syllabus)) {
        for (const weekObj of syllabus) {
            for (const lectureObj of weekObj.lectures || []) {
                const topicsText = (lectureObj.topics || []).join(' ').toLowerCase();
                const searchTerm = concept_key.replace(/_/g, ' ').toLowerCase();

                if (topicsText.includes(searchTerm)) {
                    const chapterFile = resolveChapterFile(weekObj.week);
                    console.log(`[Agent 2] ✓ Found via syllabus fallback — Week ${weekObj.week}`);
                    return {
                        in_scope: true,
                        week: weekObj.week,
                        lecture: lectureObj.id,
                        chapter_file: chapterFile,
                        topic_cluster: lectureObj.topics.join(', '),
                        concept_key,
                    };
                }
            }
        }
    }

    // ── Out of scope ──
    console.warn(`[Agent 2] ✗ Out of scope: "${concept_key}"`);
    return {
        in_scope: false,
        concept_key,
        error: `"${original_query || concept_key}" is outside the PF course scope. Please ask about topics covered in the course syllabus (Weeks 1–16).`,
    };
}

// ─── RESOLVE CHAPTER FILE BY WEEK NUMBER ─────────────────
function resolveChapterFile(week) {
    if (week <= 2) return 'chapter2';
    if (week <= 4) return 'chapter4';
    if (week <= 6) return 'chapter5';
    if (week <= 8) return 'chapter6';
    return 'chapter7'; // Weeks 9–16
}