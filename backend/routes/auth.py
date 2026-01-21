from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from schemas.user import UserCreate, UserResponse, UserDB, AuthProvider
from database import get_database
from utils.security import get_password_hash, verify_password, create_access_token
from utils.auth import get_current_user
from datetime import datetime
import uuid

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/signup", response_model=dict, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate):
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )
    
    # Create new user
    new_user_dict = user_data.model_dump()
    new_user_dict["password"] = get_password_hash(user_data.password)
    new_user_dict["_id"] = str(uuid.uuid4())
    new_user_dict["createdAt"] = datetime.now()
    new_user_dict["updatedAt"] = datetime.now()
    new_user_dict["lastLogin"] = datetime.now()
    
    await db.users.insert_one(new_user_dict)
    
    # Generate Token
    token = create_access_token(data={"sub": str(new_user_dict["_id"]), "email": new_user_dict["email"]})
    
    return {
        "success": True,
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": str(new_user_dict["_id"]),
            "email": new_user_dict["email"],
            "name": new_user_dict["name"],
            "profilePicture": new_user_dict.get("profilePicture"),
            "authProvider": new_user_dict["authProvider"],
            "learnerTypeSummary": new_user_dict.get("learnerTypeSummary", ""),
            "manualLearningStyle": new_user_dict.get("manualLearningStyle")
        }
    }

@router.post("/login", response_model=dict)
async def login(login_data: dict):
    email = login_data.get("email")
    password = login_data.get("password")
    
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    if user.get("authProvider") != AuthProvider.LOCAL or not user.get("password"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please sign in with Google"
        )
    
    if not verify_password(password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Update last login
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"lastLogin": datetime.now()}}
    )
    
    token = create_access_token(data={"sub": str(user["_id"]), "email": user["email"]})
    
    return {
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "profilePicture": user.get("profilePicture"),
            "authProvider": user["authProvider"],
            "learnerTypeSummary": user.get("learnerTypeSummary", ""),
            "manualLearningStyle": user.get("manualLearningStyle")
        }
    }

@router.get("/me", response_model=dict)
async def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "success": True,
        "user": {
            "id": str(current_user["_id"]),
            "email": current_user["email"],
            "name": current_user["name"],
            "profilePicture": current_user.get("profilePicture"),
            "authProvider": current_user["authProvider"],
            "createdAt": current_user.get("createdAt"),
            "lastLogin": current_user.get("lastLogin"),
            "learnerTypeSummary": current_user.get("learnerTypeSummary", ""),
            "manualLearningStyle": current_user.get("manualLearningStyle"),
            "learningStyle": current_user.get("learningStyle")
        }
    }

@router.put("/profile", response_model=dict)
async def update_profile(profile_data: dict, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    update_fields = {}
    if "name" in profile_data:
        update_fields["name"] = profile_data["name"]
    if "manualLearningStyle" in profile_data:
        update_fields["manualLearningStyle"] = profile_data["manualLearningStyle"]
    
    if update_fields:
        update_fields["updatedAt"] = datetime.now()
        await db.users.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_fields}
        )
        # Fetch updated user
        current_user = await db.users.find_one({"_id": current_user["_id"]})

    return {
        "success": True,
        "message": "Profile updated successfully",
        "user": {
            "id": str(current_user["_id"]),
            "email": current_user["email"],
            "name": current_user["name"],
            "profilePicture": current_user.get("profilePicture"),
            "authProvider": current_user["authProvider"],
            "learnerTypeSummary": current_user.get("learnerTypeSummary", ""),
            "manualLearningStyle": current_user.get("manualLearningStyle"),
            "learningStyle": current_user.get("learningStyle")
        }
    }

@router.post("/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}
