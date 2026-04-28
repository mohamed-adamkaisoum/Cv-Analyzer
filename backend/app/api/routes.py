import os
import shutil

from fastapi import APIRouter, File, UploadFile

#from app.services.pipeline import run_analysis
from backend.app.services.pipeline import run_analysis
router = APIRouter()


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