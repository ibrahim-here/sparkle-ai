from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str
    timestamp: datetime = Field(default_factory=datetime.now)

class ChatSession(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    userId: str
    title: str
    messages: List[ChatMessage] = []
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True

class CreateSessionRequest(BaseModel):
    title: Optional[str] = "New Conversation"
