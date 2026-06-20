#hna khass n7essbu score ats dial cv , 9elebou ela chnahowa score ats w kifach t9edru tcalculiwh fhad lprojet mohim score ykun ela 100
import re
from app.nlp.parser import parse_cv
import language_tool_python
from collections import Counter
from spacy.lang.fr.stop_words import STOP_WORDS

from app.nlp.extractor import extract_text_from_pdf
from app.nlp.extractor import extract_text_from_docx

# ══════════════════════════════════════════════════════════════
# Sub-score functions (raw points)
# ══════════════════════════════════════════════════════════════

#40pts
def score_parsing(data, feedback):
    score = 0

    if data.get("name") and data["name"] != "Unknown User":
        score += 10
    else:
        feedback.append("Nom non détecté correctement")

    if data.get("email"):
        score += 10
    else:
        feedback.append("Email manquant")

    if data.get("skills") and data["skills"] != ["Aucune compétence trouvée"]:
        score += 10
    else:
        feedback.append("Compétences non détectées")

    if data.get("experience") and data["experience"] != "0 ans":
        score += 10
    else:
        feedback.append("Expérience non détectée")

    return score



# 30 pts
tool = None


def get_language_tool():
    global tool
    if tool is None:
        tool = language_tool_python.LanguageTool('fr')
    return tool


def score_quality(text, feedback, check_grammar=True):
    score = 0

    #  Quantification (10 pts)
    numbers = re.findall(r"\d+", text)
    if len(numbers) >= 5:
        score += 10
    elif len(numbers) >= 2:
        score += 5
        feedback.append("Ajoutez plus de résultats chiffrés (ex: +30%)")
    else:
        feedback.append("Aucun impact chiffré détecté")

    #  Répétition (10 pts)
    words = re.findall(r'\b\w+\b', text.lower())
    filtered_words = [w for w in words if w not in STOP_WORDS]

    if filtered_words:
       counts = Counter(filtered_words)

       total_words = len(filtered_words)
       unique_words = len(counts)

       unique_ratio = unique_words / total_words

       most_common_word, freq = counts.most_common(1)[0]
    else:
     unique_ratio = 0
     freq = 0
#=============
    if unique_ratio > 0.7 and freq <= 5:
        score += 10
    elif unique_ratio > 0.5 or freq <= 8:
        score += 5
        feedback.append("Légère répétition de certains mots")
    else:
        score += 0
        feedback.append("Beaucoup de répétitions détectées")

    #  Orthographe (10 pts)
    if not check_grammar:
        score += 5
        feedback.append("Verification orthographique disponible en analyse detaillee")
        return score

    try:
        matches = get_language_tool().check(text)

        if len(matches) < 5:
            score += 10
        elif len(matches) < 15:
            score += 5
            feedback.append("Quelques fautes d'orthographe")
        else:
            feedback.append("Beaucoup de fautes d'orthographe")
    except:
        score += 5
        feedback.append("Vérification orthographique non disponible")

    return score



# 30 pts
def score_ats_compatibility(text, data, feedback):
    score = 0

    #  Design simple (10 pts)
    symbols = re.findall(r"[^\w\s]", text)
    if len(symbols) < 50:
        score += 10
    else:
        score += 5
        feedback.append("Design trop complexe pour ATS")

    #  Email professionnel (10 pts)
    email = data.get("email", "")
    if email:
        if any(domain in email for domain in ["gmail", "outlook", "yahoo"]):
            score += 10
        else:
            score += 5
            feedback.append("Email non standard")
    else:
        feedback.append("Email manquant")

    #  Liens (10 pts)
    links = re.findall(r"https?://", text)
    if len(links) >= 1:
        score += 10
    else:
        feedback.append("Ajoutez des liens (LinkedIn, portfolio)")

    return score


# ══════════════════════════════════════════════════════════════
# NEW: Keyword Alignment score (real computation)
# ══════════════════════════════════════════════════════════════

ACTION_VERBS = [
    "developed", "engineered", "designed", "implemented", "managed",
    "optimized", "created", "built", "led", "delivered", "analyzed",
    "improved", "automated", "deployed", "integrated", "maintained",
    "configured", "coordinated", "supervised", "trained",
    "développé", "conçu", "géré", "optimisé", "créé", "construit",
    "dirigé", "livré", "analysé", "amélioré", "automatisé", "déployé",
    "intégré", "maintenu", "configuré", "coordonné", "supervisé", "formé",
    "réalisé", "mis en place", "participé", "contribué",
]

SECTION_HEADERS = [
    "experience", "formation", "education", "compétences", "skills",
    "projets", "projects", "certifications", "langues", "languages",
    "objectif", "objective", "summary", "profil", "profile", "références",
    "references", "intérêts", "interests", "activités", "activities",
    "bénévolat", "volunteer", "réalisations", "achievements",
    "publications", "awards", "prix",
]


