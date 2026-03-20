import os
import sys
import json
import asyncio
from utils.ai_utils import call_ai, get_vector_store, get_reranker_model

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_semantic")
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 5

PROMPT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_PROMPT")
PROMPT_COLLECTION = "prompt_engineering"
PROMPT_TOP_K = 3

# Removed call_openrouter_api and load_vector_db as they are now in ai_utils

async def retrieve_relevant_context(vector_store, query, top_k=TOP_K_RESULTS, use_reranker=True):
    """Retrieve relevant chunks from vector database using LangChain and FlashRank"""
    
    # 1. Broad Search: Get more chunks than we need (e.g., 15)
    fetch_k = top_k * 3 if use_reranker else top_k
    results = await vector_store.asimilarity_search_with_score(query, k=fetch_k)
    
    if not results:
        return None, []
        
    contexts = []
    
    if use_reranker:
        print(f"[Search] Re-ranking {len(results)} chunks with FlashRank...")
        # Prepare data for FlashRank
        passages = []
        for doc, score in results:
            passages.append({
                "id": str(len(passages)),
                "text": doc.page_content,
                "meta": {
                    "chapter": doc.metadata.get('chapter', 'Unknown'),
                    "type": doc.metadata.get('type', 'Unknown'),
                    "original_distance": float(score)
                }
            })
            
        ranker = get_reranker_model()
        
        # FlashRank requires a RerankRequest object, not a raw dictionary
        from flashrank import RerankRequest
        rerank_request = RerankRequest(query=query, passages=passages)
        
        # This runs locally and is very fast
        reranked_results = ranker.rerank(rerank_request)
        
        # Take the top_k from the reranked list
        best_results = reranked_results[:top_k]
        
        for br in best_results:
            contexts.append({
                'text': br['text'],
                'chapter': br['meta'].get('chapter', 'Unknown'),
                'type': br['meta'].get('type', 'Unknown'),
                'distance': br['score'] # This is the rerank score now
            })
    else:
        # Fallback to standard similarity search
        for doc, score in results:
            contexts.append({
                'text': doc.page_content,
                'chapter': doc.metadata.get('chapter', 'Unknown'),
                'type': doc.metadata.get('type', 'Unknown'),
                'distance': score
            })
            
    # Combine all context into one string
    combined_context = "\n\n---\n\n".join([
        f"[Chapter {ctx['chapter']} - {ctx['type']}]\n{ctx['text']}" 
        for ctx in contexts
    ])

    print(f"\n[DEBUG] FINAL CONTEXT RETRIEVED ({len(contexts)} chunks):")
    for idx, ctx in enumerate(contexts, 1):
        print(f"--- Chunk {idx} (Score: {ctx['distance']:.3f}) ---")
        print(f"{ctx['text'][:200]}...")
    print("-------------------------------------------\n")
    
    return combined_context, contexts

async def generate_analogies(query, context, learner_profile=None, prompt_rules=None):
    """Generate real-life analogies using retrieved context + LLM's knowledge"""
    
    # Build profile context string if provided
    profile_context = ""
    if learner_profile:
        profile_context = f"""

[Profile] STUDENT'S LEARNING PROFILE:
{learner_profile}

⚙️ ADAPTATION INSTRUCTION:
Tailor the analogies to this profile. If the student has secondary preferences (e.g., 40% reading), blend analogies with detailed explanations.
"""

    prompt_engineering_context = ""
    if prompt_rules:
        prompt_engineering_context = f"""
📚 PROMPT ENGINEERING BEST PRACTICES:
{prompt_rules}
"""

    common_guidelines = """
📝 FORMATTING GUIDELINES:
- Use proper Markdown headings (`#`, `##`, `###`) to structure the response professionally.
- **Analogy Headers**: Use `## 🎨 Analogy [Number]: [Creative Name]` for each analogy.
- **Visual Style**: Use relevant emojis throughout the text to make it engaging and "premium" looking.
- Use bold text for connections between the analogy and C++ concepts.
- Use numbered lists (1., 2., 3.) for multi-step breakdowns.
- Use horizontal dividers (`---`) between different analogies.
- End with a friendly closing like: "Simplifying complexity, one analogy at a time! ⚡ — Sparkle AI Team"
"""

    if context:
        # Hybrid mode: Use context + general knowledge
        prompt = f"""You are an expert C++ tutor who explains concepts through creative analogies.{profile_context}{prompt_engineering_context}

[Knowledge] TEXTBOOK CONTENT:
{context}

[Topic] TOPIC:
{query}

🎯 YOUR TASK:
Create 2-3 relatable analogies (250-400 words total) to explain this concept.
{common_guidelines}
Provide your formatted analogies now:"""
    else:
        # No relevant context found - use general knowledge
        prompt = f"""You are an expert C++ tutor who explains concepts through creative analogies.{profile_context}{prompt_engineering_context}

[Topic] TOPIC:
{query}

[Info] NOTE: No textbook content available.

🎯 YOUR TASK:
Create 2-3 relatable analogies (250-400 words total) to explain this concept.
{common_guidelines}
Provide your formatted analogies now:"""
    
    # Run AI generation on a background thread so it doesn't freeze the server
    analogies = await asyncio.to_thread(call_ai, prompt, 0.5)
    if not analogies:
        print("[Analogy] Warning: AI failed, using fallback message")
        return "I'm having trouble creating analogies right now. My AI circuits are a bit overloaded! Please try again in a moment. ⚡"
    return analogies.strip()

