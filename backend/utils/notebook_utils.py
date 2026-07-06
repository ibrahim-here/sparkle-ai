import os
import shutil
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from utils.ai_utils import get_embedding_model

# Directory to store session-specific vector DBs
NOTEBOOK_DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_notebook")

def get_session_db_path(session_id: str):
    """Get the path for a specific session's vector database"""
    return os.path.join(NOTEBOOK_DB_DIR, f"session_{session_id}")

def get_session_vector_store(session_id: str):
    """Get or create a Chroma vector store for a specific session"""
    db_path = get_session_db_path(session_id)
    collection_name = f"session_{session_id}"
    
    # Ensure directory exists is handled by Chroma, but good to know path
    embedding_msg = get_embedding_model()
    
    vector_store = Chroma(
        persist_directory=db_path,
        embedding_function=embedding_msg,
        collection_name=collection_name
    )
    return vector_store

async def process_and_embed_file(session_id: str, file_path: str, original_filename: str):
    """
    Process a PDF file: load, chunk, and embed into the session's vector store.
    """
    print(f"[Notebook] Processing {original_filename} for session {session_id}...")
    
    try:
        # 1. Load PDF
        loader = PyPDFLoader(file_path)
        pages = loader.load()
        print(f"[Notebook] Loaded {len(pages)} pages from {original_filename}")
        
        # 2. Split Text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1500,
            chunk_overlap=300,
            add_start_index=True
        )
        splits = text_splitter.split_documents(pages)
        print(f"[Notebook] Created {len(splits)} chunks")
        
        # 3. Add Metadata
        for split in splits:
            split.metadata["source"] = original_filename
            split.metadata["session_id"] = session_id
            
        # 4. Embed into Session-Specific DB
        vector_store = get_session_vector_store(session_id)
        vector_store.add_documents(documents=splits)
        
        print(f"[Notebook] Successfully embedded {len(splits)} chunks for {original_filename}")
        return True, f"Successfully processed {original_filename}"
        
    except Exception as e:
        print(f"[Notebook] Error processing file: {e}")
        return False, str(e)
