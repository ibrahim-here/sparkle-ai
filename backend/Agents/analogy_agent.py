import os
import sys
import json
from utils.ai_utils import call_ai, get_vector_store

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_semantic")
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 5

# Removed call_openrouter_api and load_vector_db as they are now in ai_utils

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
            'chapter': doc.metadata.get('chapter', 'Unknown'),
            'type': doc.metadata.get('type', 'Unknown'),
            'distance': score
        })
    
    # Combine all context into one string
    combined_context = "\n\n---\n\n".join([
        f"[Chapter {ctx['chapter']} - {ctx['type']}]\n{ctx['text']}" 
        for ctx in contexts
    ])

    print(f"\n[DEBUG] EMBEDDING DATA RETRIEVED ({len(contexts)} chunks):")
    for idx, ctx in enumerate(contexts, 1):
        print(f"--- Chunk {idx} (Dist: {ctx['distance']:.3f}) ---")
        print(f"{ctx['text'][:200]}...")
    print("-------------------------------------------\n")
    
    return combined_context, contexts

def generate_analogies(query, context, learner_profile=None):
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

    common_guidelines = """
📝 FORMATTING GUIDELINES:
- **NO markdown heading symbols** (like # or ##).
- **NO dashed or equals line separators** (like --- or ===).
- Use BOLD text and Proper heading bigger text size like h1 or h2 like we use in react  for the main title and each analogy header (e.g., **Analogy 1: [Name]**).
- Use bold text for connections between the analogy and C++ concepts.
- Use numbered lists (1., 2., 3.) for multi-step breakdowns.
- Keep output clean and optimized for a dark UI.
"""

    if context:
        # Hybrid mode: Use context + general knowledge
        prompt = f"""You are Sparkle AI, an expert C++ tutor specifically built to teach Programming Fundamentals (PF) who explains concepts through creative analogies.{profile_context}

CRITICAL RULES:
1. If the topic is entirely outside of Programming Fundamentals (PF) or C++, you MUST politely refuse to answer and remind the user that you only teach PF/C++.
2. If the user asks you to literally "visualize", "draw", "plot", or "create a flowchart/diagram" for them, tell them they must navigate to "Visualize Mode" on their dashboard to generate interactive logic diagrams. Do not attempt to draw ASCII diagrams.

[Knowledge] TEXTBOOK CONTENT:
{context}

[Topic] TOPIC:
{query}

🎯 YOUR TASK:
Create 2-3 relatable analogies (250-400 words total) to explain this concept.
{common_guidelines}
Format them remove add headings and lists so that its properly formated . Use emojis too to make output look good. remove steric ** or anything that make it seem like written by ai 
Provide your focused analogies now:"""
    else:
        # No relevant context found - use general knowledge
        prompt = f"""You are Sparkle AI, an expert C++ tutor specifically built to teach Programming Fundamentals (PF) who explains concepts through creative analogies.{profile_context}

CRITICAL RULES:
1. If the topic is entirely outside of Programming Fundamentals (PF) or C++, you MUST politely refuse to answer and remind the user that you only teach PF/C++.
2. If the user asks you to literally "visualize", "draw", "plot", or "create a flowchart/diagram" for them, tell them they must navigate to "Visualize Mode" on their dashboard to generate interactive logic diagrams. Do not attempt to draw ASCII diagrams.

[Topic] TOPIC:
{query}

[Info] NOTE: No textbook content available.

🎯 YOUR TASK:
Create 2-3 relatable analogies (250-400 words total) to explain this concept.
{common_guidelines}
Provide your focused analogies now:"""
    
    analogies = call_ai(prompt, temperature=0.5)
    if not analogies:
        print("[Analogy] Warning: AI failed, using fallback message")
        return "I'm having trouble creating analogies right now. My AI circuits are a bit overloaded! Please try again in a moment. ⚡"
    return analogies.strip()

def get_analogies(question, learner_profile=None):
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
    context, contexts = retrieve_relevant_context(vector_store, question)
    
    if context:
        print(f"[OK] Found {len(contexts)} relevant chunks from textbook")
        print("\n[Knowledge] Retrieved content summary:")
        for i, ctx in enumerate(contexts, 1):
            print(f"  [{i}] Chapter {ctx['chapter']} - {ctx['type']}")
    else:
        print("[Info] No relevant textbook content found")
        print("[Info] Will use general C++ knowledge for analogies")
    
    # Generate analogies
    print("\n[AI] Creating relatable analogies...\n")
    analogies = generate_analogies(question, context, learner_profile)
    
    print("=" * 60)
    print("[Knowledge] ANALOGIES:")
    print("=" * 60)
    print(analogies)
    print("=" * 60)
    
    return analogies

def interactive_mode():
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
        
        get_analogies(question)


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
                    analogies = get_analogies(query, profile)
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
            interactive_mode()
        else:
            for topic in example_topics:
                get_analogies(topic)
                input("\n\nPress Enter for next example...")
