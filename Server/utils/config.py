

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
		self.ALLOWED_ORIGINS = [
			f"http://{self.UI_HOST}:{self.UI_PORT}",
			f"https://{self.UI_HOST}:{self.UI_PORT}",
			# Electron origins
			"http://localhost:5173",
			"https://localhost:5173",
			"file://",
			"app://",
			# For development
			"http://localhost:3000",
			"https://localhost:3000",
		]

# Export a single config object
config = Config()

