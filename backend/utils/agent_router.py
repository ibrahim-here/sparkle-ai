def select_agent(learning_style: dict, manual_style: str = None) -> str:
    """
    Selects the most appropriate AI agent based on the learner's style.
    """
    if manual_style and manual_style != "none":
        style = manual_style
    else:
        # Determine primary style from percentages
        # learning_style example: {'visual': 50, 'reading': 30, 'kinesthetic': 20}
        style = max(learning_style, key=learning_style.get) if learning_style else 'reading'

    # Mapping styles to agent scripts
    agent_map = {
        'visual': 'indepth_explainer_agent.py',
        'reading': 'indepth_explainer_agent.py',
        'kinesthetic': 'analogy_agent.py',
        'mixed': 'indepth_explainer_agent.py',
        # Handle frontend manual selection values directly
        'explainer': 'indepth_explainer_agent.py',
        'analogy': 'analogy_agent.py'
    }

    selected = agent_map.get(style, 'indepth_explainer_agent.py')
    print(f"[Router] Target style: {style} -> Assigned Agent: {selected}")
    return selected
