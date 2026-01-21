import os
import sys
from dotenv import load_dotenv
import requests
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
import json

# Load environment from parent directory (backend/.env)
load_dotenv(dotenv_path="../.env")

# OpenRouter API Configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
PRIMARY_MODEL = "meta-llama/llama-3.2-3b-instruct:free"

# Load API keys
PRIMARY_API_KEY = os.getenv("embedings")

# Configuration
CHROMA_DB_PATH = "../chroma_db_PROMPT"  # Path relative to backend/Agents/ folder
COLLECTION_NAME = "prompt_engineering"
TOP_K_RESULTS = 3  # Number of relevant chunks to retrieve

def call_openrouter_api(prompt, model, api_key, temperature=0.3, top_p=0.8, max_tokens=500):
    """
    Call OpenRouter API with specified model and API key
    
    Args:
        prompt: The prompt to send to the model
        model: Model identifier (e.g., "mistralai/mistral-small")
        api_key: OpenRouter API key
        temperature: Sampling temperature
        top_p: Top-p sampling parameter
        max_tokens: Maximum tokens to generate
    
    Returns:
        Generated text or None if failed
    """
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/sparkle-ai",  # Optional, for rankings
            "X-Title": "Sparkle AI - Learning Platform"  # Optional, for rankings
        }
        
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": temperature,
            "top_p": top_p,
            "max_tokens": max_tokens
        }
        
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        generated_text = result["choices"][0]["message"]["content"]
        return generated_text
        
    except requests.exceptions.RequestException as e:
        print(f"API Error: {e}")
        return None
    except (KeyError, IndexError) as e:
        print(f"Response parsing error: {e}")
        return None

def generate_with_fallback(prompt):
    """
    Generate content using the primary model.
    """
    result = call_openrouter_api(prompt, PRIMARY_MODEL, PRIMARY_API_KEY)
    
    if result:
        return result
    
    raise Exception(f"Primary model {PRIMARY_MODEL} failed to generate response")


def load_vector_db():
    """Load the existing ChromaDB collection with LOCAL embeddings"""
    # Use same local embeddings as create_prompt_embeddings.py
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

def is_greeting(query):
    """Check if query is a simple greeting"""
    greetings = {
        'hi', 'hello', 'hey', 'greetings', 'hola', 'hi there', 'hello there',
        'good morning', 'good afternoon', 'good evening', 'yo', 'sup', 'test'
    }
    # Clean query: lowercase, remove punctuation
    clean_query = "".join(c for c in query.lower() if c.isalnum() or c.isspace()).strip()
    return clean_query in greetings or len(clean_query) <= 2

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
    1. Checks if the query is a greeting (skips enhancement)
    2. Retrieves best practices from ChromaDB
    3. Builds a detailed instructional prompt
    4. Calls the LLM to generate the final, enhanced query
    """
    if is_greeting(raw_query):
        return f"[GREETING] {raw_query}"

    # 1. Retrieve Context
    context = None
    try:
        vector_store = load_vector_db()
        context_str, contexts = retrieve_relevant_context(vector_store, raw_query)
        context = context_str
    except Exception as e:
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
    common_tasks = "Transform the user's raw query into a specific, detailed educational objective (2-4 sentences). Do NOT invent a new topic if the query is vague; ask for clarification instead. Return ONLY the enhanced prompt. DO NOT include any formatting instructions like headings in the enhanced prompt."
    
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
    enhanced = generate_with_fallback(prompt)
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
