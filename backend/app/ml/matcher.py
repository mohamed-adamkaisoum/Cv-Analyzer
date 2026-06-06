import re
import unicodedata
from typing import Dict, List

from sklearn.metrics.pairwise import cosine_similarity

from app.ml.job_fetcher import get_job_offers
from app.ml.skill_detector import extract_skills
from app.nlp.embedding_engine import encode, encode_batch


GENERIC_SKILLS = {
    "communication",
    "leadership",
    "problem solving",
    "project management",
    "agile",
    "scrum",
}


def _normalize_text(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", value).strip().lower()


def _clean_skills(skills: List[str]) -> List[str]:
    clean = []
    seen = set()
    for skill in skills or []:
        normalized = _normalize_text(skill)
        if not normalized or normalized.startswith("aucune competence"):
            continue
        if normalized in seen:
            continue
        seen.add(normalized)
        clean.append(skill.strip())
    return clean


def _contains_skill(text: str, skill: str) -> bool:
    normalized_text = f" {_normalize_text(text)} "
    normalized_skill = _normalize_text(skill)
    return re.search(
        rf"(?<![a-z0-9+#.]){re.escape(normalized_skill)}(?![a-z0-9+#.])",
        normalized_text,
    ) is not None


def _extract_skills_from_text(text: str, skill_list: List[str]) -> List[str]:
    """Return which CV skills appear in the job text or detected job skills."""
    detected_job_skills = {
        _normalize_text(skill)
        for skill in _clean_skills(extract_skills(text))
    }

    matches = []
    for skill in _clean_skills(skill_list):
        normalized = _normalize_text(skill)
        if normalized in detected_job_skills or _contains_skill(text, skill):
            matches.append(skill)
    return matches


def _build_adzuna_queries(cv_skills: List[str], cv_text: str, top_n: int, job_title: str = "") -> List[str]:
    skills = [
        skill for skill in _clean_skills(cv_skills)
        if _normalize_text(skill) not in GENERIC_SKILLS
    ]
    priority = skills[:8] or _clean_skills(cv_skills)[:8]
    queries = []

    if len(priority) >= 2:
        queries.append(" ".join(priority[:2]))
    if len(priority) >= 3:
        queries.append(" ".join(priority[:3]))
    queries.extend(priority)
    if job_title.strip() and priority:
        queries.extend(f"{job_title.strip()} {skill}" for skill in priority[:3])
    if job_title.strip():
        queries.append(job_title.strip())

    # Fallback compact si l'extraction de competences est trop faible.
    if not queries and cv_text:
        queries.append(" ".join(cv_text.split()[:8]))

    seen = set()
    unique_queries = []
    for query in queries:
        key = _normalize_text(query)
        if key and key not in seen:
            seen.add(key)
            unique_queries.append(query)
    return unique_queries[: max(top_n + 3, 8)]


def match_cv_to_jobs(
    cv_text: str,
    cv_skills: List[str] = [],
    job_title: str = "",
    source: str = "dataset",
    top_n: int = 10,
) -> List[Dict]:
    """
    Match a CV with real or local jobs using detected skills plus semantic similarity.
    """
    cleaned_skills = _clean_skills(cv_skills)
    keywords = (
        _build_adzuna_queries(cleaned_skills, cv_text, top_n, job_title)
        if source == "api"
        else " ".join(cleaned_skills)
    )
    fetch_limit = max(top_n * 4, 20)
    jobs = get_job_offers(source=source, keywords=keywords, limit=fetch_limit)

    if not jobs:
        return []

    cv_signal_text = f"{cv_text}\n\nCompetences detectees: {' '.join(cleaned_skills)}"
    cv_vector = encode(cv_signal_text).reshape(1, -1)

    job_descriptions = [
        " ".join([
            job.get("titre_poste", ""),
            job.get("entreprise", ""),
            job.get("description", ""),
        ]).strip()
        for job in jobs
    ]
    job_vectors = encode_batch(job_descriptions)
    semantic_scores = cosine_similarity(cv_vector, job_vectors)[0]

    ranked_jobs = []
    skill_denominator = max(min(len(cleaned_skills), 6), 1)
    for idx, job in enumerate(jobs):
        job_text = job_descriptions[idx]
        matching_skills = _extract_skills_from_text(job_text, cleaned_skills)
        skill_score = min(len(matching_skills) / skill_denominator, 1.0)
        semantic_score = max(float(semantic_scores[idx]), 0.0)
        final_score = (semantic_score * 0.55) + (skill_score * 0.45)
        ranked_jobs.append((final_score, semantic_score, matching_skills, idx))

    ranked_jobs.sort(key=lambda item: item[0], reverse=True)

    results = []
    for final_score, semantic_score, matching_skills, idx in ranked_jobs[:top_n]:
        job = jobs[idx]
        job_text = job_descriptions[idx]
        job_skills = _clean_skills(extract_skills(job_text))
        cv_skill_keys = {_normalize_text(skill) for skill in cleaned_skills}
        missing_skills = [
            skill for skill in job_skills
            if _normalize_text(skill) not in cv_skill_keys
        ][:8]

        results.append({
            "titre_poste": job["titre_poste"],
            "entreprise": job["entreprise"],
            "score": round(final_score, 4),
            "semantic_score": round(semantic_score, 4),
            "top_skills_match": matching_skills,
            "competences_manquantes": missing_skills,
            "url": job.get("url", ""),
            "location": job.get("location", ""),
            "salary_min": job.get("salary_min"),
            "salary_max": job.get("salary_max"),
            "contract_time": job.get("contract_time", ""),
            "category": job.get("category", ""),
            "created": job.get("created", ""),
        })

    return results
