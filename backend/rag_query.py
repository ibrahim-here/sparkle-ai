import os
from dotenv import load_dotenv
import google.generativeai as genai
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

# Load environment
load_dotenv()
genai.configure(api_key=os.getenv("embedings"))
model = genai.GenerativeModel("gemini-2.5-flash")

# Configuration
CHROMA_DB_PATH = "./chroma_db"
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 5  # Number of relevant chunks to retrieve

def load_vector_db():
    """Load the existing ChromaDB collection with LOCAL embeddings"""
    print("📥 Loading local embedding model...")
    
    # Use same local embeddings as create_embeddings.py
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
            'chapter': doc.metadata.get('chapter', 'Unknown'),
            'type': doc.metadata.get('type', 'Unknown'),
            'distance': score
        })
    
    # Combine all context into one string
    combined_context = "\n\n---\n\n".join([
        f"[Chapter {ctx['chapter']} - {ctx['type']}]\n{ctx['text']}" 
        for ctx in contexts
    ])
    
    return combined_context, contexts

def generate_answer(query, context):
    """Generate answer using retrieved context + LLM's knowledge"""
    
    if context:
        # Hybrid mode: Use context + general knowledge
        prompt = f"""You are an expert C++ programming tutor. Your goal is to provide clear, accurate, and educational answers.

📚 TEXTBOOK CONTENT (Retrieved from student's C++ textbook):
{context}

❓ STUDENT'S QUESTION:
{query}

📝 INSTRUCTIONS FOR YOUR ANSWER:
1. **Start with the textbook content**: Use the retrieved textbook information as your PRIMARY and MAIN source
2. **Extract key information**: Identify the most relevant concepts, definitions, and examples from the textbook
3. **Structure your answer clearly**:
   - Begin with a direct definition or explanation from the textbook
   - Include any code examples or syntax shown in the textbook
   - Explain the concepts in a clear, step-by-step manner
4. **Enhance with your knowledge**: If the textbook content is incomplete or needs clarification:
   - Add helpful examples or analogies
   - Provide additional context or best practices
   - Explain "why" things work the way they do
5. **Be concise but complete**: Focus on answering the specific question asked

⚠️ IMPORTANT: Base your answer primarily on the textbook content provided above. Only supplement with general knowledge if needed for clarity.

Provide your answer now:"""
    else:
        # No relevant context found - use general knowledge
        prompt = f"""You are an expert C++ programming tutor.

❓ STUDENT'S QUESTION:
{query}

⚠️ NOTE: No specific content was found in the student's textbook for this question.

Please provide a clear, educational answer using your general C++ programming knowledge. Keep it concise and focused on the question asked.

Provide your answer now:"""
    
    response = model.generate_content(prompt)
    return response.text

def query_rag(question):
    """Main RAG query function"""
    print("\n" + "=" * 60)
    print(f"Question: {question}")
    print("=" * 60)
    
    # Load vector database
    print("\n🔍 Searching textbook...")
    vector_store = load_vector_db()
    
    # Retrieve relevant context
    context, contexts = retrieve_relevant_context(vector_store, question)
    
    if context:
        print(f"✅ Found {len(contexts)} relevant chunks from textbook")
        print("\n📖 Retrieved content:")
        for i, ctx in enumerate(contexts, 1):
            print(f"\n  [{i}] Chapter {ctx['chapter']} - {ctx['type']}")
            # Show preview of content (first 100 chars)
            preview = ctx['text'][:100] + "..." if len(ctx['text']) > 100 else ctx['text']
            print(f"      {preview}")
    else:
        print("⚠️  No relevant textbook content found")
        print("📚 Will use general C++ knowledge")
    
    # Generate answer
    print("\n💭 Generating answer...\n")
    answer = generate_answer(question, context)
    
    print("=" * 60)
    print("ANSWER:")
    print("=" * 60)
    print(answer)
    print("=" * 60)
    
    return answer

def interactive_mode():
    """Interactive query mode"""
    print("\n" + "=" * 60)
    print("C++ Textbook RAG System - Interactive Mode")
    print("=" * 60)
    print("Ask questions about C++ programming!")
    print("Type 'exit' or 'quit' to stop\n")
    
    while True:
        question = input("\n💬 Your question: ").strip()
        
        if question.lower() in ['exit', 'quit', 'q']:
            print("\n👋 Goodbye!")
            break
        
        if not question:
            continue
        
        query_rag(question)

if __name__ == "__main__":
    # Example usage
    example_questions = [
        "What are C++ variables?",
        "Explain pointers in C++",
        "How do arrays work in C++?"
    ]
    
    print("\n🚀 RAG System Ready!")
    print("\nChoose mode:")
    print("1. Interactive mode (ask multiple questions)")
    print("2. Example questions")
    
    choice = input("\nEnter choice (1 or 2): ").strip()
    
    if choice == "1":
        interactive_mode()
    else:
        for q in example_questions:
            query_rag(q)
            input("\nPress Enter for next question...")
