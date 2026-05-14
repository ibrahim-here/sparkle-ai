import os
from google import genai
from groq import Groq
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from flashrank import Ranker
import requests

# Load environment and allow overrides if .env changes
load_dotenv(override=True)

# Primary Model Configuration
PRIMARY_MODEL_GEMINI = "gemini-2.5-flash"

# Key Fallback Configuration
KEY_FALLBACK_MAP = {
    "GEMINI_API_KEY": "GEMINI_API_KEY_BACKUP",
    "embedings": "EMBEDDINGS_BACKUP",
    "profile_agent": "PROFILE_AGENT_BACKUP",
    "upload_book_or_pdf": "UPLOAD_BOOK_OR_PDF_BACKUP",
    "problem_solving": "PROBLEM_SOLVING_BACKUP",
    "visual_agent": "visual_agent_backup"
}

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
    key_display = current_key[:8] if isinstance(current_key, str) else "MISSING"

    if api_key:
        print(f"[AI-Utils] Using specific API Key (Key: {key_display}...)")
        return genai.Client(api_key=current_key)

    if _client is None or current_key != _last_key:
        print(f"[AI-Utils] Initializing Gemini Client (Key: {key_display}...)")
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

def call_ollama(prompt, temperature=0.3, json_mode=False):
    """Call local Ollama instance."""
    OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gpt-oss:20b-cloud")
    try:
        print(f"[Ollama] Calling local model {OLLAMA_MODEL}...")
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_ctx": 8192
            }
        }
        if json_mode:
            payload["format"] = "json"
            
        res = requests.post("http://localhost:11434/api/generate", json=payload, timeout=180)
        res.raise_for_status()
        data = res.json()
        response = data.get("response")
        if response:
            return response
    except Exception as e:
        print(f"[Ollama] Error: {e}")
    return None

def call_ai(prompt, temperature=0.3, api_key=None, json_mode=False):
    """
    Unified entry point using Local Ollama or Google GenAI SDK (Gemini).
    Checks AI_PROVIDER_MODE: 1=Local, 2=Cloud.
    """
    load_dotenv(override=True)
    mode = os.getenv("AI_PROVIDER_MODE", "2") # Default to Cloud

    # --- Mode 1: Local (Ollama) ---
    if mode == "1":
        local_res = call_ollama(prompt, temperature, json_mode)
        if local_res:
            return local_res
        print("[AI-Utils] Local mode failed, falling back to Cloud...")

    # --- Mode 2: Cloud (Gemini) ---
    # 1. Determine the primary key
    primary_key = api_key or os.getenv("GEMINI_API_KEY")
    
    # 2. Try with Primary Key
    client = get_gemini_client(api_key=primary_key)
    if client:
        try:
            config = {'temperature': temperature}
            if json_mode:
                config['response_mime_type'] = 'application/json'
            
            response = client.models.generate_content(
                model=PRIMARY_MODEL_GEMINI,
                contents=prompt,
                config=config
            )
            if response and hasattr(response, 'text'):
                return response.text
        except Exception as e:
            print(f"[AI-Utils] Primary Key Error: {e}")

    # 3. Identify Fallback Key
    fallback_key_val = None
    
    # If a specific api_key was passed, try to find its backup
    if api_key:
        for p_name, b_name in KEY_FALLBACK_MAP.items():
            if api_key == os.getenv(p_name):
                fallback_key_val = os.getenv(b_name)
                break
    else:
        # Default fallback for global GEMINI_API_KEY
        fallback_key_val = os.getenv("GEMINI_API_KEY_BACKUP")

    # 4. Retry with Fallback Key
    if fallback_key_val and fallback_key_val != primary_key:
        print(f"[AI-Utils] 🔄 Retrying with Backup API Key...")
        backup_client = get_gemini_client(api_key=fallback_key_val)
        if backup_client:
            try:
                config = {'temperature': temperature}
                if json_mode:
                    config['response_mime_type'] = 'application/json'

                response = backup_client.models.generate_content(
                    model=PRIMARY_MODEL_GEMINI,
                    contents=prompt,
                    config=config
                )
                if response and hasattr(response, 'text'):
                    print("[AI-Utils] ✅ Backup Key successful")
                    return response.text
            except Exception as e:
                print(f"[AI-Utils] Backup Key Error: {e}")
                
    return None


def call_groq(prompt: str, temperature: float = 0.3, primary_key: str = None, backup_key: str = None, json_mode: bool = False) -> str | None:
    """
    Call Local Ollama or Groq API with primary/backup key fallback.
    Checks AI_PROVIDER_MODE: 1=Local, 2=Cloud.
    """
    load_dotenv(override=True)
    mode = os.getenv("AI_PROVIDER_MODE", "2")

    # --- Mode 1: Local (Ollama) ---
    if mode == "1":
        local_res = call_ollama(prompt, temperature, json_mode)
        if local_res:
            return local_res
        print("[Groq-Utils] Local mode failed, falling back to Cloud...")

    # --- Mode 2: Cloud (Groq) ---
    GROQ_MODEL = "llama-3.3-70b-versatile"
    messages = [{"role": "user", "content": prompt}]
    
    keys_to_try = [k for k in [primary_key, backup_key] if k]
    
    for i, key in enumerate(keys_to_try):
        label = "Primary" if i == 0 else "Backup"
        key_display = key[:12] if key else "MISSING"
        try:
            print(f"[Groq] Using {label} Key ({key_display}...)")
            client = Groq(api_key=key, max_retries=0)
            kwargs = {
                "model": GROQ_MODEL,
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 4096,
            }
            if json_mode:
                kwargs["response_format"] = {"type": "json_object"}
            response = client.chat.completions.create(**kwargs)
            text = response.choices[0].message.content
            if text:
                if i > 0:
                    print(f"[Groq] ✅ {label} Key successful")
                return text
        except Exception as e:
            print(f"[Groq] {label} Key Error: {e}")
            continue

    print("[Groq] ❌ All keys failed.")
    return None

# Backward compatibility alias
def call_openrouter_api(prompt, **kwargs):
    """Alias for legacy calls, now routes to Gemini."""
    return call_ai(prompt, **kwargs)

def call_openrouter_api_legacy(prompt, **kwargs):
    return call_ai(prompt)
