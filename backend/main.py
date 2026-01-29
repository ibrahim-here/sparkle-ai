from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import auth, onboarding, chat, notebook
from database import connect_to_mongo, close_mongo_connection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(
    title="Sparkle AI API",
    description="Futuristic AI-powered learning platform backend",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
origins = os.getenv("FRONTEND_URL", "http://localhost:5173,http://localhost:5175").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(onboarding.router)
app.include_router(chat.router)
app.include_router(notebook.router)

@app.get("/")
async def root():
    return {
        "status": "OK",
        "message": "Sparkle AI Backend API (FastAPI)",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    return {"status": "OK", "message": "Server is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 5000)), reload=True)






