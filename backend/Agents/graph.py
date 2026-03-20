from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from Agents.planner_agent import enhance_prompt
from Agents.indepth_explainer_agent import get_explanation
from Agents.analogy_agent import get_analogies
from Agents.general_agent import get_casual_response
from utils.ai_utils import call_ai
from utils.agent_router import select_agent

# 1. Define the Graph State
class AgentState(TypedDict):
    query: str
    learner_summary: str
    learning_style: dict
    manual_style: str
    enhanced_prompt: str
    selected_agent: str
    intent: str  # New field: 'casual' or 'educational'
    response: str
    history: List[dict]

# 2. Define Nodes
def classifier_node(state: AgentState):
    """Detect if the query is a routine greeting/casual chat or an educational programming question"""
    print("--- [GRAPH] CLASSIFIER NODE ---")
    prompt = f"""Analyze this user query for a programming tutor.
Is it a casual greeting/thank you/social chat, or a specific question about programming/C++?

Query: "{state['query']}"

Answer ONLY with one word: 'casual' or 'educational'."""
    
    response = call_ai(prompt)
    
    if response:
        intent = response.lower().strip()
        return {"intent": 'educational' if 'educational' in intent else 'casual'}
    
    # Fallback: If API fails (e.g., 429), use a simple keyword guess to avoid crashing
    print("[GRAPH] API failed, using fallback detection")
    casual_keywords = {
        'hi', 'hello', 'hey', 'thanks', 'thank', 'bye', 'who', 'help', 
        'how', 'are', 'you', 'going', 'sup', 'yo', 'hii', 'test'
    }
    query_lower = state['query'].lower()
    # Check if more than 50% of the words are in casual_keywords or query is very short
    words = query_lower.split()
    casual_count = sum(1 for word in words if word in casual_keywords)
    is_casual = (casual_count / len(words) >= 0.5) if words else True
    
    if len(query_lower) < 5:
        is_casual = True
        
    return {"intent": 'casual' if is_casual else 'educational'}

def casual_node(state: AgentState):
    """Handle casual greetings and social chat"""
    print("--- [GRAPH] CASUAL NODE ---")
    response = get_casual_response(state["query"], state["learner_summary"])
    return {"response": response}

def planner_node(state: AgentState):
    """Enhance the user query based on their learning profile"""
    print("--- [GRAPH] PLANNER NODE ---")
    enhanced = enhance_prompt(state["query"], state["learner_summary"])
    return {"enhanced_prompt": enhanced}

def router_node(state: AgentState):
    """Select the most appropriate agent based on learning profile"""
    print("--- [GRAPH] ROUTER NODE ---")
    agent_name = select_agent(state["learning_style"], state["manual_style"])
    return {"selected_agent": agent_name}

async def explainer_node(state: AgentState):
    """Execute the In-Depth Explainer agent without needing the planner"""
    print("--- [GRAPH] EXPLAINER NODE ---")
    try:
        # Pass the raw query directly (agent now fetches prompt rules internally)
        response = await get_explanation(state["query"], state["learner_summary"])
        return {"response": response}
    except Exception as e:
        print(f"[GRAPH] Explainer node crash: {e}")
        return {"response": "I encountered an error trying to explain that concept. Please try asking in a different way! ⚡"}

async def analogy_node(state: AgentState):
    """Execute the Analogy agent without needing the planner"""
    print("--- [GRAPH] ANALOGY NODE ---")
    try:
        # Pass the raw query directly (agent now fetches prompt rules internally)
        response = await get_analogies(state["query"], state["learner_summary"])
        return {"response": response}
    except Exception as e:
        print(f"[GRAPH] Analogy node crash: {e}")
        return {"response": "I had a bit of trouble coming up with an analogy just now. Let's try again! ⚡"}

# 3. Build the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("classifier", classifier_node)
workflow.add_node("casual", casual_node)
workflow.add_node("planner", planner_node)
workflow.add_node("router", router_node)
workflow.add_node("explainer", explainer_node)
workflow.add_node("analogy", analogy_node)

# Set Entry Point
workflow.set_entry_point("classifier")

# Add Conditional Edges for Intent
def route_intent(state: AgentState):
    return state["intent"]

workflow.add_conditional_edges(
    "classifier",
    route_intent,
    {
        "casual": "casual",
        "educational": "router" # Completely bypass the planner!
    }
)

# Continue from Planner to Router
workflow.add_edge("planner", "router")

# Add Conditional Edges for Agent Selection (deterministic as requested)
def route_to_agent(state: AgentState):
    agent = state["selected_agent"]
    if agent == "analogy_agent.py":
        return "analogy"
    return "explainer"

workflow.add_conditional_edges(
    "router",
    route_to_agent,
    {
        "analogy": "analogy",
        "explainer": "explainer"
    }
)

# Connect all leaf nodes to END
workflow.add_edge("casual", END)
workflow.add_edge("explainer", END)
workflow.add_edge("analogy", END)

# Compile the Graph
app = workflow.compile()

async def run_sparkle_graph(query, learner_summary, learning_style, manual_style=None, history=[]):
    """Async entry point to run the graph"""
    initial_state = {
        "query": query,
        "learner_summary": learner_summary,
        "learning_style": learning_style,
        "manual_style": manual_style,
        "history": history,
        "intent": "",
        "enhanced_prompt": "",
        "selected_agent": "",
        "response": ""
    }
    
    final_result = await app.ainvoke(initial_state)
    return final_result
