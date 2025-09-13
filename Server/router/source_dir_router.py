from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from Schema.source_dir_schema import RoutePathPayload
from Controller import source_dir_controller


router = APIRouter()

@router.post("/device")
async def device(payload: RoutePathPayload):
    # Implement your logic here
    result = await source_dir_controller.browse_drive(payload)
    return JSONResponse(content=result)

@router.post("/google_drive")
async def google_drive(payload: RoutePathPayload):
    # Implement your logic here
    return source_dir_controller.google_drive(payload)