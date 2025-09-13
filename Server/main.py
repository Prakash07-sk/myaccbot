from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Import all submodules for initialization
from Controller import *

from middleware import middleware

from utils import *
from utils import config, SuccessResponse

# Import only the router object from router/router.py
from router import router as main_router

app = FastAPI()

# Add comprehensive CORS middleware first
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Add all other middleware (SuccessResponse, Exception Handlers)
middleware(app)

# Include the router from the router folder
app.include_router(main_router)


@app.get("/")
def read_root():
    resp = SuccessResponse(data=None, message="Welcome to MyACCOBot FastAPI server!")
    return resp.dict()

@app.get("/health")
def health_check():
    """Simple health check endpoint"""
    return {"status": "ok", "message": "Server is running"}

@app.get("/api/test")
def api_test():
    """Test API endpoint"""
    return {"message": "API test successful"}

@app.post("/api/test")
def api_test_post():
    """Test API POST endpoint"""
    return {"message": "API POST test successful"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.BACKEND_HOST, port=config.BACKEND_PORT, reload=True)
