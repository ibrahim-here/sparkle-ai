import json
import os
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document

# Load environment
load_dotenv()

# Configuration
JSONL_FILES = [
    "chapter2_dataset.jsonl",
    "chapter4_dataset.jsonl", 
    "chapter5_dataset.jsonl",
    "chapter6_dataset.jsonl",
    "chapter7_dataset.jsonl"
]

CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "cpp_textbook"

def load_all_chapters():
    """Load all JSONL files and prepare chunks for embedding"""
    all_chunks = []
    chunk_id = 0
    
    for file_path in JSONL_FILES:
        if not os.path.exists(file_path):
            print(f"⚠️  Skipping {file_path} (not found)")
            continue
            
        print(f"Loading {file_path}...")
        chapter_num = file_path.replace("chapter", "").replace("_dataset.jsonl", "")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                if not line.strip():
                    continue
                    
                try:
                    page_data = json.loads(line)
                    
                    # Extract concepts
                    if 'concepts' in page_data and page_data['concepts']:
                        for concept in page_data['concepts']:
                            # Handle both string and dict formats
                            if isinstance(concept, dict):
                                text = concept.get('concept', '') or concept.get('text', '')
                            else:
                                text = str(concept) if concept else ''
                            
                            if text and text.strip():
                                all_chunks.append({
                                    'id': f"ch{chapter_num}_p{line_num}_concept_{chunk_id}",
                                    'text': text,
                                    'metadata': {
                                        'chapter': chapter_num,
                                        'page': str(line_num),
                                        'type': 'concept',
                                        'source': file_path
                                    }
                                })
                                chunk_id += 1
                    
                    # Extract explanations
                    if 'explanations' in page_data and page_data['explanations']:
                        for explanation in page_data['explanations']:
                            # Handle both string and dict formats
                            if isinstance(explanation, dict):
                                text = explanation.get('explanation', '') or explanation.get('text', '')
                            else:
                                text = str(explanation) if explanation else ''
                            
                            if text and text.strip():
                                all_chunks.append({
                                    'id': f"ch{chapter_num}_p{line_num}_explanation_{chunk_id}",
                                    'text': text,
                                    'metadata': {
                                        'chapter': chapter_num,
                                        'page': str(line_num),
                                        'type': 'explanation',
                                        'source': file_path
                                    }
                                })
                                chunk_id += 1
                    
                    # Extract code snippets
                    if 'code_snippets' in page_data and page_data['code_snippets']:
                        for snippet in page_data['code_snippets']:
                            # Handle both dict and string formats
                            if isinstance(snippet, dict):
                                code_text = snippet.get('code', '')
                                description = snippet.get('description', '')
                                combined = f"{description}\n\nCode:\n{code_text}" if description else code_text
                                language = snippet.get('language', 'cpp')
                            else:
                                # If it's a string, use it directly
                                combined = str(snippet)
                                language = 'cpp'
                            
                            if combined and combined.strip():
                                all_chunks.append({
                                    'id': f"ch{chapter_num}_p{line_num}_code_{chunk_id}",
                                    'text': combined,
                                    'metadata': {
                                        'chapter': chapter_num,
                                        'page': str(line_num),
                                        'type': 'code',
                                        'language': language,
                                        'source': file_path
                                    }
                                })
                                chunk_id += 1
                    
                    # Extract definitions
                    if 'definitions' in page_data and page_data['definitions']:
                        for definition in page_data['definitions']:
                            if isinstance(definition, dict):
                                term = definition.get('term', '')
                                defn = definition.get('definition', '')
                                text = f"Term: {term}\nDefinition: {defn}"
                            else:
                                text = str(definition)
                            
                            if text and text.strip():
                                all_chunks.append({
                                    'id': f"ch{chapter_num}_p{line_num}_definition_{chunk_id}",
                                    'text': text,
                                    'metadata': {
                                        'chapter': chapter_num,
                                        'page': str(line_num),
                                        'type': 'definition',
                                        'source': file_path
                                    }
                                })
                                chunk_id += 1
                    
                except json.JSONDecodeError as e:
                    print(f"  ⚠️  Error parsing line {line_num} in {file_path}: {e}")
                    continue
    
    return all_chunks

def create_vector_db(chunks):
    """Create ChromaDB vector database with LOCAL HuggingFace embeddings"""
    print(f"\nCreating vector database with {len(chunks)} chunks...")
    print("📥 Loading local embedding model (first time may take a moment)...")
    
    # Initialize HuggingFace embeddings (runs locally, no API calls!)
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Convert chunks to LangChain Document format
    documents = [
        Document(
            page_content=chunk['text'],
            metadata=chunk['metadata']
        )
        for chunk in chunks
    ]
    
    print(f"🔄 Creating vector store with {len(documents)} documents...")
    
    # Create Chroma vector store with local embeddings
    vector_store = Chroma.from_documents(
        documents=documents,
        embedding=embedding_model,
        persist_directory=CHROMA_DB_PATH,
        collection_name=COLLECTION_NAME
    )
    
    print(f"✅ Vector database created at: {CHROMA_DB_PATH}")
    print(f"📊 Total chunks embedded: {len(chunks)}")
    print(f"🚀 Using LOCAL embeddings (no API limits!)")
    
    return vector_store

def main():
    print("=" * 60)
    print("Creating LOCAL Embeddings for C++ Textbook")
    print("=" * 60)
    print("🔥 Using LangChain + HuggingFace (NO API CALLS!)")
    
    # Load all chapters
    chunks = load_all_chapters()
    
    if not chunks:
        print("❌ No chunks extracted. Check your JSONL files.")
        return
    
    print(f"\n📚 Total chunks extracted: {len(chunks)}")
    
    # Create vector database
    vector_store = create_vector_db(chunks)
    
    print("\n" + "=" * 60)
    print("✅ LOCAL Embedding creation complete!")
    print("=" * 60)
    print(f"Database location: {CHROMA_DB_PATH}")
    print(f"Collection name: {COLLECTION_NAME}")
    print("\n🚀 No more API limits! Run the RAG query script!")

if __name__ == "__main__":
    main()
