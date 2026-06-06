import re

from app.ml.ats_scorer import compute_ats_score
from app.ml.skill_detector import extract_skills
from app.nlp.extractor import extract
from app.nlp.parser import parse_cv
from app.schemas import CVProfile


def _parse_experience_years(experience: str) -> int:
    if not experience:
        return 0
    match = re.search(r"(\d+)", experience)
    return int(match.group(1)) if match else 0


def _infer_level(years: int) -> str:
    if years >= 5:
        return "Senior"
    if years >= 2:
        return "Mid"
    return "Junior"


def _build_profile(text: str, parsed: dict, skills: list[str], ats: dict) -> CVProfile:
    years = _parse_experience_years(parsed.get("experience", "0"))

    return CVProfile(
        nom=parsed.get("name") or "Candidat",
        email=parsed.get("email"),
        telephone=parsed.get("telephone") or parsed.get("phone"),
        competences=skills or parsed.get("skills", []),
        annees_experience=years,
        niveau=_infer_level(years),
        ats_score=float(ats.get("score", 0)),
        texte_brut=text,
    )


def build_cv_profile_from_file(file_path: str) -> CVProfile:
    ext = file_path.rsplit(".", 1)[-1].lower()
    text = extract(file_path, ext)
    parsed = parse_cv(text)
    skills = extract_skills(text)
    ats = compute_ats_score(text, parsed_data=parsed)

    return _build_profile(text, parsed, skills, ats)


def analyze_cv_scores_from_file(file_path: str) -> dict:
    ext = file_path.rsplit(".", 1)[-1].lower()
    text = extract(file_path, ext)
    parsed = parse_cv(text)
    skills = extract_skills(text)
    ats = compute_ats_score(text, parsed_data=parsed, check_grammar=False)
    cv_profile = _build_profile(text, parsed, skills, ats)

    return {
        "cv_profile": cv_profile.model_dump(),
        "ats": ats,
        "skills": cv_profile.competences,
    }
