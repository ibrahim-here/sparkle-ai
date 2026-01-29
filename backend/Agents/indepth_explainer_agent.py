import os
import sys
import json
from utils.ai_utils import call_ai, get_vector_store

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_semantic")
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 7

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

def generate_indepth_explanation(query, context, learner_profile=None):
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
    
    if context:
        # Hybrid mode: Use context + general knowledge
        prompt = f"""You are an expert C++ programming instructor. Provide a clear, focused explanation of this concept.{profile_context}

[Knowledge] TEXTBOOK CONTENT:
{context}

[Topic] TOPIC TO EXPLAIN:
{query}

🎯 YOUR TASK:
Provide a concise yet thorough explanation (300-500 words) that covers:

1. **Heading**: Use **Bold Text** for section headers (No # or ## symbols)
2. **What it is**: Clear definition in 1-2 sentences
3. **How it works**: Key concepts and syntax
4. **Code Example**: 1-2 practical examples with brief explanations
5. **Key Points**: A numbered list of 2-3 important things to remember

⚠️ IMPORTANT GUIDELINES:
- **NO markdown heading symbols** (like # or ##).
- **NO dashed or equals line separators** (like --- or ===).
- Use **BOLD text** for all titles and section headers.
- Total response should be 300-500 words.
- Use short, readable paragraphs.

Provide your focused explanation now:"""
    else:
        # No relevant context found - use general knowledge
        prompt = f"""You are an expert C++ programming instructor.{profile_context}

[Topic] TOPIC TO EXPLAIN:
{query}

[Info] NOTE: No specific content found in the student's textbook.

🎯 YOUR TASK:
Provide a concise yet thorough explanation (300-500 words) that covers:

1. **What it is**: Clear definition in 1-2 sentences
2. **How it works**: Key concepts and syntax  
3. **Code Example**: 1-2 practical examples with brief explanations
Provide a detailed, structured explanation of the user's query using your comprehensive C++ knowledge.

📝 FORMATTING GUIDELINES:
- **NO markdown heading symbols** (like # or ##).
- **NO dashed or equals line separators** (like --- or ===).
- Use **BOLD text** for the main title and all section headers.
- Provide well-commented code blocks with syntax highlighting.
- End with **Key Takeaways** as a numbered list (1., 2., 3.).
- Keep it clean and professional.

Provide your focused explanation now:"""
    
    # Generate explanation using OpenRouter/Gemini
    explanation = call_ai(prompt)
    if not explanation:
        print("[Explainer] Warning: AI failed, using fallback message")
        return "I'm having trouble generating a detailed explanation right now due to high demand. Please try again in 1-2 minutes! ⚡"
    return explanation.strip()

def get_explanation(question, learner_profile=None):
    """Main in-depth explanation function"""
    # Check for greeting tag or short query
    if "[GREETING]" in question or len(question.strip()) < 4:
        return "Hello! I am your Sparkle AI learning assistant. I see you're ready to dive into C++! Whenever you have a specific concept or problem you'd like me to explain in-depth, just let me know and I'll tailor the explanation to your neural profile. ⚡"

    print("\n" + "=" * 70)
    print(f"[Topic] Topic for In-Depth Explanation: {question}")
    print("=" * 70)
    
    # Load vector database
    print("\n[Search] Searching textbook for comprehensive content...")
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
        print("[Info] Will use comprehensive C++ knowledge for explanation")
    
    # Generate in-depth explanation
    print("\n[AI] Generating comprehensive, in-depth explanation...\n")
    explanation = generate_indepth_explanation(question, context, learner_profile)
    
    print("=" * 70)
    print("[Knowledge] IN-DEPTH EXPLANATION:")
    print("=" * 70)
    print(explanation)
    print("=" * 70)
    
    return explanation

def interactive_mode():
    """Interactive in-depth explanation mode"""
    print("\n" + "=" * 70)
    print("[AI] C++ In-Depth Explainer - Interactive Mode")
    print("=" * 70)
    print("Ask about any C++ concept for a comprehensive, detailed explanation!")
    print("Type 'exit' or 'quit' to stop\n")
    
    while True:
        question = input("\n[Prompt] What C++ concept should I explain in-depth?: ").strip()
        
        if question.lower() in ['exit', 'quit', 'q']:
            print("\n[Bye] Keep learning deeply!")
            break
        
        if not question:
            continue
        
        get_explanation(question)


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
                    explanation = get_explanation(query, profile)
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
            interactive_mode()
        else:
            for topic in example_topics:
                get_explanation(topic)
                input("\n\nPress Enter for next topic...")
