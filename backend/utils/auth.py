from fastapi import Security, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.security import decode_access_token
from database import get_database

from bson import ObjectId

security = HTTPBearer()

async def get_current_user(auth: HTTPAuthorizationCredentials = Security(security)):
    payload = decode_access_token(auth.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    db = get_database()
    
    # Try find by string ID (new) or ObjectId (existing from Mongoose)
    user = await db.users.find_one({"_id": user_id})
    if not user:
        try:
            user = await db.users.find_one({"_id": ObjectId(user_id)})
        except:
            pass

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    
    return user
