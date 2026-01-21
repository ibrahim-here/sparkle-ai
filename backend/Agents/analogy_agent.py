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
TOP_K_RESULTS = 5  # Number of relevant chunks to retrieve

def call_openrouter_api(prompt, model, api_key, temperature=0.7, max_tokens=1000):
    """Call OpenRouter API with specified model"""
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/sparkle-ai",
            "X-Title": "Sparkle AI - Analogy Agent"
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
- Use **BOLD text** for the main title and each analogy header (e.g., **Analogy 1: [Name]**).
- Use **bold text** for connections between the analogy and C++ concepts.
- Use numbered lists (1., 2., 3.) for multi-step breakdowns.
- Keep output clean and optimized for a dark UI.
"""

    if context:
        # Hybrid mode: Use context + general knowledge
        prompt = f"""You are an expert C++ tutor who explains concepts through creative analogies.{profile_context}

[Knowledge] TEXTBOOK CONTENT:
{context}

[Topic] TOPIC:
{query}

🎯 YOUR TASK:
Create 2-3 relatable analogies (250-400 words total) to explain this concept.
{common_guidelines}
Provide your focused analogies now:"""
    else:
        # No relevant context found - use general knowledge
        prompt = f"""You are an expert C++ tutor who explains concepts through creative analogies.{profile_context}

[Topic] TOPIC:
{query}

[Info] NOTE: No textbook content available.

🎯 YOUR TASK:
Create 2-3 relatable analogies (250-400 words total) to explain this concept.
{common_guidelines}
Provide your focused analogies now:"""
    
    analogies = generate_with_fallback(prompt)
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
