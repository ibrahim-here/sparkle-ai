import sys
import json
import os
from dotenv import load_dotenv
import requests

# Load environment
load_dotenv()

# OpenRouter API Configuration
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
PRIMARY_MODEL = "meta-llama/llama-3.2-3b-instruct:free"
PRIMARY_MODEL = "meta-llama/llama-3.2-3b-instruct:free"

# Load API keys
PRIMARY_API_KEY = os.getenv("profile_agent") or os.getenv("embedings")

def call_openrouter_api(prompt, model, api_key, temperature=0.3, max_tokens=1000):
    """Call OpenRouter API with specified model"""
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://github.com/sparkle-ai",
            "X-Title": "Sparkle AI - Profile Agent"
        }
        
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        response = requests.post(OPENROUTER_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
        
    except Exception as e:
        print(f"API Error: {e}")
        return None

def generate_with_fallback(prompt):
    """
    Generate content using the primary model.
    """
    result = call_openrouter_api(prompt, PRIMARY_MODEL, PRIMARY_API_KEY)
    if result: 
        return result
    
    raise Exception(f"Primary model {PRIMARY_MODEL} failed to generate response")

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
2. Calculate approximate percentages for each learning style based on their answers.
3. Identify if they are primarily one style or a hybrid learner.
4. Provide a comprehensive summary (between 100 and 150 words) describing their learning personality.
5. The summary should explain:
   - Their primary learning style and percentage
   - Any significant secondary preferences (if above 25%)
   - How Sparkle AI will adapt to their specific needs
   - Specific teaching strategies that work best for them

OUTPUT RULES:
- Word count: 100 to 150 words exactly.
- Write in second person ("You are...")
- Include percentage estimates in the summary (e.g., "You are 60% reading-oriented...")
- Be specific about adaptation strategies
- NO markdown, NO bullet points, NO extra formatting
- JUST the summary string.

Example: "You are primarily a reading-oriented learner (60%) with strong kinesthetic tendencies (30%). You excel when concepts are explained through detailed written examples followed by hands-on practice. Sparkle AI will provide comprehensive text-based explanations with clear code examples, then offer interactive coding exercises to reinforce your understanding. You benefit from structured documentation and real-world problems that let you apply theory immediately. Your learning is most effective when you can read about a concept in depth, then experiment with it through practical implementation. Sparkle AI will balance detailed written breakdowns with opportunities for hands-on exploration and experimentation."
"""

    try:
        # Generate summary using OpenRouter with fallback
        text = generate_with_fallback(prompt)
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
