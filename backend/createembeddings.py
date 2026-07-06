import json
import os
import time
from dotenv import load_dotenv
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_experimental.text_splitter import SemanticChunker
from langchain_core.documents import Document

# Load environment
load_dotenv()

# Configuration
JSONL_FILES = [
    "../chapters/chapter2_dataset.jsonl",
    "../chapters/chapter4_dataset.jsonl", 
    "../chapters/chapter5_dataset.jsonl",
    "../chapters/chapter6_dataset.jsonl",
    "../chapters/chapter7_dataset.jsonl"
]

# Target DB for Semantic Chunking
CHROMA_DB_PATH = "./chroma_db_semantic"
COLLECTION_NAME = "cpp_textbook"

def load_and_chunk_all_chapters():
    """Load all JSONL files, aggregate page content, and apply Semantic Chunking"""
    all_chunks = []
    chunk_global_id = 0
    
    print("Initializing Embedding Model for Semantic Chunking...")
    # Initialize the embedding model once for the chunker
    embedding_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )
    
    # Initialize Semantic Chunker
    # 'percentile' threshold helps determine where to split based on dissimilarity
    text_splitter = SemanticChunker(
        embedding_model,
        breakpoint_threshold_type="percentile" 
    )
    
    for file_path in JSONL_FILES:
        if not os.path.exists(file_path):
            print(f"Skipping {file_path} (not found)")
            continue
            
        print(f"\nProcessing {file_path}...")
        chapter_num = file_path.replace("chapter", "").replace("_dataset.jsonl", "")
        if "chapters/" in chapter_num:
            chapter_num = chapter_num.split("chapters/")[-1]
        
        with open(file_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            total_lines = len(lines)
            
            for line_num, line in enumerate(lines, 1):
                if not line.strip():
                    continue
                    
                print(f"  - Processing Page {line_num}/{total_lines}...", end="\r")
                
                try:
                    page_data = json.loads(line)
                    
                    # 1. Aggregate Content for the Page
                    page_content = []
                    
                    # Concepts
                    if 'concepts' in page_data:
                        for c in page_data['concepts']:
                            text = c.get('concept', '') or c.get('text', '') if isinstance(c, dict) else str(c)
                            if text: page_content.append(f"Concept: {text}")
                            
                    # Explanations
                    if 'explanations' in page_data:
                        for e in page_data['explanations']:
                            text = e.get('explanation', '') or e.get('text', '') if isinstance(e, dict) else str(e)
                            if text: page_content.append(f"Explanation: {text}")

                    # Definitions
                    if 'definitions' in page_data:
                        for d in page_data['definitions']:
                            if isinstance(d, dict):
                                text = f"Definition of {d.get('term','')}: {d.get('definition','')}"
                            else:
                                text = str(d)
                            if text: page_content.append(text)
                            
                    # Code Snippets
                    if 'code_snippets' in page_data:
                        for s in page_data['code_snippets']:
                            if isinstance(s, dict):
                                code = s.get('code', '')
                                desc = s.get('description', '')
                                if code: page_content.append(f"Code Explanation: {desc}\n\nCode:\n{code}")
                            else:
                                if s: page_content.append(str(s))

                    # Combine into one text block
                    full_page_text = "\n\n".join(page_content)
                    
                    if not full_page_text.strip():
                        continue

                    # 2. Apply Semantic Chunking
                    # The splitter expects raw text and returns documents or splits
                    # We create simple splits from the page text
                    splits = text_splitter.split_text(full_page_text)
                    
                    # 3. Create Document Objects
                    for split_text in splits:
                        all_chunks.append({
                            'id': f"ch{chapter_num}_p{line_num}_semantic_{chunk_global_id}",
                            'text': split_text,
                            'metadata': {
                                'chapter': chapter_num,
                                'page': str(line_num),
                                'type': 'semantic_chunk',
                                'source': file_path
                            }
                        })
                        chunk_global_id += 1

                except json.JSONDecodeError as e:
                    print(f"  Error parsing line {line_num}: {e}")
                    continue
    
    return all_chunks

def create_vector_db(chunks):
    """Create ChromaDB vector database"""
    print(f"\n\nCreating vector database with {len(chunks)} semantic chunks...")
    print("Loading embedding model key...")
    
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
    
    # Create Chroma vector store
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
    print("Creating SEMANTIC Embeddings (Context-Aware)")
    print("=" * 60)
    print("Using LangChain Experimental SemanticChunker")
    print("No API Calls Required")
    
    chunks = load_and_chunk_all_chapters()
    
    if not chunks:
        print("Error: No chunks extracted.")
        return
    
    print(f"\nTotal semantic chunks generated: {len(chunks)}")
    
    create_vector_db(chunks)
    
    print("\n" + "=" * 60)
    print("SEMANTIC EMBEDDING COMPLETE!")
    print("=" * 60)
    print(f"Target DB: {CHROMA_DB_PATH}")

if __name__ == "__main__":
    main()
