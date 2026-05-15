import os
import shutil

from fastapi import APIRouter, File, UploadFile
from app.ml.skill_detector import extract_skills_from_file
from app.ml.ats_scorer import compute_ats_score, extract_text
from app.services.pipeline import run_analysis

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


@router.post("/extract-skills")
async def extract_skills_api(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    ext = file.filename.split(".")[-1].lower()
    skills = extract_skills_from_file(file_path, ext)

    return {
        "filename": file.filename,
        "skills": skills
    }

@router.post("/ats-score")
async def ats_score(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    text = extract_text(file_path)
    result = compute_ats_score(text)

    return result