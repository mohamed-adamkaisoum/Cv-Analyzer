import os
import shutil

from fastapi import APIRouter, File, Form, UploadFile
from app.ml.skill_detector import extract_skills_from_file
from app.ml.ats_scorer import compute_ats_score, extract_text
from app.ml.matcher import match_cv_to_jobs
from app.nlp.extractor import extract
from app.llm.generator import generate_cover_letter, generate_feedback
from app.services.cv_profile_builder import analyze_cv_scores_from_file, build_cv_profile_from_file
from app.services.pipeline import run_analysis

router = APIRouter()


@router.get("/health")
def health():
    return {"status": "ok"}

UPLOAD_DIR = "uploads"


def save_upload(file: UploadFile) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    return file_path


@router.post("/analyze")
async def analyze(
    file: UploadFile = File(...),
    job_title: str = Form("Poste ciblé"),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return run_analysis(file_path, job_title=job_title)


@router.post("/analyze-scores")
async def analyze_scores(file: UploadFile = File(...)):
    file_path = save_upload(file)
    result = analyze_cv_scores_from_file(file_path)

    return {
        "filename": file.filename,
        **result,
    }


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


@router.post("/match-jobs")
async def match_jobs(
    file: UploadFile = File(...),
    source: str = "api",
    top_n: int = 5,
    job_title: str = "",
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    ext = file.filename.split(".")[-1].lower()
    cv_text = extract(file_path, ext)
    skills = extract_skills_from_file(file_path, ext)
    matches = match_cv_to_jobs(
        cv_text=cv_text,
        cv_skills=skills,
        job_title=job_title,
        source=source,
        top_n=top_n,
    )

    return {
        "filename": file.filename,
        "skills": skills,
        "matches": matches,
    }


@router.post("/generate-feedback")
async def generate_feedback_api(file: UploadFile = File(...)):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cv_profile = build_cv_profile_from_file(file_path)
    feedback = generate_feedback(cv_profile)

    return {
        "filename": file.filename,
        "cv_profile": cv_profile.model_dump(),
        "feedback": feedback,
    }


@router.post("/generate-cover-letter")
async def generate_cover_letter_api(
    file: UploadFile = File(...),
    job_title: str = Form(...),
):
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    cv_profile = build_cv_profile_from_file(file_path)
    letter = generate_cover_letter(cv_profile, job_title)

    return {
        "filename": file.filename,
        "job_title": job_title,
        "cv_profile": cv_profile.model_dump(),
        "lettre_motivation": letter,
    }
