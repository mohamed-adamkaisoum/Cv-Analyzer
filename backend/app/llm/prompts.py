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


def build_analysis_feedback_prompt(cv: CVProfile, detailed_metrics: list[dict]) -> str:
    """Build a prompt for the LLM to generate structured strengths and weaknesses
    based on the real ATS analysis data, with highly actionable before/after examples."""
    candidate_name = cv.nom or "Candidate"
    skills = _safe_join(cv.competences, limit=15)
    experience = f"{cv.annees_experience} years" if cv.annees_experience else "junior/entry level"
    level = cv.niveau or "Junior"

    metrics_text = ""
    for m in detailed_metrics:
        metrics_text += f"- {m['label']}: {m['value']}% — {m['description']}\n"

    return f"""You are a senior career advisor and CV expert.

Analyze the following CV data and provide EXACTLY 3 key strengths and EXACTLY 3 areas for improvement.

Rules:
- Write in English only.
- Each point must be specific and actionable — reference the actual scores and skills provided.
- Each strength should start with a plain text category label followed by a colon, then the explanation with advice on how to highlight it (e.g. 'Skill Set: Your expertise in Python and SQL is a major asset; showcase it at the top of your experiences.').
- Each weakness (area for improvement) should start with a plain text category label followed by a colon, then give a highly actionable, direct instruction to improve their CV, including a specific Before/After example using actual content found in their CV raw text.
- For weaknesses, follow this exact structure: '[Category]: [Action instruction]. Instead of "[Vague/passive phrase from CV]", use "[Improved, quantified/action-oriented phrase]".'
- Do NOT use markdown formatting, asterisks (**), or special symbols.
- Keep each point to 1-2 sentences maximum.
- Be concrete — mention specific skills, scores, or metrics when relevant.

Respond ONLY in this exact format (no extra text before or after):

STRENGTHS:
1. [Category]: [Specific strength with advice]
2. [Category]: [Specific strength with advice]
3. [Category]: [Specific strength with advice]

WEAKNESSES:
1. [Category]: [Action instruction]. Instead of "[Vague/passive phrase]", use "[Quantified, action-oriented phrase]".
2. [Category]: [Action instruction]. Instead of "[Vague/passive phrase]", use "[Quantified, action-oriented phrase]".
3. [Category]: [Action instruction]. Instead of "[Vague/passive phrase]", use "[Quantified, action-oriented phrase]".

Candidate Data:
Name: {candidate_name}
Experience: {experience}
Level: {level}
Detected Skills: {skills}
ATS Score: {cv.ats_score}/100

Detailed Metrics:
{metrics_text}

Raw CV Content:
\"\"\"
{cv.texte_brut}
\"\"\"
"""


def build_rework_cv_prompt(cv: CVProfile) -> str:
    """Build a prompt for the LLM to rewrite and optimize the entire CV."""
    candidate_name = cv.nom or "Candidate"
    skills = _safe_join(cv.competences, limit=15)
    experience = f"{cv.annees_experience} years" if cv.annees_experience else "junior/entry level"
    level = cv.niveau or "Junior"

    return f"""You are a senior executive CV writer and ATS optimization expert.

Your mission is to rewrite the candidate's CV to make it 100% professional, impact-driven, and highly ATS-optimized. 

Rules:
1. Preserve all real factual information (companies, dates, degrees, contact information, skills). Do NOT invent new degrees, employers, or dates.
2. Rewrite all work experience descriptions to use strong action verbs and quantified results (use the XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]). If specific metrics aren't in the original text, estimate realistic/common industry metrics to illustrate how they should look (e.g., "improved efficiency by 15%", "managed 5+ client accounts").
3. Improve the formatting and readability structure. Organize content into clear sections: Professional Summary, Core Skills, Professional Experience, Education, and Certifications.
4. Output the rewritten CV in the SAME language as the original CV (e.g., if the raw CV text is in French, output the optimized CV in French. If it is in English, output in English).
5. Output ONLY the rewritten CV in clean, standard Markdown format. Do NOT include any introductory or concluding remarks (e.g., do not say "Here is your optimized CV:").
6. Use markdown headers (e.g., # Name, ## Professional Experience), bold tags, and clear bullet points for maximum parsability and premium visual look.

Candidate Data:
Name: {candidate_name}
Email: {cv.email or "Not provided"}
Phone: {cv.telephone or "Not provided"}
Experience Level: {level} ({experience})
Detected Skills: {skills}

Raw CV Content:
\"\"\"
{cv.texte_brut}
\"\"\"

Optimized CV (Markdown):
"""


def build_learning_path_prompt(missing_skills: list[str]) -> str:
    """Build a prompt for the LLM to generate free course recommendations for a list of skills."""
    skills_str = ", ".join(missing_skills)

    return f"""You are a technical career advisor and mentor.
For the following list of skills: {skills_str}, provide EXACTLY one free, high-quality course or tutorial recommendation per skill.

Respond ONLY with a JSON list under this exact structure:
[
  {{
    "skill": "Skill Name",
    "platform": "YouTube / Coursera / freeCodeCamp / edX",
    "title": "Exact Course or Tutorial Name",
    "link": "Direct search or access URL"
  }}
]

Rules:
1. Provide one entry per skill in the list.
2. Prefer popular free learning platforms (like YouTube tutorials from freeCodeCamp, Coursera courses that can be audited for free, etc.).
3. For links, construct direct search URLs that are guaranteed to work (e.g. 'https://www.youtube.com/results?search_query=freecodecamp+react+tutorial' or 'https://www.coursera.org/search?query=docker').
4. The output must be valid JSON and ONLY valid JSON. Do not write any markdown code fences, headers, or explanations before or after the JSON string.
"""

