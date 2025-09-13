from fastapi import APIRouter
from .conversation_router import router as conversation_router
from utils import config

router = APIRouter(prefix=config.BACKEND_API_ENDPOINT)

router.include_router(conversation_router, prefix="/chat", tags=["Conversation"])


__all__ = ["router"]
