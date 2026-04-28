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



def extract_name(text):
    # =========================
    # 1. CLEAN TEXT
    # =========================
    clean_text = re.sub(r'\S+@\S+', '', text)  # remove email
    clean_text = re.sub(r'\+?\d[\d\s\.\-]{8,}', '', clean_text)  # remove phone

    doc = nlp(clean_text[:1000])

    # =========================
    # 2. RULE-BASED (STRONGEST)
    # =========================
    patterns = [
        r"nom\s*[:\-]?\s*([A-Za-zÀ-ÿ]+\s+[A-Za-zÀ-ÿ]+)",
        r"profil\s*nom\s*[:\-]?\s*([A-Za-zÀ-ÿ]+\s+[A-Za-zÀ-ÿ]+)"
    ]

    for p in patterns:
        match = re.search(p, text, re.IGNORECASE)
        if match:
            return match.group(1).strip().title()

    # =========================
    # 3. spaCy NER EXTRACTION
    # =========================
    candidates = []

    for ent in doc.ents:
        if ent.label_ in ["PERSON", "PER"]:
            name = ent.text.strip()

            words = name.split()
            if 2 <= len(words) <= 4:
                if not any(char.isdigit() for char in name):
                    candidates.append(name)

    # =========================
    # 4. SCORING SYSTEM
    # =========================
    def score(name):
        s = 0

        pos = text.lower().find(name.lower())
        if 0 <= pos <= 300:
            s += 50

        if all(w[0].isupper() for w in name.split() if w.isalpha()):
            s += 20

        if "nom" in text.lower():
            s += 30

        return s

    if candidates:
        return max(candidates, key=score).title()

    # =========================
    # 5. FALLBACK (FIRST CLEAN LINE)
    # =========================
    lines = [l.strip() for l in clean_text.split("\n") if len(l.strip()) > 3]

    for line in lines[:5]:
        if any(x in line.lower() for x in ["email", "profil", "resume", "cv", "tel"]):
            continue

        words = line.split()

        if 2 <= len(words) <= 4:
            if all(w[0].isupper() for w in words if w.isalpha()):
                return line.title()

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
    content = ""
    text_lower = text.lower()
    if "expérience" in text_lower:
        start_index = text_lower.find("expérience")
        content = text[start_index:]
        if "formation" in content.lower():
            end_index = content.lower().find("formation")
            content = content[:end_index]
    else:
        content = text

    years = re.findall(r"20\d{2}", content)
    current_year = 2026
    is_working = any(word in content.lower() for word in ["présent", "present", "aujourd'hui", "now"])
    
    if years:
        years_int = [int(y) for y in years]
        diff = (current_year - min(years_int)) if is_working else (max(years_int) - min(years_int))
        return f"{max(diff, 1)} ans"
    return "0 ans"


def extract_skills(text):
    found_skills = set()

    content_upper = text.upper()
    start_headers = ["COMPETENCES", "SKILLS", "OUTILS", "TECHNIQUES"]
    stop_headers = ["EXPERIENCE", "FORMATION", "LANGUES", "CONTACT", "PROFIL"]

    start_idx = -1
    for h in start_headers:
        if h in content_upper:
            start_idx = content_upper.find(h) + len(h)
            break

    if start_idx != -1:
        after = text[start_idx:]
        end_idx = len(after)

        for sh in stop_headers:
            pos = after.upper().find(sh)
            if pos != -1:
                end_idx = min(end_idx, pos)

        section = after[:end_idx]

        parts = re.split(r'[\n\-\•\+\|/]', section)

        for p in parts:
            item = p.strip()

            if len(item) < 2:
                continue

            if any(c.isdigit() for c in item):
                continue

            found_skills.add(item.title())

    return list(found_skills) if found_skills else ["Aucune compétence trouvée"]

def parse_cv(text ,lang=None):
   
    text = text.replace("\n", " ")

    result = {}

    result["name"] = extract_name(text)
    result["email"] = extract_email(text)
    result["ville"] = extract_ville(text)
    result["experience"] = calculate_experience_accurate(text)
    skills = extract_skills(text)
    result["skills"] = extract_skills(text)
    return result
