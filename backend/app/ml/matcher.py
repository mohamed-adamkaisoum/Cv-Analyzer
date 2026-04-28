# hada howa fen ghanchedu cv dial l'user w ncompariwh l des offres reelles flewel khedmu gher ela des offres statiques 
# w htal mn b3d w nchoufou chi api dial les offres reelles w n integriwha 

from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict
from app.nlp.embedding_engine import encode, encode_batch
from app.ml.job_fetcher import get_job_offers


def _extract_skills_from_text(text: str, skill_list: List[str]) -> List[str]:
    """Return which skills from skill_list appear in the text."""
    text_lower = text.lower()
    return [s for s in skill_list if s.lower() in text_lower]


def match_cv_to_jobs(
    cv_text: str,
    cv_skills: List[str] = [],
    source: str = "dataset",   # "dataset" or "api"
    top_n: int = 10,
) -> List[Dict]:
    """
    Main matching function.
    
    - cv_text   : raw text extracted from the CV
    - cv_skills : list of skills already detected (e.g. ['Python', 'SQL'])
    - source    : where to get job offers from ("dataset" or "api")
    - top_n     : how many top matches to return
    
    Returns a list of dicts sorted by similarity score (highest first).
    """

    # 1. Get job offers (from dataset or API)
    keywords = " ".join(cv_skills) if cv_skills else cv_text[:200]
    jobs = get_job_offers(source=source, keywords=keywords)

    if not jobs:
        return []

    # 2. Encode the CV into a vector
    cv_vector = encode(cv_text).reshape(1, -1)

    # 3. Encode all job descriptions into vectors (batch = faster)
    job_descriptions = [job["description"] for job in jobs]
    job_vectors = encode_batch(job_descriptions)

    # 4. Calculate cosine similarity between CV and each job
    scores = cosine_similarity(cv_vector, job_vectors)[0]  # shape: (n_jobs,)

    # 5. Sort jobs by score and take top N
    ranked_indices = scores.argsort()[::-1][:top_n]

    # 6. Build the result list
    results = []
    for idx in ranked_indices:
        job = jobs[idx]
        score = float(scores[idx])
        job_text = job["description"]

        # Which of the CV skills appear in this job offer?
        matching_skills = _extract_skills_from_text(job_text, cv_skills)

        # Which skills are in the job but NOT in the CV?
        # (simple keyword approach — will be improved with skill_detector)
        missing_skills = [
            s for s in cv_skills
            if s.lower() not in cv_text.lower() and s.lower() in job_text.lower()
        ]

        results.append({
            "titre_poste": job["titre_poste"],
            "entreprise": job["entreprise"],
            "score": round(score, 4),
            "top_skills_match": matching_skills,
            "competences_manquantes": missing_skills,
        })

    return results