
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .exception_handling import add_exception_handlers
from .success_response import SuccessResponseMiddleware
from utils import config

def middleware(app: FastAPI):
	# Skip CORS middleware - handled in main.py
	print(f"CORS Configuration - Allowed Origins: {config.ALLOWED_ORIGINS}")
	print("CORS middleware disabled - using custom bypass in main.py")
	
	# Temporarily disable SuccessResponse middleware to fix Content-Length issue
	# app.add_middleware(SuccessResponseMiddleware)
	print("SuccessResponse middleware temporarily disabled")
	
	# Add global exception handlers
	add_exception_handlers(app)
