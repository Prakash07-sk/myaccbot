from fastapi import FastAPI
import uvicorn

# Import all submodules for initialization
from Controller import *

from middleware import middleware

from utils import *
from utils import config, SuccessResponse

# Import only the router object from router/router.py
from router import router as main_router

app = FastAPI()


# Add all middleware (CORS, SuccessResponse, Exception Handlers)
middleware(app)

# Include the router from the router folder
app.include_router(main_router)


@app.get("/")
def read_root():
    resp = SuccessResponse(data=None, message="Welcome to MyACCOBot FastAPI server!")
    return resp.dict()

if __name__ == "__main__":
    uvicorn.run("main:app", host=config.BACKEND_HOST, port=config.BACKEND_PORT, reload=True)
