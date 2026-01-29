import os
import sys
import json
from utils.ai_utils import call_ai

def get_casual_response(query, learner_profile=None):
    """
    Handles simple greetings, identity questions, and casual chat.
    Does not use the vector database to save resources.
    """
    
    prompt = f"""You are Sparkle AI, a friendly and supportive programming tutor.
The user is engaging in casual chat or a greeting.

[User Query]: "{query}"

🎯 YOUR TASK:
- Respond in a friendly, conversational way.
- Briefly mention that you are ready to help them with C++ programming whenever they have a concept to explore.
- Keep it concise (1-2 sentences).
- If they ask who you are, explain you are an AI tutor personalized to their learning style.

Provide your response now:"""

    response = call_ai(prompt, temperature=0.5)
    if not response:
        return "Hello! I'm Sparkle AI. How can I help you with your C++ learning today?"
    
    return response.strip()

if __name__ == "__main__":
    # Test mode
    test_query = "who are you?"
    print(get_casual_response(test_query))
