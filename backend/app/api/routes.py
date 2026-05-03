import os
import shutil

from fastapi import APIRouter, File, UploadFile

from app.api.user_routes import router as auth_router
from app.services.pipeline import run_analysis
from app.api import user_routes, cv_routes # Import your new file
router = APIRouter()
router.include_router(cv_routes.router) # Add this line
router.include_router(auth_router)


@router.get("/health")
def health():
    return {"status": "ok"}

UPLOAD_DIR = "uploads"


@router.post("/analyze")
async def analyze(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = run_analysis(file_path)
    return result
