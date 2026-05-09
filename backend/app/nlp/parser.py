## hna n extractiw cv w ndetectiw nom , email , num ,section ansta3mlu bibliotheque spacy 
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



def extract_email(text):
    match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
    return match.group(0) if match else ""



def extract_skills(text):
    found_skills = set()

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    start_headers = ["compétences", "skills", "outils", "techniques"]
    stop_headers = ["experience", "expériences", "formation", "langues", "contact", "profil"]

    in_skills_section = False

    for line in lines:
        line_lower = line.lower()

        # =========================
        # START DETECTION
        # =========================
        if any(h in line_lower for h in start_headers):
            in_skills_section = True
            continue

        # =========================
        # STOP DETECTION (header réel)
        # =========================
        if in_skills_section:
            # ligne courte + mot clé = vrai header
            if (
                any(sh in line_lower for sh in stop_headers)
                and len(line.split()) <= 4
            ):
                break

            # =========================
            # EXTRACTION SKILLS
            # =========================
            parts = re.split(r'[,\-\•\+\|/]', line)

            for p in parts:
                item = p.strip()

                if len(item) < 2:
                    continue

                if any(c.isdigit() for c in item):
                    continue

                if any(word in item.lower() for word in [
                    "stagiaire", "expérience", "projet", "direction"
                ]):
                    continue

                found_skills.add(item.title())

    return list(found_skills) if found_skills else ["Aucune compétence trouvée"]

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



EXCLUDE_WORDS = ["engineer", "developer", "student", "cv", "resume", "email", "tel"]

def extract_name(lines):
    for line in lines[:7]:
        line = line.strip()

        # couper les parties inutiles
        line = re.split(r"[|,-]", line)[0]
        line = " ".join(line.split())

        if any(word in line.lower() for word in EXCLUDE_WORDS):
            continue

        words = line.split()

        if (
            2 <= len(words) <= 4 and
            not any(char.isdigit() for char in line) and
            "@" not in line and
            all(w[0].isupper() for w in words if w.isalpha())
        ):
            return line.title()
    return "Unknown User"
def parse_cv(text, lang=None):
    lines = text.split("\n")  


    result = {}

    result["name"] = extract_name(lines)
    result["email"] = extract_email(text)
    result["ville"] = extract_ville(text)
    result["experience"] = calculate_experience_accurate(text)
    result["skills"] = extract_skills(text)

    return result