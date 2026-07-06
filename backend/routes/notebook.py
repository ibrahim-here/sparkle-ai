from fastapi import APIRouter, HTTPException, UploadFile, File, Depends, Form
from pydantic import BaseModel
from database import get_database
from utils.auth import get_current_user
from utils.notebook_utils import process_and_embed_file
from Agents.notebook_agent import get_notebook_response
from schemas.chat_schemas import ChatMessage, ChatSession
from datetime import datetime
import os
import shutil
import uuid
import tempfile

router = APIRouter(prefix="/api/notebook", tags=["notebook"])

class NotebookQuery(BaseModel):
    query: str
    sessionId: str

@router.get("/sessions")
async def get_notebook_sessions(current_user: dict = Depends(get_current_user)):
    """Get all notebook sessions for the current user"""
    db = get_database()
    sessions = await db.chat_sessions.find(
        {"userId": current_user["_id"], "session_type": "notebook"}
    ).sort("updatedAt", -1).to_list(100)
    
    # Clean up _id for frontend
    processed_sessions = []
    for s in sessions:
        s["id"] = s.pop("_id")
        processed_sessions.append(s)
    
    return {"success": True, "data": processed_sessions}

@router.post("/upload/{session_id}")
async def upload_notebook_file(
    session_id: str, 
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    
    # Verify session ownership
    session = await db.chat_sessions.find_one({"_id": session_id, "userId": current_user["_id"], "session_type": "notebook"})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    try:
        # Create temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name
            
        # Process and Embed
        success, message = await process_and_embed_file(session_id, tmp_path, file.filename)
        
        # Cleanup temp file
        os.remove(tmp_path)
        
        if not success:
            raise HTTPException(status_code=500, detail=f"Processing failed: {message}")
            
        # Update Session Record
        await db.chat_sessions.update_one(
            {"_id": session_id},
            {
                "$push": {"uploaded_files": file.filename},
                "$set": {"updatedAt": datetime.now()}
            }
        )
        
        return {"success": True, "message": f"Successfully uploaded and indexed {file.filename}"}
        
    except Exception as e:
        print(f"[Notebook API] Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chat")
async def chat_notebook(
    query_req: NotebookQuery, 
    current_user: dict = Depends(get_current_user)
):
    db = get_database()
    session_id = query_req.sessionId
    
    # 1. Verify Session
    session = await db.chat_sessions.find_one({"_id": session_id, "userId": current_user["_id"], "session_type": "notebook"})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    # 2. Get AI Response (Strict) - now returns dict with response and citations
    ai_result = get_notebook_response(session_id, query_req.query)
    
    # 3. Persist Messages
    user_msg = ChatMessage(role="user", content=query_req.query)
    assistant_msg = ChatMessage(role="assistant", content=ai_result["response"])
    
    await db.chat_sessions.update_one(
        {"_id": session_id},
        {
            "$push": {"messages": {"$each": [user_msg.model_dump(), assistant_msg.model_dump()]}},
            "$set": {"updatedAt": datetime.now()}
        }
    )
    
    return {
        "success": True, 
        "data": {
            "response": ai_result["response"],
            "citations": ai_result["citations"],
            "sessionId": session_id
        }
    }

@router.get("/sessions/{session_id}")
async def get_notebook_session(session_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific notebook session with messages and uploaded files"""
    db = get_database()
    session = await db.chat_sessions.find_one({"_id": session_id, "userId": current_user["_id"], "session_type": "notebook"})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "success": True, 
        "data": {
            "messages": session.get("messages", []),
            "uploaded_files": session.get("uploaded_files", []),
            "title": session.get("title", "Untitled Session")
        }
    }
