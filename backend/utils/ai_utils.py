import os
from google import genai
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from flashrank import Ranker

# Load environment and allow overrides if .env changes
load_dotenv(override=True)

# Primary Model Configuration
PRIMARY_MODEL_GEMINI = "gemini-2.5-flash"

# Shared Instances
_embedding_model = None
_vector_stores = {}
_client = None
_last_key = None
_reranker_model = None

def get_gemini_client(api_key=None):
    """Return client, re-initializing if the key in .env has changed or a specific key is provided."""
    global _client, _last_key
    
    # Reload from .env to catch changes
    load_dotenv(override=True)
    
    # Use provided key or fall back to default from .env
    current_key = api_key or os.getenv("GEMINI_API_KEY")
    
    # Check if key is new or missing
    if not current_key or current_key.startswith("sk-or-v1"):
        print("[AI-Utils] Error: Invalid or missing API key")
        return None
        
    # Initialize or Reset if key changed or if we are using a specific key once
    # Note: If api_key is provided, we don't cache it as the global _client 
    # if it differs from the default, to avoid side effects on other components.
    if api_key:
        print(f"[AI-Utils] Using specific API Key (Key: {current_key[:8]}...)")
        return genai.Client(api_key=current_key)

    if _client is None or current_key != _last_key:
        print(f"[AI-Utils] Initializing Gemini Client (Key: {current_key[:8]}...)")
        _client = genai.Client(api_key=current_key)
        _last_key = current_key
        
    return _client

def get_embedding_model():
    """Return singleton instance of the embedding model"""
    global _embedding_model
    if _embedding_model is None:
        print("[AI-Utils] Loading embedding model...")
        _embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
    return _embedding_model

def get_reranker_model():
    """Return singleton instance of the FlashRank reranker"""
    global _reranker_model
    if _reranker_model is None:
        print("[AI-Utils] Loading FlashRank reranker model...")
        # Optional: Specify model_name if you want a specific one, default is ms-marco-TinyBERT-L-2-v2
        _reranker_model = Ranker()
    return _reranker_model

def get_vector_store(db_path, collection_name):
    """Return or create a Chroma vector store instance"""
    global _vector_stores
    key = f"{db_path}:{collection_name}"
    
    if key not in _vector_stores:
        print(f"[AI-Utils] Loading vector store: {collection_name}...")
        _vector_stores[key] = Chroma(
            persist_directory=db_path,
            embedding_function=get_embedding_model(),
            collection_name=collection_name
        )
    return _vector_stores[key]

def call_ai(prompt, temperature=0.3, api_key=None):
    """
    Unified entry point using the new Google GenAI SDK (Gemini Only).
    Increased max_tokens to prevent response cut-offs.
    """
    client = get_gemini_client(api_key=api_key)
    if not client:
        return None
        
    try:
        response = client.models.generate_content(
            model=PRIMARY_MODEL_GEMINI,
            contents=prompt,
            config={
                'temperature': temperature,
            }
        )
        return response.text
    except Exception as e:
        print(f"[AI-Utils] Gemini API Error: {e}")
        return None

# Backward compatibility alias
def call_openrouter_api(prompt, **kwargs):
    """Alias for legacy calls, now routes to Gemini."""
    return call_ai(prompt, **kwargs)

def call_openrouter_api_legacy(prompt, **kwargs):
    return call_ai(prompt)
