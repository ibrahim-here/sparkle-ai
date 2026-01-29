import asyncio
import os
import sys

# Add the backend directory to sys.path to allow imports
backend_path = os.path.dirname(os.path.abspath(__file__))
sys.path.append(backend_path)

from Agents.graph import run_sparkle_graph

async def test_langgraph_flow():
    print("\n🚀 STARTING LANGGRAPH FLOW TEST")
    print("="*50)
    
    query = "hey sparkle, how's it going?"
    learner_summary = "You are a reading-oriented learner who likes detailed explanations."
    learning_style = {"reading": 80, "visual": 10, "kinesthetic": 10}
    
    print(f"User Query: {query}")
    print("Running graph...")
    
    import time
    start_time = time.time()
    
    try:
        result = await run_sparkle_graph(
            query=query,
            learner_summary=learner_summary,
            learning_style=learning_style
        )
        
        end_time = time.time()
        
        print("\n✅ GRAPH EXECUTION COMPLETE")
        print(f"⏱️ Total Time: {end_time - start_time:.2f} seconds")
        print("-" * 30)
        print(f"✨ Enhanced Prompt: {result['enhanced_prompt'][:100]}...")
        print(f"🎯 Selected Agent: {result['selected_agent']}")
        print(f"🤖 Response Preview: {result['response'][:200]}...")
        print("-" * 30)
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test_langgraph_flow())
