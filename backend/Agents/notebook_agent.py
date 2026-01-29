import os
from utils.ai_utils import call_ai
from utils.notebook_utils import get_session_vector_store

def retrieve_notebook_context(session_id, query, top_k=15):
    """Retrieve relevant chunks from the specific session's vector store"""
    vector_store = get_session_vector_store(session_id)
    
    # Check if collection has data
    if not vector_store._collection.count():
        return None, []
        
    results = vector_store.similarity_search_with_score(query, k=top_k)
    
    if not results:
        return None, []
        
    contexts = []
    for doc, score in results:
        contexts.append({
            'text': doc.page_content,
            'source': doc.metadata.get('source', 'Unknown'),
            'score': score
        })
        
    combined_context = "\n\n---\n\n".join([
        f"[Source: {ctx['source']}]\n{ctx['text']}" 
        for ctx in contexts
    ])
    
    return combined_context, contexts

def get_notebook_response(session_id, query):
    """
    Generate a response strictly grounded in the session's uploaded documents.
    Returns both the response text and citation metadata.
    """
    print(f"[Notebook Agent] Processing query for session {session_id}: {query}")
    
    context, contexts = retrieve_notebook_context(session_id, query)
    
    if not context:
        return {
            "response": "I cannot answer this question because no relevant information was found in the uploaded documents for this session. Please upload a PDF containing the information.",
            "citations": []
        }

    # Build citation map
    citations = []
    for idx, ctx in enumerate(contexts, 1):
        citations.append({
            "id": idx,
            "source": ctx['source'],
            "text": ctx['text'][:300] + "..." if len(ctx['text']) > 300 else ctx['text']  # Truncate for tooltip
        })

    prompt = f"""You are a strict research assistant rooted in the provided context.

[CONTEXT FROM UPLOADED DOCUMENTS]
{context}

[USER QUESTION]
{query}

[INSTRUCTIONS]
1. Answer the user's question using ONLY the provided context above.
2. CITATION FORMAT: When you reference information, cite it using numbered superscripts like this: "Firewalls filter packets[1]" or "Stateful inspection tracks connections[2][3]". Use the source numbers [1], [2], [3], etc. based on which context chunk the information came from.
3. IF THE ANSWER IS NOT IN THE CONTEXT: You must state "I cannot find information about this in the provided documents." Do not hallucinate or use outside knowledge.
4. Keep the answer clear, professional, and direct.
5. IMPORTANT: Use numbered citations [1], [2], etc. throughout your answer, NOT source filenames.

Provide your strict answer now:"""

    # Use the specific API key for notebook/upload operations
    notebook_api_key = os.getenv("upload_book_or_pdf")
    response_text = call_ai(prompt, temperature=0.1, api_key=notebook_api_key) # Low temp for strictness
    
    if not response_text:
        return {
            "response": "I encountered an error generating the response. Please try again.",
            "citations": []
        }
    
    return {
        "response": response_text.strip(),
        "citations": citations
    }

