from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException, Depends  # type: ignore
from fastapi.responses import FileResponse  # type: ignore
from dotenv import load_dotenv  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from motor.motor_asyncio import AsyncIOMotorClient  # type: ignore
import os
import logging
from pathlib import Path
from routes import router as portfolio_router
from auth import get_current_user
import shutil
import uvicorn  # type: ignore

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / 'uploads'
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'portfolio_db')]

# Create the main app without a prefix
app = FastAPI(title="Portfolio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check route
@api_router.get("/")
async def root():
    return {"message": "Portfolio API is running", "status": "healthy"}

# File upload routes
@api_router.post("/upload/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    # Save file
    file_path = UPLOAD_DIR / "resume.pdf"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update portfolio info with resume URL
    await db.portfolio_info.update_one(
        {},
        {"$set": {"resumeUrl": "/api/upload/resume"}}
    )
    
    return {"url": "/api/upload/resume", "message": "Resume uploaded successfully"}

@api_router.get("/upload/resume")
async def get_resume():
    file_path = UPLOAD_DIR / "resume.pdf"
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename="Azma_Banu_Resume.pdf"
    )

# Include portfolio routes
api_router.include_router(portfolio_router, tags=["Portfolio"])

# Include the router in the main app
app.include_router(api_router)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
