import os
import sys
import json
import asyncio
from utils.ai_utils import call_ai, get_vector_store, get_reranker_model

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_semantic")
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 7

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

async def generate_indepth_explanation(query, context, learner_profile=None, prompt_rules=None):
    """Generate comprehensive, in-depth explanation using retrieved context + LLM's knowledge"""
    
    # Build profile context string if provided
    profile_context = ""
    if learner_profile:
        profile_context = f"""

[Profile] STUDENT'S LEARNING PROFILE:
{learner_profile}

⚙️ ADAPTATION INSTRUCTION:
Use this profile to tailor your explanation. If the student has secondary preferences (e.g., 30% kinesthetic alongside reading), incorporate those elements (e.g., add hands-on code examples).- If they ask who you are, explain you are an AI tutor personalized to their learning style.
"""

    prompt_engineering_context = ""
    if prompt_rules:
        prompt_engineering_context = f"""
📚 PROMPT ENGINEERING BEST PRACTICES:
{prompt_rules}
"""

    prompt = f"""You are an expert Programming Instructor specialized in **Programming Fundamentals**. Your goal is to provide clear, focused explanations of core concepts in any programming language (e.g., C++, Python, Java).{profile_context}{prompt_engineering_context}

[Knowledge] TEXTBOOK CONTENT (C++ SPECIFIC):
{context if context else "No direct matches found. Use your general knowledge for the requested language."}

[Topic] TOPIC TO EXPLAIN:
{query}

⚖️ SCOPE & RESTRICTION RULES:
1. **Fundamentals Only**: You only explain: Variables, Data Types, Operators, Control Structures (Loops, If-Else), Arrays/Lists (1D, 2D), Functions/Methods, Basic Structures/Objects, and File Handling.
2. **Advanced Topic Rejection**: If the user asks about advanced topics like Dynamic Programming, Graph Theory, AI/ML, or complex system design, you MUST respond exactly with: "My knowledge is focused on programming fundamental topics (loops, arrays, functions, etc.). I cannot assist with advanced algorithmic or specialized architectural topics at this time."
3. **Multi-Language Support**: Provide the explanation in the programming language requested by the user. If they don't specify, use C++. If the textbook context above is C++ and they asked for Python, use the C++ textbook concepts as a logic guide but explain the Python implementation.

🎯 YOUR TASK:
Provide a comprehensive explanation (300-500 words) that covers:
1. **What it is**: Clear definition in 1-2 sentences.
2. **How it works**: Key concepts and syntax in the requested language.
3. **Code Example**: 1-2 practical examples with brief explanations.
4. **Key Points**: A list of important things to remember.

📝 FORMATTING GUIDELINES:
- Use proper Markdown headings (`#`, `##`, `###`).
- **Visual Style**: Use relevant emojis (💡, 🚀, ⚙️, 📝).
- **Callouts**: Use blockquotes (`>`) for "Pro-Tips" or "Key Takeaways".
- End with: "Keep sparkling! ⚡ — Sparkle AI Team"

Provide your brilliant, formatted explanation now:"""
    
    # Generate explanation using OpenRouter/Gemini natively threaded
    explanation = await asyncio.to_thread(call_ai, prompt)
    if not explanation:
        print("[Explainer] Warning: AI failed, using fallback message")
        return "I'm having trouble generating a detailed explanation right now due to high demand. Please try again in 1-2 minutes! ⚡"
    return explanation.strip()

async def get_explanation(question, learner_profile=None):
    """Main in-depth explanation function"""
    # Check for greeting tag or short query
    if "[GREETING]" in question or len(question.strip()) < 4:
        return "Hello! I am your Sparkle AI learning assistant. I see you're ready to dive into programming! Whenever you have a specific concept or problem you'd like me to explain in-depth, just let me know and I'll tailor the explanation to your learning style. ⚡"

    print("\n" + "=" * 70)
    print(f"[Topic] Topic for In-Depth Explanation: {question}")
    print("=" * 70)
    
    # Load vector database
    print("\n[Search] Searching textbook for comprehensive content...")
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
        print("[Info] Will use general knowledge for explanation")
    
    # Load Prompt Engineering Rules
    print("\n[Search] Searching prompt engineering rules...")
    try:
        prompt_store = get_vector_store(PROMPT_DB_PATH, PROMPT_COLLECTION)
        # We don't need to rerank the prompt rules, just do a normal search
        prompt_rules, _ = await retrieve_relevant_context(prompt_store, question, top_k=PROMPT_TOP_K, use_reranker=False)
    except Exception as e:
        print(f"[Search] Could not load prompt rules: {e}")
        prompt_rules = None

    # Generate in-depth explanation
    print("\n[AI] Generating comprehensive, in-depth explanation...\n")
    explanation = await generate_indepth_explanation(question, context, learner_profile, prompt_rules)
    
    print("=" * 70)
    print("[Knowledge] IN-DEPTH EXPLANATION:")
    print("=" * 70)
    print(explanation)
    print("=" * 70)
    
    return explanation

async def interactive_mode():
    """Interactive in-depth explanation mode"""
    print("\n" + "=" * 70)
    print("[AI] Programming In-Depth Explainer - Interactive Mode")
    print("=" * 70)
    print("Ask about any core programming concept for a detailed explanation!")
    print("Type 'exit' or 'quit' to stop\n")
    
    while True:
        question = input("\n[Prompt] What programming concept should I explain in-depth?: ").strip()
        
        if question.lower() in ['exit', 'quit', 'q']:
            print("\n[Bye] Keep learning deeply!")
            break
        
        if not question:
            continue
        
        await get_explanation(question)


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
                # Call get_explanation with minimal output
                # Suppress intermediate prints by temporarily redirecting stdout
                import io as io_module
                old_stdout = sys.stdout
                sys.stdout = io_module.StringIO()
                
                try:
                    explanation = asyncio.run(get_explanation(query, profile))
                finally:
                    sys.stdout = old_stdout
                
                # Print only the explanation for Node.js to capture
                print(explanation)
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
            "arrays"
        ]
        
        print("\n[AI] In-Depth Explainer Ready!")
        print("\nChoose mode:")
        print("1. Interactive mode (ask about multiple concepts)")
        print("2. Example topics")
        
        choice = input("\nEnter choice (1 or 2): ").strip()
        
        if choice == "1":
            asyncio.run(interactive_mode())
        else:
            for topic in example_topics:
                asyncio.run(get_explanation(topic))
                input("\n\nPress Enter for next topic...")
