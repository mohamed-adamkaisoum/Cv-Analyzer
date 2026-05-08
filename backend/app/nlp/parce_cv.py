import re
import spacy
import geonamescache
from difflib import get_close_matches
import sys
import os
import geonamescache
gc = geonamescache.GeonamesCache()


cities = {c['name'].lower(): c['name'] for c in gc.get_cities().values()}
countries = {c['name'].lower(): c['name'] for c in gc.get_countries().values()}

ALL_PLACES = {**cities, **countries}

current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    nlp = spacy.load("fr_core_news_md")
except:
    nlp = spacy.blank("fr")

gc = geonamescache.GeonamesCache()

cities = {c['name'].lower(): c['name'] for c in gc.get_cities().values()}
countries = {c['name'].lower(): c['name'] for c in gc.get_countries().values()}

ALL_PLACES = {**cities, **countries}


EXCLUDE_WORDS = ["engineer", "developer", "student", "cv", "resume", "email", "tel"]

def extract_name(lines, text):
    # 1. Clean the first part of the text specifically for the name
    # Remove common 'noise' words that appear at the very top of CVs
    noise = ["résultat", "resultat", "curriculum", "vitae", "cv", "page", "ovation"]
    
    # Check the first few lines
    for line in lines[:10]:
        clean_line = line.strip()
        
        # Skip if line is empty or just noise
        if not clean_line or any(n in clean_line.lower() for n in noise):
            # Try to remove the noise word and see what's left
            for n in noise:
                clean_line = re.sub(f"(?i){n}", "", clean_line).strip()
        
        if not clean_line:
            continue

        # 2. Refined Regex: Look for 2 to 3 capitalized words (e.g., Zineb Nassihi)
        # This regex looks for words starting with Uppercase followed by lowercase OR all caps
        name_match = re.search(r'^([A-ZÀ-Ÿ][a-zà-ÿ]+|[A-ZÀ-Ÿ]{2,})\s+([A-ZÀ-Ÿ][a-zà-ÿ]+|[A-ZÀ-Ÿ]{2,})(\s+[A-ZÀ-Ÿ][a-zà-ÿ]+)?', clean_line)
        
        if name_match:
            extracted = name_match.group(0).strip()
            # Double check it's not a city or a restricted word
            if extracted.lower() not in EXCLUDE_WORDS and extracted.lower() not in ALL_PLACES:
                return extracted.title()

    # 3. Last resort: SpaCy NER
    doc = nlp(text[:300])
    for ent in doc.ents:
        if ent.label_ == "PER" and len(ent.text.split()) >= 2:
            return ent.text.title()

    return "Unknown User"
def extract_email(text):
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else ""




def extract_ville(text):
    doc = nlp(text.lower())

    # 1. NER extraction (spaCy)
    for ent in doc.ents:
        if ent.label_ in ["GPE", "LOC"]:
            name = ent.text.strip().lower()

            # direct match
            if name in ALL_PLACES:
                return ALL_PLACES[name]

            match = get_close_matches(name, ALL_PLACES.keys(), n=1, cutoff=0.85)
            if match:
                return ALL_PLACES[match[0]]

    for token in doc:
        w = token.text.lower()
        if w in ALL_PLACES:
            return ALL_PLACES[w]

    # 3. fallback intelligent phrase matching
    words = [w for w in doc if w.is_alpha]
    phrase = " ".join([w.text for w in words])

    match = get_close_matches(phrase, ALL_PLACES.keys(), n=1, cutoff=0.8)
    if match:
        return ALL_PLACES[match[0]]

    return "Non spécifiée"


def calculate_experience_accurate(text):
    text_lower = text.lower()

    # =========================
    # 1. EXTRAIRE SECTION EXPERIENCE
    # =========================
    content = text

    if "expérience" in text_lower:
        start = text_lower.find("expérience")
        content = text[start:]

        for stop_word in ["formation", "education", "skills", "compétences"]:
            if stop_word in content.lower():
                end = content.lower().find(stop_word)
                content = content[:end]
                break

    content_lower = content.lower()

    # =========================
    # 2. CAS 1 : ANNÉES
    # =========================
    years = re.findall(r"20\d{2}", content)

    if years:
        years_int = [int(y) for y in years]
        current_year = 2026

        is_working = any(word in content_lower for word in [
            "présent", "present", "aujourd'hui", "now"
        ])

        if is_working:
            diff = current_year - min(years_int)
        else:
            diff = max(years_int) - min(years_int)

        return f"{max(diff, 1)} ans"

    # =========================
    # 3. CAS 2 : MOIS
    # =========================
    months = re.findall(r"(\d+)\s*(mois|month|months)", content_lower)

    total_months = sum(int(m[0]) for m in months)

    if total_months > 0:
        if total_months >= 12:
            return f"{total_months // 12} ans"
        else:
            return f"{total_months} mois"

    # =========================
    # 4. CAS 3 : STAGE sans durée
    # =========================
    if any(word in content_lower for word in ["stage", "internship", "stagiaire"]):
        return "Quelques mois"

    return "0 ans"


def extract_skills(text):
    found_skills = set()
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    # --- Your existing Section Logic ---
    start_headers = ["compétences", "skills", "outils", "techniques", "technologies"]
    stop_headers = ["experience", "expériences", "formation", "langues", "contact", "profil", "projets"]

    in_skills_section = False
    for line in lines:
        line_lower = line.lower()
        if any(h in line_lower for h in start_headers):
            in_skills_section = True
            continue
        if in_skills_section:
            if any(sh in line_lower for h in stop_headers) and len(line.split()) <= 4:
                break
            parts = re.split(r'[,\-\•\+\|/]', line)
            for p in parts:
                item = p.strip()
                if len(item) > 1 and not any(c.isdigit() for c in item):
                    if not any(word in item.lower() for word in ["stagiaire", "expérience", "projet"]):
                        found_skills.add(item.title())

    # --- NEW: Fallback Logic (Keyword Matching) ---
    # If section logic found nothing, look for these specific keywords in the whole text
    if not found_skills:
        keywords = [
            "Python", "Java", "Spring Boot", "Angular", "React", "SQL Server", 
            "MySQL", "PostgreSQL", "Machine Learning", "NLP", "Scikit-learn", 
            "Pandas", "C++", "Php", "JavaScript", "Html", "Css", "Docker"
        ]
        
        for kw in keywords:
            # Use regex with word boundaries (\b) to avoid matching "Java" in "Javascript"
            if re.search(rf"\b{re.escape(kw)}\b", text, re.IGNORECASE):
                found_skills.add(kw)

    return list(found_skills) if found_skills else ["Aucune compétence trouvée"]








def parse_cv(text, lang=None):
    lines = text.split("\n")  


    result = {}

    result["name"] = extract_name(lines,text)
    result["email"] = extract_email(text)
    result["ville"] = extract_ville(text)
    result["experience"] = calculate_experience_accurate(text)
    result["skills"] = extract_skills(text)

    return result