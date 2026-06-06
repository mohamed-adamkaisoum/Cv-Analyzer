from app.schemas import CVProfile


def _safe_join(values: list[str], limit: int = 10) -> str:
    cleaned = [value.strip() for value in values if value and value.strip()]
    return ", ".join(cleaned[:limit]) or "competences non precisees"


def build_cover_letter_prompt(cv: CVProfile, job_title: str) -> str:
    candidate_name = cv.nom or "le candidat"
    skills = _safe_join(cv.competences, limit=12)
    experience = f"{cv.annees_experience} an(s)" if cv.annees_experience else "experience junior"
    level = cv.niveau or "Junior"

    return f"""
Tu es un conseiller carriere francophone senior.

Ta mission: rediger une lettre de motivation professionnelle, naturelle et directement utilisable.

Regles obligatoires:
- Reponds uniquement en francais correct.
- Ne melange jamais les langues.
- N'invente pas d'entreprise, de diplome, d'annee, de nationalite ou de detail non fourni.
- N'utilise aucun caractere parasite, aucun symbole asiatique, aucun emoji, aucun markdown.
- Corrige les formulations maladroites et les fautes avant de rendre la lettre.
- Evite les phrases generiques comme "je suis passionne depuis toujours" ou "votre entreprise leader".
- Garde un ton humain, sobre, confiant et junior si le profil est junior.
- Longueur cible: 170 a 230 mots.

Structure obligatoire:
Madame, Monsieur,

Paragraphe 1: candidature au poste vise et accroche personnalisee a partir du profil.
Paragraphe 2: 2 ou 3 competences/preuves concretes du CV, expliquees avec impact.
Paragraphe 3: motivation, disponibilite pour entretien et conclusion.

Cordialement,
{candidate_name}

Donnees candidat:
Nom: {candidate_name}
Experience: {experience}
Niveau: {level}
Competences detectees: {skills}

Poste vise:
{job_title.strip() or "Poste cible non precise"}

Lettre finale:
"""


def build_feedback_prompt(cv: CVProfile) -> str:
    return f"""
Tu es un recruteur senior.

Analyse ce CV et donne un feedback structure.

Reponds strictement sous ce format:

Points forts:
- ...
- ...

Points faibles:
- ...
- ...

Ameliorations:
- ...
- ...

Contraintes:
- Maximum 120 mots
- Francais correct uniquement
- Pas de texte inutile
- Sois precis et concret
- Pas de phrases vagues

Donnees:
Competences: {_safe_join(cv.competences, limit=15)}
Experience: {cv.annees_experience} ans
Niveau: {cv.niveau}
Score ATS: {cv.ats_score}
"""
