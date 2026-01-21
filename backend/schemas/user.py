from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict
from datetime import datetime
from enum import Enum

class AuthProvider(str, Enum):
    LOCAL = "local"
    GOOGLE = "google"

class LearningStyle(BaseModel):
    visual: float = 0
    reading: float = 0
    kinesthetic: float = 0

class UserBase(BaseModel):
    email: EmailStr
    name: str
    profilePicture: Optional[str] = None
    authProvider: AuthProvider = AuthProvider.LOCAL
    onboardingCompleted: bool = False
    learningStyle: Optional[LearningStyle] = Field(default_factory=LearningStyle)
    learnerTypeSummary: str = ""
    manualLearningStyle: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserDB(UserBase):
    id: Optional[str] = Field(None, alias="_id")
    password: Optional[str] = None
    lastLogin: datetime = Field(default_factory=datetime.now)
    createdAt: datetime = Field(default_factory=datetime.now)
    updatedAt: datetime = Field(default_factory=datetime.now)

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    profilePicture: Optional[str] = None
    authProvider: AuthProvider
    onboardingCompleted: bool
    learningStyle: Optional[LearningStyle]
    learnerTypeSummary: str
    manualLearningStyle: Optional[str] = None

    class Config:
        from_attributes = True
