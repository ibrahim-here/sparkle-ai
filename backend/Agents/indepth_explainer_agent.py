import os
import sys
import json
from dotenv import load_dotenv
import requests
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

# Load environment
load_dotenv()

# OpenRouter API Configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
PRIMARY_MODEL = "meta-llama/llama-3.2-3b-instruct:free"

# Load API keys
PRIMARY_API_KEY = os.getenv("embedings")

# Configuration
CHROMA_DB_PATH = "../chroma_db"  # Path relative to backend/Agents/ folder
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 7  # Retrieve more chunks for comprehensive explanations

def call_openrouter_api(prompt, model, api_key, temperature=0.3, max_tokens=1000):
    """Call OpenRouter API with specified model"""
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/sparkle-ai",
            "X-Title": "Sparkle AI - In-Depth Explainer"
        }
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
        
    except Exception as e:
        print(f"API Error: {e}")
        return None

def generate_with_fallback(prompt):
    """
    Generate content using the primary model.
    """
    print(f"Using primary model: {PRIMARY_MODEL}")
    result = call_openrouter_api(prompt, PRIMARY_MODEL, PRIMARY_API_KEY)
    
    if result:
        return result
    
    raise Exception(f"Primary model {PRIMARY_MODEL} failed to generate response")

def load_vector_db():
    """Load the existing ChromaDB collection with LOCAL embeddings"""
    print("[Load] Loading local embedding model...")
    
    # Use same local embeddings as createembeddings.py
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Load existing vector store
    vector_store = Chroma(
        persist_directory=CHROMA_DB_PATH,
        embedding_function=embedding_model,
        collection_name=COLLECTION_NAME
    )
    
    return vector_store

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
Use this profile to tailor your explanation. If the student has secondary preferences (e.g., 30% kinesthetic alongside reading), incorporate those elements (e.g., add hands-on code examples). Make the explanation match their learning style while maintaining depth.

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
    
    # Generate explanation using OpenRouter with fallback
    explanation = generate_with_fallback(prompt)
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
    vector_store = load_vector_db()
    
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
