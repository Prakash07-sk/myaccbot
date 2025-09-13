from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from Schema.conversation_schema import ConversationHistoryPayload


router = APIRouter()

@router.post("/")
async def chat(payload: ConversationHistoryPayload):
    # Implement your logic here
    return "success to receiveyour message"