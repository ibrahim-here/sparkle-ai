import os
import sys
import json
from utils.ai_utils import call_ai

def get_casual_response(query, learner_profile=None):
    """
    Handles simple greetings, identity questions, and casual chat.
    Does not use the vector database to save resources.
    """
    
    prompt = f"""You are Sparkle AI, an interactive learning assistant specifically built to teach Programming Fundamentals (PF) / C++.
The user is engaging in casual chat, greetings, or asking general questions.

[User Query]: "{query}"

🎯 YOUR INSTRUCTIONS:
1. Briefly introduce yourself as Sparkle AI, an interactive Programming Fundamentals tutor.
2. If the user asks about a topic OTHER than Programming Fundamentals (PF) or C++, politely inform them that you are exclusively trained for PF/C++ and cannot assist with other subjects.
3. If the user asks to "visualize", "draw", or "show a diagram" of anything, explicitly tell them to navigate to "Visualize Mode" utilizing the sidebar to generate interactive logic diagrams.
4. Keep the response friendly, conversational, and relatively concise.

Provide your response now:"""

    response = call_ai(prompt, temperature=0.5)
    if not response:
        return "Hello! I'm Sparkle AI. How can I help you with your C++ learning today?"
    
    return response.strip()

if __name__ == "__main__":
    # Test mode
    test_query = "who are you?"
    print(get_casual_response(test_query))
