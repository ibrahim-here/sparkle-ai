from typing import Optional

def select_agent(learning_style: dict, query: str = "", manual_style: Optional[str] = None, detected_intent: Optional[str] = None) -> str:
    """
    Selects the most appropriate AI agent based on the learner's style AND query intent.
    """
    # 1. Check for explicit "Problem Solving" intent (LLM-detected or keyword search)
    if detected_intent == 'problem_solving':
        print(f"[Router] Intent: Problem Solving (LLM-detected) -> Assigned Agent: problem_solver_agent.py")
        return 'problem_solver_agent.py'
        
    problem_keywords = ["solve", "problem", "write a program", "code for", "how to code", "write a c++", "program", "question", "exercise", "give me a code", "implementation"]
    query_lower = query.lower()
    
    is_problem = any(kw in query_lower for kw in problem_keywords)
    
    if is_problem:
        print(f"[Router] Intent: Problem Solving (Keyword matched) -> Assigned Agent: problem_solver_agent.py")
        return 'problem_solver_agent.py'

    # 2. Otherwise, use learning style
    if manual_style and manual_style != "none":
        style = manual_style
    else:
        # Determine primary style from percentages
        style = max(learning_style, key=learning_style.get) if learning_style else 'reading'

    # Mapping styles to agent scripts
    agent_map = {
        'visual': 'indepth_explainer_agent.py',
        'reading': 'indepth_explainer_agent.py',
        'kinesthetic': 'analogy_agent.py',
        'mixed': 'indepth_explainer_agent.py',
        'explainer': 'indepth_explainer_agent.py',
        'analogy': 'analogy_agent.py'
    }

    selected = agent_map.get(style, 'indepth_explainer_agent.py')
    print(f"[Router] Target style: {style} -> Assigned Agent: {selected}")
    return selected