async def get_analogies(question, learner_profile=None):
    """Main analogy generation function"""
    # Check for greeting tag or short query
    if "[GREETING]" in question or len(question.strip()) < 4:
        return "Hello there! I am your Sparkle AI Analogy specialized agent. I'm here to translate complex C++ concepts into relatable real-life stories. What coding topic can I simplify for you today? ⚡"

    print("\n" + "=" * 60)
    print(f"[Topic] Topic: {question}")
    print("=" * 60)
    
    # Load vector database
    print("\n[Search] Searching textbook for relevant content...")
    vector_store = get_vector_store(CHROMA_DB_PATH, COLLECTION_NAME)
    
    # Retrieve relevant context
    context, contexts = await retrieve_relevant_context(vector_store, question)
    
    if context:
        print(f"[OK] Found {len(contexts)} relevant chunks from textbook")
        print("\n[Knowledge] Retrieved content summary:")
        for i, ctx in enumerate(contexts, 1):
            print(f"  [{i}] Chapter {ctx['chapter']} - {ctx['type']}")
    else:
        print("[Info] No relevant textbook content found")
        print("[Info] Will use general C++ knowledge for analogies")
    
    # Load Prompt Engineering Rules
    print("\n[Search] Searching prompt engineering rules...")
    try:
        prompt_store = get_vector_store(PROMPT_DB_PATH, PROMPT_COLLECTION)
        # We don't need to rerank the prompt rules, just do a normal search
        prompt_rules, _ = await retrieve_relevant_context(prompt_store, question, top_k=PROMPT_TOP_K, use_reranker=False)
    except Exception as e:
        print(f"[Search] Could not load prompt rules: {e}")
        prompt_rules = None

    # Generate analogies
    print("\n[AI] Creating relatable analogies...\n")
    analogies = await generate_analogies(question, context, learner_profile, prompt_rules)
    
    print("=" * 60)
    print("[Knowledge] ANALOGIES:")
    print("=" * 60)
    print(analogies)
    print("=" * 60)
    
    return analogies

async def interactive_mode():
    """Interactive analogy generation mode"""
    print("\n" + "=" * 60)
    print("[AI] C++ Analogy Generator - Interactive Mode")
    print("=" * 60)
    print("Enter any C++ concept and get 4-5 real-life analogies!")
    print("Type 'exit' or 'quit' to stop\n")
    
    while True:
        question = input("\n[Prompt] What C++ concept should I explain?: ").strip()
        
        if question.lower() in ['exit', 'quit', 'q']:
            print("\n[Bye] Happy learning!")
            break
        
        if not question:
            continue
        
        await get_analogies(question)


if __name__ == "__main__":
    import sys
    import io
    
    # Set UTF-8 encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    # Check if called from CLI with arguments (from Node.js)
    if len(sys.argv) > 1:
        try:
            # Parse JSON argument from Node.js
            args = json.loads(sys.argv[1])
            query = args.get('query', '')
            profile = args.get('profile', None)
            
            if query:
                # Call get_analogies with minimal output
                # Suppress intermediate prints
                import io as io_module
                old_stdout = sys.stdout
                sys.stdout = io_module.StringIO()
                
                try:
                    analogies = asyncio.run(get_analogies(query, profile))
                finally:
                    sys.stdout = old_stdout
                
                # Print only the analogies for Node.js to capture
                print(analogies)
            else:
                print("Error: query is required", file=sys.stderr)
                sys.exit(1)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}", file=sys.stderr)
            sys.exit(1)
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    else:
        # Test mode when run directly
        example_topics = [
            "loops",
            "pointers"
        ]
        
        print("\n[AI] Analogy Master Ready!")
        print("\nChoose mode:")
        print("1. Interactive mode")
        print("2. Example topics")
        
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == "1":
            asyncio.run(interactive_mode())
        else:
            for topic in example_topics:
                asyncio.run(get_analogies(topic))
                input("\n\nPress Enter for next example...")
