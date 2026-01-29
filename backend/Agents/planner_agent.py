import os
import sys
import json
from utils.ai_utils import call_ai, get_vector_store

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_PROMPT")
COLLECTION_NAME = "prompt_engineering"
TOP_K_RESULTS = 3

# Removed call_openrouter_api and load_vector_db as they are now in ai_utils

# is_greeting removed: Intent detection is now handled by the LangGraph classifier node.

def retrieve_relevant_context(vector_store, query, top_k=TOP_K_RESULTS):
    """Retrieve relevant chunks from vector database using LangChain"""
    # Use LangChain's similarity search
    results = vector_store.similarity_search_with_score(query, k=top_k)
    
    if not results:
        return None, []
    
    # Format retrieved context
    contexts = []
    for doc, score in results:
        contexts.append({
            'text': doc.page_content,
            'source': doc.metadata.get('source', 'Unknown'),
            'type': doc.metadata.get('type', 'Unknown'),
            'distance': score
        })
    
    # Combine all context into one string
    combined_context = "\n\n---\n\n".join([
        f"[{ctx['source']} - {ctx['type']}]\n{ctx['text']}" 
        for ctx in contexts
    ])
    
    return combined_context, contexts

def enhance_prompt(raw_query, learner_profile_summary=None):
    """
    Main prompt enhancement function:
    1. Retrieves best practices from ChromaDB
    2. Builds a detailed instructional prompt
    3. Calls the LLM to generate the final, enhanced query
    """

    # 1. Retrieve Context
    context = None
    try:
        vector_store = get_vector_store(CHROMA_DB_PATH, COLLECTION_NAME)
        context_str, contexts = retrieve_relevant_context(vector_store, raw_query)
        context = context_str
    except Exception as e:
        print(f"Error retrieving context: {e}")
        pass

    # 2. Build Profile Instruction
    profile_instruction = ""
    if learner_profile_summary:
        profile_instruction = f"""
[Profile] USER'S DETAILED LEARNING PROFILE:
{learner_profile_summary}

⚙️ PERSONALIZATION REQUIREMENTS:
Match the depth and format to their specific learning style described in the profile.
"""

    # 3. Build Orchestration Prompt
    common_tasks = "Transform the user's raw query into a specific, detailed educational goal. Specify exactly what concepts to cover (e.g., definition, syntax, examples). Do NOT ask the user questions. Provide ONLY the enhanced prompt string. NO conversational filler."
    
    if context:
        prompt = f"""You are an expert prompt engineering specialist.
📥 USER'S RAW QUERY: "{raw_query}"
{profile_instruction}
📚 PROMPT ENGINEERING BEST PRACTICES:
{context}

🎯 YOUR TASK:
{common_tasks}
Return ONLY the final instruction for a programming tutor. NO explanations, NO quotes."""
    else:
        prompt = f"""You are an expert prompt engineering specialist.
📥 USER'S RAW QUERY: "{raw_query}"
{profile_instruction}
🎯 YOUR TASK:
{common_tasks}"""

    # 4. Generate
    enhanced = call_ai(prompt)
    if not enhanced:
        print("[Planner] Warning: AI failed, falling back to raw query")
        return raw_query
    return enhanced.strip().strip('"').strip("'")


if __name__ == "__main__":
    import sys
    import io
    
    # Set UTF-8 encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # Check if called from CLI with arguments
    if len(sys.argv) > 1:
        try:
            # Parse JSON argument from Node.js
            args = json.loads(sys.argv[1])
            query = args.get('query', '')
            profile = args.get('profile', None)
            
            if query:
                # Call enhance_prompt without printing intermediate steps
                enhanced = enhance_prompt(query, profile)
                # Print only the enhanced prompt for Node.js to capture
                print(enhanced)
            else:
                print("Error: query is required", file=sys.stderr)
                sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
            sys.exit(1)
    else:
        # Test mode when run directly
        print("\n[AI] Prompt Enhancer - Test Mode\n")
        
        test_query = "teach me loops"
        test_profile = "You are primarily a reading-oriented learner (65%) with kinesthetic tendencies (35%). You excel with detailed written explanations followed by hands-on practice."
        
        print(f"Testing with: '{test_query}'\n")
        enhanced = enhance_prompt(test_query, test_profile)
