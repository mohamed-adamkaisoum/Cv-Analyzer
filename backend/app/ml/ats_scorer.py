#hna khass n7essbu score ats dial cv , 9elebou ela chnahowa score ats w kifach t9edru tcalculiwh fhad lprojet mohim score ykun ela 100
import re
from app.nlp.parser import parse_cv
import language_tool_python
from collections import Counter
from spacy.lang.fr.stop_words import STOP_WORDS

from app.nlp.extractor import extract_text_from_pdf
from app.nlp.extractor import extract_text_from_docx
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
tool = language_tool_python.LanguageTool('fr')
def score_quality(text, feedback):
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
    try:
        matches = tool.check(text)

        if len(matches) < 5:
            score += 10
        elif len(matches) < 15:
            score += 5
            feedback.append("Quelques fautes d’orthographe")
        else:
            feedback.append("Beaucoup de fautes d’orthographe")
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

def extract_text(file_path):
    if file_path.endswith(".pdf"):
        return extract_text_from_pdf(file_path)
    elif file_path.endswith(".docx"):
        return extract_text_from_docx(file_path)
    else:
        raise ValueError("Format non supporté")
    
def compute_ats_score(text):
    data = parse_cv(text)
    feedback = []

    scores = {}

    scores["parsing"] = score_parsing(data, feedback)
    scores["quality"] = score_quality(text, feedback)
    scores["ats_compatibility"] = score_ats_compatibility(text, data, feedback)

    total_score = sum(scores.values())

    return {
        "score": round(total_score, 2),
        "details": scores,
        "feedback": list(set(feedback))
        }