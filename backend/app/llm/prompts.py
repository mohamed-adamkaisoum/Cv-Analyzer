# backend/app/llm/prompts.py

from app.schemas import CVProfile


# ==============================
# COVER LETTER PROMPT
# ==============================

def build_cover_letter_prompt(cv: CVProfile, job_title: str) -> str:
    return f"""
Tu es un recruteur professionnel.

Rédige une lettre de motivation courte, claire et naturelle.

Contraintes :
- Maximum 150 mots
- Ton humain (pas robotique)
- Pas de phrases génériques
- Met en avant les compétences clés et l'expérience
- Structure simple : intro / compétences / conclusion

Données candidat :
Nom: {cv.nom}
Expérience: {cv.annees_experience} ans
Niveau: {cv.niveau}
Compétences: {", ".join(cv.competences)}

Poste visé :
{job_title}

Lettre :
"""


# ==============================
# FEEDBACK PROMPT
# ==============================

def build_feedback_prompt(cv: CVProfile) -> str:
    return f"""
Tu es un recruteur senior.

Analyse ce CV et donne un feedback structuré.

Répond STRICTEMENT sous ce format :

Points forts :
- ...
- ...

Points faibles :
- ...
- ...

Améliorations :
- ...
- ...

Contraintes :
- Maximum 120 mots
- Pas de texte inutile
- Sois précis et concret
- Pas de phrases vagues

Données :
Compétences: {", ".join(cv.competences)}
Expérience: {cv.annees_experience} ans
Niveau: {cv.niveau}
Score ATS: {cv.ats_score}
"""