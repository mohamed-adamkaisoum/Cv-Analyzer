import re
import unicodedata

from app.llm.client import generate_text
from app.llm.prompts import (
    build_cover_letter_prompt,
    build_feedback_prompt,
)
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
