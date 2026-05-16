from app.llm.generator import generate_cover_letter, generate_feedback
from app.services.cv_profile_builder import build_cv_profile_from_file


def run_analysis(file_path: str, job_title: str = "Poste ciblé"):
    cv_profile = build_cv_profile_from_file(file_path)

    lettre_motivation = generate_cover_letter(cv_profile, job_title)
    feedback = generate_feedback(cv_profile)

    return {
        "cv_profile": cv_profile.model_dump(),
        "lettre_motivation": lettre_motivation,
        "feedback": feedback,
    }
