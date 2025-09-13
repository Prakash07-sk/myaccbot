import asyncio
from database.chroma_setup_database import add_folder
from fastapi.responses import JSONResponse

class SourceDirController:
    def __init__(self):
        pass
    
    async def browse_drive(self, payload):
        try:
            result = await add_folder(payload.path)
            response = {
                "message": "Added to the database",
                "files_processed": result["files_processed"],
                "chunks_added": result["chunks_added"]
            }
            return  response
        except Exception as e:
            return {"error": str(e)}

    def google_drive(self, payload):
        try:
            # You can add your logic here to process the payload for Google Drive
            return "google_drive success"
        except Exception as e:
            raise Exception(f"An error occurred in google_drive: {str(e)}")

source_dir_controller = SourceDirController()

