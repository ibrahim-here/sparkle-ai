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
from Agents.graph import run_sparkle_graph

router = APIRouter(prefix="/api/chat", tags=["chat"])

class ChatQuery(BaseModel):
    query: str
    sessionId: Optional[str] = None
    manualStyle: Optional[str] = None

# run_agent_script is now redundant as we use the LangGraph app directly

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
        # Unified Step: Run the LangGraph orchestration
        print("\n⚡ EXECUTING SPARKLE AI GRAPH")
        learning_style = current_user.get("learning_style", {}) # Assuming dict
        # Priority: Use specifically requested style from UI, or fall back to user's database preference
        active_manual_style = chat_query.manualStyle or current_user.get("manualLearningStyle")
        
        # Note: If history is needed, fetch previous messages here
        graph_result = await run_sparkle_graph(
            query=chat_query.query,
            learner_summary=learner_summary,
            learning_style=learning_style,
            manual_style=active_manual_style
        )
        
        enhanced_prompt = graph_result["enhanced_prompt"]
        selected_agent = graph_result["selected_agent"]
        response_text = graph_result["response"]
        
        print(f"\n✨ ENHANCED PROMPT: {enhanced_prompt}")
        print(f"🎯 SELECTED AGENT: {selected_agent}")
        print(f"🤖 RESPONSE GENERATED")
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
        {"userId": current_user["_id"], "session_type": "chat"}  # Only return regular chat sessions
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
        session_type=req.session_type or "chat",
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
