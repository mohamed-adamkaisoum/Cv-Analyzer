# backend/app/llm/generator.py

from app.llm.client import generate_text
from app.llm.prompts import (
    build_cover_letter_prompt,
    build_feedback_prompt
)
from app.schemas import CVProfile

def clean_response(text: str) -> str:
    if not text:
        return ""

    # Nettoyage basique
    text = text.strip()

    # Supprimer répétitions possibles
    text = text.replace("\n\n\n", "\n\n")

    return text

def generate_cover_letter(cv: CVProfile, job_title: str) -> str:
    prompt = build_cover_letter_prompt(cv, job_title)

    try:
        response = generate_text(prompt)
        return clean_response(response)

    except Exception as e:
        return f"Erreur génération lettre: {str(e)}"


def generate_feedback(cv: CVProfile) -> str:
    prompt = build_feedback_prompt(cv)

    try:
        response = generate_text(prompt)
        return clean_response(response)

    except Exception as e:
        return f"Erreur génération feedback: {str(e)}"