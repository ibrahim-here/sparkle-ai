import os
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

# Load environment
load_dotenv()

# Configuration
PROMPT_DIR = "./promptEngineering"
CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "prompt_engineering"

def load_prompt_guides():
    """Load all .txt files from the prompt engineering directory"""
    documents = []
    
    if not os.path.exists(PROMPT_DIR):
        print(f"❌ Directory not found: {PROMPT_DIR}")
        return []

    print(f"Scanning {PROMPT_DIR}...")
    
    for filename in os.listdir(PROMPT_DIR):
        if filename.endswith(".txt"):
            file_path = os.path.join(PROMPT_DIR, filename)
            print(f"  - Loading {filename}...")
            
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    text = f.read()
                    if text.strip():
                        documents.append(Document(
                            page_content=text,
                            metadata={"source": filename, "type": "guide"}
                        ))
            except Exception as e:
                print(f"  Warning: Error reading {filename}: {e}")

    return documents

def split_documents(documents):
    """Split documents into smaller chunks for embedding"""
    print(f"\nSplitting {len(documents)} documents into chunks...")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        separators=["\n\n", "\n", " ", ""],
        length_function=len,
    )
    chunks = text_splitter.split_documents(documents)
    print(f"   -> Created {len(chunks)} chunks.")
    return chunks

def create_vector_db(chunks):
    """Create ChromaDB vector database with LOCAL HuggingFace embeddings"""
    print(f"\nCreating vector database for PROMPT ENGINEERING...")
    print("Loading local embedding model...")
    
    # Initialize HuggingFace embeddings
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    print(f"Creating vector store in collection '{COLLECTION_NAME}'...")
    
    # Create Chroma vector store
    vector_store = Chroma.from_documents(
        documents=chunks,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_PATH,
        collection_name=COLLECTION_NAME
    )
    
    print(f"Vector database updated at: {CHROMA_DB_PATH}")
    print(f"   Collection: {COLLECTION_NAME}")
    print(f"Prompt Engineering guides are now embedded!")
    
    return vector_store

def main():
    print("=" * 60)
    print("Creating Embeddings for Prompt Engineering Guides")
    print("=" * 60)
    
    # 1. Load Documents
    documents = load_prompt_guides()
    
    if not documents:
        print("❌ No documents found. Exiting.")
        return
    
    # 2. Split into Chunks
    chunks = split_documents(documents)
    
    if not chunks:
        print("❌ No chunks created. Exiting.")
        return

    # 3. Create/Update Vector DB
    create_vector_db(chunks)
    
    print("\n" + "=" * 60)
    print("Process Complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()
