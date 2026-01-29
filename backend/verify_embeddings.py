
import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
import traceback

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "chroma_db")
COLLECTION_NAME = "cpp_textbook"

def test_embeddings():
    print("--- STARTING EMBEDDINGS VERIFICATION ---")
    
    try:
        # 1. Test Model Loading
        print("\n1. Step 1: Loading HuggingFace Embedding Model...")
        print("Model: sentence-transformers/all-MiniLM-L6-v2")
        embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        print("OK: Model loaded successfully.")
        
        # 2. Test Vector Generation
        print("\n2. Step 2: Testing Vector Generation...")
        sample_text = "What is a C++ variable?"
        vector = embedding_model.embed_query(sample_text)
        print(f"OK: Vector generated for sample text. Dimension: {len(vector)}")
        
        # 3. Test Vector Store Connection
        print("\n3. Step 3: Connecting to Chroma Vector Store...")
        if not os.path.exists(CHROMA_DB_PATH):
            print(f"Error: Chroma DB directory not found at {CHROMA_DB_PATH}")
            return
            
        vector_store = Chroma(
            persist_directory=CHROMA_DB_PATH,
            embedding_function=embedding_model,
            collection_name=COLLECTION_NAME
        )
        print(f"OK: Connected to Chroma DB (Collection: {COLLECTION_NAME}).")
        
        # 4. Test Similarity Search
        print("\n4. Step 4: Testing Similarity Search...")
        print(f"Query: '{sample_text}'")
        results = vector_store.similarity_search_with_score(sample_text, k=3)
        
        if not results:
            print("Warning: No results returned from similarity search.")
        else:
            print(f"OK: Found {len(results)} matches.")
            for i, (doc, score) in enumerate(results, 1):
                print(f"\n Match {i} (Score: {score:.4f}):")
                print(f" Content: {doc.page_content[:150]}...")
                print(f" Metadata: {doc.metadata}")
                
        print("\n--- VERIFICATION COMPLETE ---")
        
    except Exception as e:
        print("\n❌ VERIFICATION FAILED")
        traceback.print_exc()

if __name__ == "__main__":
    test_embeddings()
