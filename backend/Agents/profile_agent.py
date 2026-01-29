import sys
import json
import os
from utils.ai_utils import call_ai

# Redundant API helpers removed as they are in ai_utils

def analyze_learner(responses):
    """
    Analyzes 20 survey responses and generates a 20-40 word learner profile.
    """
    # Format responses for the prompt to allow the AI to understand user preferences
    formatted_responses = ""
    for idx, resp in enumerate(responses, 1):
        q_text = resp.get('questionText', 'N/A')
        # selectedOptionsText is an array according to the model
        a_texts = resp.get('selectedOptionsText', [])
        a_text = ", ".join(a_texts) if isinstance(a_texts, list) else str(a_texts)
        formatted_responses += f"Q{idx}: {q_text}\nAnswer: {a_text}\n\n"

    prompt = f"""You are an expert educational psychologist and programming tutor. 
Analyze the following 20 survey responses from a new student to determine their unique learning profile.

SURVEY RESPONSES:
{formatted_responses}

TASK:
1. Determine the student's learning style breakdown (reading/writing, kinesthetic/hands-on, mixed).
2. Identify if they are primarily one style or a hybrid learner.
3. Provide a comprehensive summary (between 100 and 150 words) describing their learning personality.
4. The summary should explain:
   - Their primary learning style and percentage
   - Any significant secondary preferences 
   - How Sparkle AI will adapt to their specific needs
   - Specific teaching strategies that work best for them

OUTPUT RULES:
- Word count: 100 to 150 words exactly.
- Write in second person ("You are...")
- Be specific about adaptation strategies
- NO markdown, NO bullet points, NO extra formatting
- JUST the summary string.

Example: "You are primarily a reading-oriented learner with strong kinesthetic tendencies. You excel when concepts are explained through detailed written examples followed by hands-on practice. Sparkle AI will provide comprehensive text-based explanations with clear code examples, then offer interactive coding exercises to reinforce your understanding. You benefit from structured documentation and real-world problems that let you apply theory immediately. Your learning is most effective when you can read about a concept in depth, then experiment with it through practical implementation. Sparkle AI will balance detailed written breakdowns with opportunities for hands-on exploration and experimentation."
"""

    try:
        # Fetch the specific key for the profile agent from .env
        profile_key = os.getenv("profile_agent")
        
        # Generate summary using Gemini/OpenRouter with the specific key
        text = call_ai(prompt, api_key=profile_key)
        if not text:
            print("[Profile] Warning: AI failed, using fallback summary")
            return "Your neural profile is being processed. Feel free to start learning, and I'll adapt as we go! ⚡"
        # Basic cleanup in case AI includes quotes or extra whitespace
        return text.replace('"', '').strip()
    except Exception as e:
        return f"Error analyzing profile: {str(e)}"

if __name__ == "__main__":
    import sys
    import io
    
    # Set UTF-8 encoding for Windows console
    if sys.platform == 'win32':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')
    
    if len(sys.argv) < 2:
        print("Usage: python profile_agent.py '<responses_json>'")
        sys.exit(1)
    
    try:
        # The first argument should be a JSON string of the responses array
        responses_json = sys.argv[1]
        responses_data = json.loads(responses_json)
        summary = analyze_learner(responses_data)
        print(summary)
    except Exception as e:
        print(f"Error in Profile Agent: {str(e)}")
