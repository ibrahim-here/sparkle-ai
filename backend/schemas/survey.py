from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class QuestionResponse(BaseModel):
    questionId: str
    questionText: Optional[str] = None
    selectedOptions: List[str]
    selectedOptionsText: Optional[List[str]] = None

class SurveySubmission(BaseModel):
    responses: List[QuestionResponse]

class SurveyResponseDB(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    userId: str
    responses: List[QuestionResponse]
    calculatedStyle: Dict[str, float]
    completedAt: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
