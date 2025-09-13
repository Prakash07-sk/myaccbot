from fastapi import APIRouter
from .conversation_router import router as conversation_router
from .source_dir_router import router as source_dir_router
from utils import config

router = APIRouter(prefix=config.BACKEND_API_ENDPOINT)

router.include_router(conversation_router, prefix="/chat", tags=["Conversation"])
router.include_router(source_dir_router, prefix="/source", tags=["Source Dir"])

__all__ = ["router"]
