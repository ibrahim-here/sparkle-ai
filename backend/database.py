import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URI")
DATABASE_NAME = "sparkle-ai"

client = None
db = None

async def connect_to_mongo():
    global client, db
    if client is None:
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        print("Connected to MongoDB")

async def close_mongo_connection():
    global client
    if client:
        client.close()
        print("Disconnected from MongoDB")

def get_database():
    return db
