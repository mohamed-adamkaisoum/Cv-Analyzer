import re
import unicodedata

from app.llm.client import generate_text
from app.llm.prompts import (
    build_cover_letter_prompt,
    build_feedback_prompt,
    build_analysis_feedback_prompt,
    build_rework_cv_prompt,
    build_learning_path_prompt,
)
import json
from app.schemas import CVProfile


_CJK_RE = re.compile(r"[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]+")
_LABEL_RE = re.compile(r"^\s*(lettre finale|lettre de motivation|objet)\s*:?\s*$", re.I)


def clean_response(text: str) -> str:
    if not text:
        return ""

    text = unicodedata.normalize("NFKC", text)
    text = text.replace("\ufeff", "")
    text = text.replace("\u00ad", "")
    text = text.replace("\u200b", "")
    text = text.replace("\u202f", " ")
    text = _CJK_RE.sub("", text)
    text = re.sub(r"```(?:\w+)?|```", "", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r" *\n *", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    lines = [
        line.strip()
        for line in text.strip().splitlines()
        if line.strip() and not _LABEL_RE.match(line)
    ]
    return "\n".join(lines).strip()


def generate_cover_letter(cv: CVProfile, job_title: str) -> str:
    prompt = build_cover_letter_prompt(cv, job_title)

    try:
        response = generate_text(prompt)
        return clean_response(response)

    except Exception as e:
        return f"Erreur generation lettre: {str(e)}"


def generate_feedback(cv: CVProfile) -> str:
    prompt = build_feedback_prompt(cv)

    try:
        response = generate_text(prompt)
        return clean_response(response)

    except Exception as e:
        return f"Erreur generation feedback: {str(e)}"


def generate_analysis_feedback(cv: CVProfile, detailed_metrics: list[dict]) -> dict:
    """Generate structured strengths and weaknesses using the LLM.
    Returns {"strengths": [...], "weaknesses": [...]}."""
    prompt = build_analysis_feedback_prompt(cv, detailed_metrics)

    try:
        response = generate_text(prompt)
        cleaned = clean_response(response)
        return _parse_analysis_feedback(cleaned)
    except Exception as e:
        return {
            "strengths": [f"Analysis completed with ATS score of {cv.ats_score}%"],
            "weaknesses": [f"Error generating detailed feedback: {str(e)}"],
        }


def generate_reworked_cv(cv: CVProfile) -> str:
    """Generate a fully optimized CV in Markdown format using the LLM."""
    prompt = build_rework_cv_prompt(cv)

    try:
        response = generate_text(prompt)
        return clean_response(response)
    except Exception as e:
        return f"Error generating optimized CV: {str(e)}"


def _parse_analysis_feedback(text: str) -> dict:
    """Parse the structured LLM response into strengths and weaknesses lists."""
    strengths = []
    weaknesses = []

    current_section = None
    for line in text.strip().splitlines():
        line = line.strip()
        if not line:
            continue

        upper = line.upper()
        if "STRENGTH" in upper and ":" in line and len(line) < 25:
            current_section = "strengths"
            continue
        elif "WEAKNESS" in upper and ":" in line and len(line) < 30:
            current_section = "weaknesses"
            continue
        elif "AREA" in upper and "IMPROVEMENT" in upper:
            current_section = "weaknesses"
            continue

        # Remove leading numbering like "1. " or "- "
        cleaned_line = re.sub(r'^\d+\.\s*', '', line)
        cleaned_line = re.sub(r'^[-•]\s*', '', cleaned_line)
        cleaned_line = cleaned_line.strip()

        if not cleaned_line:
            continue

        if current_section == "strengths":
            strengths.append(cleaned_line)
        elif current_section == "weaknesses":
            weaknesses.append(cleaned_line)

    # Fallback if parsing failed
    if not strengths:
        strengths = ["Valid document structure parsed successfully by the ATS scanner."]
    if not weaknesses:
        weaknesses = ["Consider enriching your CV with more quantified achievements."]

    return {
        "strengths": strengths[:4],
        "weaknesses": weaknesses[:4],
    }


def generate_learning_paths(missing_skills: list[str]) -> list[dict]:
    """Generate free course recommendations for missing skills."""
    if not missing_skills:
        return []

    prompt = build_learning_path_prompt(missing_skills)

    try:
        response = generate_text(prompt)
        cleaned = clean_response(response)
        
        # Attempt to extract JSON array
        start_idx = cleaned.find('[')
        end_idx = cleaned.rfind(']')
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            json_str = cleaned[start_idx:end_idx+1]
            return json.loads(json_str)
        return []
    except Exception as e:
        print(f"Error generating learning paths: {e}")
        return []

