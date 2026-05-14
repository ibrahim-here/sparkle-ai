from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from utils.auth import get_current_user
from Agents.visualizer_agent import orchestrate_visualizer

router = APIRouter(prefix="/api/visualizer", tags=["visualizer"])

class VisualizerQuery(BaseModel):
    query: str

@router.post("/generate")
async def generate_visualization(chat_query: VisualizerQuery, current_user: dict = Depends(get_current_user)):
    try:
        print(f"\n🎨 EXECUTING VISUALIZER AGENT for: {chat_query.query}")
        result = await orchestrate_visualizer(chat_query.query)
        
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "Visualization failed"))
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ VISUALIZER ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")
