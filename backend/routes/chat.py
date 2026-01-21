from fastapi import APIRouter, HTTPException, Request, status, Depends
from pydantic import BaseModel
from database import get_database
from utils.agent_router import select_agent
from Agents.profile_agent import analyze_learner
import json
import os
import subprocess
import sys
from typing import List, Optional
from datetime import datetime
import uuid
from schemas.chat_schemas import ChatMessage, ChatSession, CreateSessionRequest
from utils.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatQuery(BaseModel):
    query: str
    sessionId: Optional[str] = None

async def run_agent_script(script_name: str, query: str, profile: str):
    script_path = os.path.join("Agents", script_name)
    python_path = sys.executable  # Use current venv python
    
    input_data = json.dumps({"query": query, "profile": profile})
    
    # Run agent as subprocess (as in the original JS version)
    process = subprocess.Popen(
        [python_path, script_path, input_data],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        encoding='utf-8'
    )
    
    stdout, stderr = process.communicate()
    
    if process.returncode != 0:
        print(f"Agent Error: {stderr}")
        raise Exception(f"Agent {script_name} failed: {stderr}")
    
    return stdout

@router.post("/query")
async def handle_query(chat_query: ChatQuery, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    print("\n" + "="*50)
    print(f"📥 NEW QUERY RECEIVED")
    print(f"User: {current_user.get('name')} ({current_user.get('email')})")
    print(f"Query: {chat_query.query}")
    print(f"Session: {chat_query.sessionId or 'NEW'}")
    print("="*50)

    learner_summary = current_user.get("learnerTypeSummary", "")
    session_id = chat_query.sessionId

    try:
        # Step 1: Call Planner Agent to enhance user input
        print("\n✨ STEP 1: ENHANCING INPUT (Planner Agent)")
        enhanced_prompt = await run_agent_script(
            "planner_agent.py", 
            chat_query.query, 
            learner_summary
        )
        enhanced_prompt = enhanced_prompt.strip()
        
        print("\n" + "-"*30 + " ENHANCED PROMPT " + "-"*30)
        print(enhanced_prompt)
        print("-" * 77)

        # Step 2: Decide the most matching agent
        print("\n🎯 STEP 2: AGENT ROUTING")
        learning_style = current_user.get("learningStyle", {})
        manual_style = current_user.get("manualLearningStyle")
        selected_agent = select_agent(learning_style, manual_style)
        print(f"   Selected Path: {selected_agent}")

        # Step 3: Run the selected agent with the enhanced prompt
        print(f"\n🤖 STEP 3: EXECUTING {selected_agent.upper()}")
        print(f"   Generating personalized response...")
        response = await run_agent_script(
            selected_agent, 
            enhanced_prompt, 
            learner_summary
        )
        response_text = response.strip()
        
        print("\n✅ PROCESS COMPLETE - RESPONSE GENERATED")
        print("="*50 + "\n")

        # Persistence Logic
        user_msg = ChatMessage(role="user", content=chat_query.query)
        assistant_msg = ChatMessage(role="assistant", content=response_text)

        if not session_id:
            # Create a new session automatically if not provided
            session_id = str(uuid.uuid4())
            new_session = ChatSession(
                _id=session_id,
                userId=current_user["_id"],
                title=chat_query.query[:40] + ("..." if len(chat_query.query) > 40 else ""),
                messages=[user_msg, assistant_msg]
            )
            await db.chat_sessions.insert_one(new_session.model_dump(by_alias=True))
        else:
            # Update existing session
            await db.chat_sessions.update_one(
                {"_id": session_id, "userId": current_user["_id"]},
                {
                    "$push": {"messages": {"$each": [user_msg.model_dump(), assistant_msg.model_dump()]}},
                    "$set": {"updatedAt": datetime.now()}
                }
            )

        return {
            "success": True,
            "data": {
                "sessionId": session_id,
                "query": chat_query.query,
                "enhancedPrompt": enhanced_prompt,
                "agent": selected_agent,
                "response": response_text
            }
        }
    except Exception as e:
        print(f"\n❌ ERROR IN CHAT PROCESS: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/sessions")
async def get_sessions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    sessions = await db.chat_sessions.find(
        {"userId": current_user["_id"]}
    ).sort("updatedAt", -1).to_list(100)
    
    # Clean up _id for frontend
    processed_sessions = []
    for s in sessions:
        s["id"] = s.pop("_id")
        processed_sessions.append(s)
    
    return {"success": True, "data": processed_sessions}

@router.post("/sessions")
async def create_session(req: CreateSessionRequest, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session_id = str(uuid.uuid4())
    new_session = ChatSession(
        _id=session_id,
        userId=current_user["_id"],
        title=req.title or "New Conversation",
        messages=[]
    )
    await db.chat_sessions.insert_one(new_session.model_dump(by_alias=True))
    return {"success": True, "data": {"id": session_id, "title": new_session.title}}

@router.get("/sessions/{sessionId}")
async def get_session_messages(sessionId: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    session = await db.chat_sessions.find_one({"_id": sessionId, "userId": current_user["_id"]})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"success": True, "data": session["messages"]}

@router.delete("/sessions/{sessionId}")
async def delete_session(sessionId: str, current_user: dict = Depends(get_current_user)):
    db = get_database()
    result = await db.chat_sessions.delete_one({"_id": sessionId, "userId": current_user["_id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"success": True}
