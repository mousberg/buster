from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Call Status Checker")

# MongoDB connection
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = MongoClient(MONGODB_URI)
db = client.Ayman  # Using 'Ayman' as the database name
calls_collection = db.calls  # Collection for storing call statuses

class CallStatus(BaseModel):
    call_id: str
    status: str
    timestamp: datetime = None
    metadata: dict = None

@app.post("/add-status")
async def add_status(status: CallStatus):
    try:
        # Add current timestamp if not provided
        if not status.call_id:
            status.call_id = str('unspecified')

        if not status.timestamp:
            status.timestamp = datetime.utcnow()

        # Insert the status into MongoDB
        result = calls_collection.insert_one(status.dict())

        return {
            "message": "Status added successfully",
            "status_id": str(result.inserted_id)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{call_id}")
async def get_status(call_id: str):
    try:
        # Find all statuses for the given call_id, sorted by timestamp descending
        cursor = calls_collection.find(
            {"call_id": call_id}
        ).sort("timestamp", -1)

        # Convert cursor to list and handle ObjectId serialization
        statuses = []
        for status in cursor:
            status["_id"] = str(status["_id"])
            statuses.append(status)

        if not statuses:
            raise HTTPException(status_code=404, detail="No statuses found for this call ID")

        return statuses
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
