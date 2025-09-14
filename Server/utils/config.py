

import os
import sys
from dotenv import load_dotenv

class Config:
	def __init__(self):
		# Determine the correct path to .env file for both development and PyInstaller builds
		if getattr(sys, 'frozen', False) and hasattr(sys, '_MEIPASS'):
			# Running in PyInstaller bundle
			# Look for .env in the same directory as the executable
			executable_dir = os.path.dirname(sys.executable)
			env_path = os.path.join(executable_dir, '.env')
			
			# If not found, try the parent directory (project root)
			if not os.path.exists(env_path):
				env_path = os.path.join(executable_dir, '..', '.env')
			
			# If still not found, try the current working directory
			if not os.path.exists(env_path):
				env_path = os.path.join(os.getcwd(), '.env')
		else:
			# Running in development mode
			env_path = os.path.join(os.path.dirname(__file__), '../../.env')
		
		# Load the .env file
		load_dotenv(env_path)
		print("Loaded .env file", env_path)
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

