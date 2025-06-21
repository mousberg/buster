# Status Checker Service

This FastAPI service integrates with ElevenLabs voice agents to track call statuses in MongoDB.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Configure environment:
Create a `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017
# For production, use your actual MongoDB connection string
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ayman?retryWrites=true&w=majority
```

3. Run the service:
```bash
python main.py
```

The service will run on port 8001.

## API Endpoints

### Add Status
POST `/add-status`

Request body:
```json
{
    "call_id": "string",
    "status": "string",
    "timestamp": "2024-03-21T12:00:00Z", // optional
    "metadata": {} // optional
}
```

### Get Status
GET `/status/{call_id}`

Returns the latest status for a given call ID.

## Docker

Build and run with Docker:
```bash
docker build -t status-checker .
docker run -p 8001:8001 -e MONGODB_URI=your_mongodb_uri status-checker
```

## Integration with ElevenLabs

To use this as a tool in your ElevenLabs agent:

1. Add a webhook tool in your agent configuration
2. Set the webhook URL to `http://your-service:8001/add-status`
3. Use POST method
4. The agent can call this tool to update call status