def score_keyword_alignment(text, data, feedback):
    """Score keyword alignment based on real analysis of skill density,
    action verb usage, and section keyword coverage. Returns 0-100."""
    score = 0
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text_lower)
    total_words = len(words) if words else 1

    # --- Skill density (40 pts of 100) ---
    skills = data.get("skills", [])
    if isinstance(skills, list) and skills and skills != ["Aucune compétence trouvée"]:
        num_skills = len(skills)
        skill_mentions = 0
        for skill in skills:
            skill_mentions += text_lower.count(skill.lower())

        skill_density = skill_mentions / total_words * 100

        if num_skills >= 10 and skill_density > 1.5:
            score += 40
        elif num_skills >= 7 and skill_density > 1.0:
            score += 32
        elif num_skills >= 5 and skill_density > 0.5:
            score += 24
        elif num_skills >= 3:
            score += 16
            feedback.append("Add more relevant technical skills to improve keyword density")
        else:
            score += 8
            feedback.append("Very few skills detected — enrich your skills section")
    else:
        feedback.append("No skills detected — add a clear skills/competencies section")

    # --- Action verb usage (30 pts of 100) ---
    verb_count = sum(1 for verb in ACTION_VERBS if verb in text_lower)
    if verb_count >= 8:
        score += 30
    elif verb_count >= 5:
        score += 22
    elif verb_count >= 3:
        score += 14
    elif verb_count >= 1:
        score += 8
        feedback.append("Use more action verbs (e.g., 'developed', 'engineered', 'optimized')")
    else:
        feedback.append("No action verbs detected — start bullet points with strong verbs")

    # --- Section structure keywords (30 pts of 100) ---
    section_count = sum(1 for header in SECTION_HEADERS if header in text_lower)
    if section_count >= 6:
        score += 30
    elif section_count >= 4:
        score += 22
    elif section_count >= 2:
        score += 14
        feedback.append("Add more standard CV sections (e.g., Education, Projects, Certifications)")
    else:
        score += 6
        feedback.append("CV lacks standard section headers — add Experience, Skills, Education sections")

    return min(score, 100)


# ══════════════════════════════════════════════════════════════
# NEW: Readability score (real computation)
# ══════════════════════════════════════════════════════════════

def score_readability(text, data, feedback):
    """Score readability based on sentence length, paragraph structure,
    text density, and ATS compatibility. Returns 0-100."""
    score = 0
    text_lower = text.lower()

    # --- Sentence length analysis (25 pts) ---
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 5]
    if sentences:
        avg_words = sum(len(s.split()) for s in sentences) / len(sentences)
        if 8 <= avg_words <= 20:
            score += 25
        elif 5 <= avg_words <= 25:
            score += 18
        elif avg_words < 5:
            score += 10
            feedback.append("Sentences are too short — add more descriptive content")
        else:
            score += 8
            feedback.append("Sentences are too long — break them into shorter, clearer points")
    else:
        score += 5

    # --- Text density / length (25 pts) ---
    word_count = len(re.findall(r'\b\w+\b', text))
    if 300 <= word_count <= 900:
        score += 25
    elif 200 <= word_count <= 1200:
        score += 18
    elif word_count < 200:
        score += 8
        feedback.append("CV is too short — expand your experience descriptions")
    else:
        score += 12
        feedback.append("CV is very long — consider condensing to most relevant content")

    # --- ATS design simplicity (25 pts) ---
    symbols = re.findall(r"[^\w\s]", text)
    symbol_ratio = len(symbols) / max(word_count, 1)
    if symbol_ratio < 0.15:
        score += 25
    elif symbol_ratio < 0.3:
        score += 18
    else:
        score += 8
        feedback.append("Too many special characters — simplify formatting for ATS scanners")

    # --- Professional links & contact (25 pts) ---
    link_score = 0
    email = data.get("email", "")
    if email:
        if any(domain in email for domain in ["gmail", "outlook", "yahoo", "hotmail"]):
            link_score += 10
        else:
            link_score += 5
    links = re.findall(r"https?://", text)
    if len(links) >= 2:
        link_score += 15
    elif len(links) >= 1:
        link_score += 10
    else:
        feedback.append("Add professional links (LinkedIn, GitHub, portfolio)")
    score += min(link_score, 25)

    return min(score, 100)


def extract_text(file_path):
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Format non supporté")


def compute_ats_score(text, parsed_data=None, check_grammar=True):
    data = parsed_data or parse_cv(text)
    feedback = []

    scores = {}

    scores["parsing"] = score_parsing(data, feedback)
    scores["quality"] = score_quality(text, feedback, check_grammar=check_grammar)
    scores["ats_compatibility"] = score_ats_compatibility(text, data, feedback)

    total_score = sum(scores.values())

    # Compute the 4 detailed metrics (each normalized to 0-100)
    keyword_feedback = []
    readability_feedback = []
    keyword_score = score_keyword_alignment(text, data, keyword_feedback)
    readability_score = score_readability(text, data, readability_feedback)

    detailed_metrics = [
        {
            "label": "Impact & Phrasing",
            "value": min(round((scores["quality"] / 30) * 100), 100),
            "description": "Measures quantified results, vocabulary richness, and spelling quality"
        },
        {
            "label": "Formatting & Structure",
            "value": min(round((scores["parsing"] / 40) * 100), 100),
            "description": "Evaluates contact info completeness, section organization, and parsability"
        },
        {
            "label": "Keyword Alignment",
            "value": keyword_score,
            "description": "Analyzes skill keyword density, action verb usage, and section coverage"
        },
        {
            "label": "Readability Rating",
            "value": readability_score,
            "description": "Assesses sentence clarity, text density, formatting simplicity, and links"
        },
    ]

    # Merge extra feedback from keyword and readability analysis
    all_feedback = list(set(feedback + keyword_feedback + readability_feedback))

    return {
        "score": round(total_score, 2),
        "details": scores,
        "detailed_metrics": detailed_metrics,
        "feedback": all_feedback,
    }
