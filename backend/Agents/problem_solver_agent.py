import os
import sys
import json
import asyncio
from utils.ai_utils import call_ai, get_vector_store, get_reranker_model

# Configuration
CHROMA_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_semantic")
COLLECTION_NAME = "cpp_textbook"
TOP_K_RESULTS = 5

PROMPT_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "chroma_db_PROMPT")
PROMPT_COLLECTION = "prompt_engineering"
PROMPT_TOP_K = 3

async def retrieve_relevant_context(vector_store, query, top_k=TOP_K_RESULTS, use_reranker=True):
    """Retrieve relevant chunks from vector database using LangChain and FlashRank"""
    fetch_k = top_k * 3 if use_reranker else top_k
    results = await vector_store.asimilarity_search_with_score(query, k=fetch_k)
    
    if not results:
        return None, []
        
    contexts = []
    
    if use_reranker:
        passages = []
        for doc, score in results:
            passages.append({
                "id": str(len(passages)),
                "text": doc.page_content,
                "meta": {
                    "chapter": doc.metadata.get('chapter', 'Unknown'),
                    "type": doc.metadata.get('type', 'Unknown'),
                    "original_distance": float(score)
                }
            })
            
        ranker = get_reranker_model()
        from flashrank import RerankRequest
        rerank_request = RerankRequest(query=query, passages=passages)
        reranked_results = ranker.rerank(rerank_request)
        best_results = reranked_results[:top_k]
        
        for br in best_results:
            contexts.append({
                'text': br['text'],
                'chapter': br['meta'].get('chapter', 'Unknown'),
                'type': br['meta'].get('type', 'Unknown'),
                'distance': br['score']
            })
    else:
        for doc, score in results:
            contexts.append({
                'text': doc.page_content,
                'chapter': doc.metadata.get('chapter', 'Unknown'),
                'type': doc.metadata.get('type', 'Unknown'),
                'distance': score
            })
            
    combined_context = "\n\n---\n\n".join([
        f"[Chapter {ctx['chapter']} - {ctx['type']}]\n{ctx['text']}" 
        for ctx in contexts
    ])
    
    return combined_context, contexts

async def generate_problem_solution(query, context, learner_profile=None, prompt_rules=None):
    """Generate a step-by-step solution for a programming problem"""
    
    profile_context = ""
    if learner_profile:
        profile_context = f"\n[Profile] STUDENT'S LEARNING PROFILE:\n{learner_profile}\n"

    prompt_engineering_context = ""
    if prompt_rules:
        prompt_engineering_context = f"\n📚 PROMPT ENGINEERING BEST PRACTICES:\n{prompt_rules}\n"

    prompt = f"""You are an expert Programming Instructor and Problem Solver specialized in **Programming Fundamentals**. Your goal is to help a student solve and understand core concepts in any programming language (e.g., C++, Python, Java, etc.).{profile_context}{prompt_engineering_context}

[Topic] PROBLEM TO SOLVE:
{query}

[Knowledge] RELEVANT CONCEPTS FROM TEXTBOOK (C++ SPECIFIC):
{context if context else "No direct matches found. Use your general knowledge for the requested language."}

⚖️ SCOPE & RESTRICTION RULES:
1. **Fundamentals Only**: You only solve problems related to: Variables, Data Types, Operators, Control Structures (Loops, If-Else), Arrays/Lists (1D, 2D), Functions/Methods, Basic Structures/Objects, and File Handling.
2. **Advanced Topic Rejection**: If the user asks about advanced topics like Dynamic Programming, Graph Theory, AI/ML, or complex system design, you MUST respond exactly with: "My knowledge is focused on programming fundamental topics (loops, arrays, functions, etc.). I cannot assist with advanced algorithmic or specialized architectural topics at this time."
3. **Multi-Language Support**: Provide the solution in the programming language requested by the user. If they don't specify, use C++. If the textbook context above is C++ and they asked for Python, use the textbook concepts as a logic guide but write the code in Python.

🎯 YOUR TASK:
1. **Analyze the Problem**: Briefly explain the logic in 2-3 sentences.
2. **Step-by-Step Plan**: Break down the solution into clear, logical steps.
3. **Implementation**: Provide clean, well-commented code in the requested language.
4. **Code Explanation**: Explain the key parts of the logic used.
5. **Pro-Tip**: Provide a quick tip or common pitfall.

📝 FORMATTING GUIDELINES:
- Use proper Markdown headings (`#`, `##`, `###`).
- **Visual Style**: Use relevant emojis (🧩, 💻, 💡).
- End with: "Problem Solved! Keep practicing. ⚡ — Sparkle AI Team"

Provide your solution now:"""
    
    solution = await asyncio.to_thread(call_ai, prompt)
    if not solution:
        return "I encountered an error while trying to solve this problem. Let's try again! ⚡"
    return solution.strip()

async def get_problem_solution(question, learner_profile=None):
    """Main problem solver entry point"""
    print(f"\n[Problem Solver] Analyzing problem: {question}")
    
    vector_store = get_vector_store(CHROMA_DB_PATH, COLLECTION_NAME)
    context, _ = await retrieve_relevant_context(vector_store, question)
    
    try:
        prompt_store = get_vector_store(PROMPT_DB_PATH, PROMPT_COLLECTION)
        prompt_rules, _ = await retrieve_relevant_context(prompt_store, question, top_k=PROMPT_TOP_K, use_reranker=False)
    except:
        prompt_rules = None

    solution = await generate_problem_solution(question, context, learner_profile, prompt_rules)
    return solution

if __name__ == "__main__":
    # Test mode
    test_q = "Write a program to find the largest number in an array"
    print(asyncio.run(get_problem_solution(test_q)))
