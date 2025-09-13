

import os
from dotenv import load_dotenv

class Config:
	def __init__(self):
		# Load .env file from the project root
		load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))
		print("Loaded .env file", os.path.join(os.path.dirname(__file__), '../../.env'))
		# Backend config
		self.BACKEND_HOST = os.getenv('VITE_BACKEND_HOST', '0.0.0.0')
		self.BACKEND_PORT = int(os.getenv('VITE_BACKEND_PORT', 4000))
		self.BACKEND_API_ENDPOINT = os.getenv('VITE_BACKEND_API_ENDPOINT', '/api')

		# UI config
		self.UI_PORT = int(os.getenv('VITE_UI_PORT', 5173))
		self.UI_HOST = os.getenv('VITE_UI_HOST', 'localhost')

		# Allowed origins for CORS
		# Always allow all origins for now to fix Electron CORS issues
		self.ALLOWED_ORIGINS = ["*"]
		print(f"Backend running on: {self.BACKEND_HOST}:{self.BACKEND_PORT}")
		print(f"CORS allowed origins: {self.ALLOWED_ORIGINS}")

# Export a single config object
config = Config()

