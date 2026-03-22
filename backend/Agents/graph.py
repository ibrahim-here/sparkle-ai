from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from Agents.planner_agent import enhance_prompt
from Agents.indepth_explainer_agent import get_explanation
from Agents.analogy_agent import get_analogies
from Agents.problem_solver_agent import get_problem_solution
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
    """Detect if the query is a routine greeting/casual chat, an educational theory question, or a coding/problem-solving request"""
    print("--- [GRAPH] CLASSIFIER NODE ---")
    prompt = f"""Analyze this user query for a programming tutor.
Is it a casual greeting/social chat? Or is it an educational request?

If it is an educational request, categorize it as ONE of these:
- 'problem_solving': If the user asks for code, a solution, an implementation, or to solve a specific programming task.
- 'educational': If the user is asking for an explanation of a concept, how something works, theory, or general knowledge.

Query: "{state['query']}"

Answer ONLY with one word: 'casual', 'educational', or 'problem_solving'."""
    
    response = call_ai(prompt)
    
    if response:
        intent = response.lower().strip()
        # Ensure we return a valid intent
        if 'problem_solving' in intent: return {"intent": 'problem_solving'}
        if 'educational' in intent: return {"intent": 'educational'}
        if 'casual' in intent: return {"intent": 'casual'}
    
    # Fallback to educational
    return {"intent": 'educational'}

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
    """Select the most appropriate agent based on learning profile and query intent"""
    print("--- [GRAPH] ROUTER NODE ---")
    agent_name = select_agent(state["learning_style"], query=state["query"], manual_style=state["manual_style"], detected_intent=state.get("intent"))
    return {"selected_agent": agent_name}

async def explainer_node(state: AgentState):
    """Execute the In-Depth Explainer agent"""
    print("--- [GRAPH] EXPLAINER NODE ---")
    try:
        response = await get_explanation(state["query"], state["learner_summary"])
        return {"response": response}
    except Exception as e:
        print(f"[GRAPH] Explainer node crash: {e}")
        return {"response": "I encountered an error trying to explain that concept. ⚡"}

async def analogy_node(state: AgentState):
    """Execute the Analogy agent"""
    print("--- [GRAPH] ANALOGY NODE ---")
    try:
        response = await get_analogies(state["query"], state["learner_summary"])
        return {"response": response}
    except Exception as e:
        print(f"[GRAPH] Analogy node crash: {e}")
        return {"response": "I had a bit of trouble coming up with an analogy just now. ⚡"}

async def problem_solver_node(state: AgentState):
    """Execute the Problem Solver agent"""
    print("--- [GRAPH] PROBLEM SOLVER NODE ---")
    try:
        response = await get_problem_solution(state["query"], state["learner_summary"])
        return {"response": response}
    except Exception as e:
        print(f"[GRAPH] Problem solver node crash: {e}")
        return {"response": "I encountered an error trying to solve this problem. ⚡"}

# 3. Build the Graph
workflow = StateGraph(AgentState)

# Add Nodes
workflow.add_node("classifier", classifier_node)
workflow.add_node("casual", casual_node)
workflow.add_node("planner", planner_node)
workflow.add_node("router", router_node)
workflow.add_node("explainer", explainer_node)
workflow.add_node("analogy", analogy_node)
workflow.add_node("problem_solver", problem_solver_node)

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
        "educational": "router",
        "problem_solving": "router"
    }
)

# Continue from Planner to Router
workflow.add_edge("planner", "router")

# Add Conditional Edges for Agent Selection
def route_to_agent(state: AgentState):
    agent = state["selected_agent"]
    if agent == "analogy_agent.py":
        return "analogy"
    elif agent == "problem_solver_agent.py":
        return "problem_solver"
    return "explainer"

workflow.add_conditional_edges(
    "router",
    route_to_agent,
    {
        "analogy": "analogy",
        "problem_solver": "problem_solver",
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
