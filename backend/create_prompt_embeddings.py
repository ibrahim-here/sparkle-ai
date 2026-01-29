import os
import glob
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_experimental.text_splitter import SemanticChunker
from langchain_core.documents import Document

# Load environment
load_dotenv()

# Configuration
PROMPT_ENG_DIR = "./promptEngineering"
CHROMA_DB_PATH = "./chroma_db_prompt_engineering"
COLLECTION_NAME = "prompt_engineering_concepts"

def load_and_chunk_files():
    """Load all .txt files from promptEngineering and apply Semantic Chunking"""
    all_chunks = []
    chunk_global_id = 0
    
    print("Initializing Embedding Model for Semantic Chunking...")
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    print("Initializing Semantic Chunker...")
    text_splitter = SemanticChunker(
        embedding_model,
        breakpoint_threshold_type="percentile" 
    )
    
    # Find all .txt files
    txt_files = glob.glob(os.path.join(PROMPT_ENG_DIR, "*.txt"))
    
    if not txt_files:
        print(f"No .txt files found in {PROMPT_ENG_DIR}")
        return []

    for file_path in txt_files:
        print(f"\nProcessing {file_path}...")
        filename = os.path.basename(file_path)
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            if not content.strip():
                print(f"Skipping empty file: {filename}")
                continue

            # Apply Semantic Chunking
            print(f"  - Splitting text (length: {len(content)} chars)...")
            splits = text_splitter.split_text(content)
            
            print(f"  - Generated {len(splits)} chunks.")
            
            # Create Document Objects
            for split_text in splits:
                all_chunks.append({
                    'id': f"{filename}_chunk_{chunk_global_id}",
                    'text': split_text,
                    'metadata': {
                        'source': filename,
                        'type': 'prompt_guide_chunk'
                    }
                })
                chunk_global_id += 1
                
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
            
    return all_chunks

def create_vector_db(chunks):
    """Create ChromaDB vector database"""
    print(f"\n\nCreating vector database with {len(chunks)} semantic chunks...")
    
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    documents = [
        Document(
            page_content=chunk['text'],
            metadata=chunk['metadata']
        )
        for chunk in chunks
    ]
    
    print(f"Writing to {CHROMA_DB_PATH}...")
    
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_PATH,
        collection_name=COLLECTION_NAME
    )
    
    print(f"Vector database created at: {CHROMA_DB_PATH}")
    print(f"Total chunks embedded: {len(chunks)}")
    
    return vector_store

def main():
    print("=" * 60)
    print("Creating PROMPT ENGINEERING Embeddings (Semantic)")
    print("=" * 60)
    
    chunks = load_and_chunk_files()
    
    if not chunks:
        print("Error: No chunks extracted.")
        return
    
    print(f"\nTotal semantic chunks generated: {len(chunks)}")
    
    create_vector_db(chunks)
    
    print("\n" + "=" * 60)
    print("COMPLETE!")
    print("=" * 60)
    print(f"Target DB: {CHROMA_DB_PATH}")

if __name__ == "__main__":
    main()
