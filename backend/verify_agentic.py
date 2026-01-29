import sys
import os
import io
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
import traceback

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db_semantic")
COLLECTION_NAME = "cpp_textbook"

def test_embeddings():
    print("--- STARTING AGENTIC EMBEDDINGS VERIFICATION ---")
    try:
        # Load Embedding Model
        print("Loading embedding model...")
        embedding_model = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        print("Success: Model loaded.")
        
        # Connect to Vector DB
        print(f"Connecting to Chroma DB at: {CHROMA_DB_PATH}")
        if not os.path.exists(CHROMA_DB_PATH):
            print(f"Error: Database path does not exist: {CHROMA_DB_PATH}")
            return

        vector_store = Chroma(
            persist_directory=CHROMA_DB_PATH,
            embedding_function=embedding_model,
            collection_name=COLLECTION_NAME
        )
        print(f"Success: Connected to Collection: {COLLECTION_NAME}")
        
        # Test Query
        sample_text = "What is a while loop?"
        print(f"\nQuerying: '{sample_text}'")
        
        results = vector_store.similarity_search_with_score(sample_text, k=3)
        
        if not results:
            print("Warning: No results returned from similarity search.")
        else:
            print(f"Success: Found {len(results)} matches.")
            for i, (doc, score) in enumerate(results, 1):
                print(f"\nMatch {i} (Score: {score:.3f}):")
                print(f"Content: {doc.page_content}")
                print(f"Metadata: {doc.metadata}")
                
    except Exception as e:
        print("\nVERIFICATION FAILED")
        traceback.print_exc()

if __name__ == "__main__":
    # Fix for Windows Unicode output
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
        
    test_embeddings()
