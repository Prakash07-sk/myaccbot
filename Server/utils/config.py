

import os
from dotenv import load_dotenv

class Config:
	def __init__(self):
		# Load .env file from the project root
		load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

		# Backend config
		self.BACKEND_HOST = os.getenv('BACKEND_HOST', '0.0.0.0')
		self.BACKEND_PORT = int(os.getenv('BACKEND_PORT', os.getenv('PORT', 8000)))

		# UI config
		self.UI_PORT = int(os.getenv('UI_PORT', 5173))
		self.UI_HOST = os.getenv('UI_HOST', 'localhost')

		# Allowed origins for CORS
		self.ALLOWED_ORIGINS = [
			f"http://{self.UI_HOST}:{self.UI_PORT}",
			f"https://{self.UI_HOST}:{self.UI_PORT}"
		]

# Export a single config object
config = Config()

