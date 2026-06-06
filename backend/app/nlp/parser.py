## hna n extractiw cv w ndetectiw nom , email , num ,section ansta3mlu bibliotheque spacy 
import re
import unicodedata
from datetime import date
import spacy
import geonamescache
from difflib import get_close_matches
import sys
import os
import geonamescache
from app.ml.skill_detector import extract_skills as detect_skills
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


def _format_phone(candidate):
    candidate = re.sub(r"\b(?:tel|telephone|phone|mobile|cell|gsm|whatsapp)\b\s*:?", "", candidate, flags=re.I)
    candidate = candidate.strip(" .,:;|/()[]{}")
    candidate = candidate.replace("(", " ").replace(")", " ")
    candidate = re.sub(r"\s+", " ", candidate)
    candidate = re.sub(r"\s*([.-])\s*", r"\1", candidate)
    candidate = re.sub(r"(?<=\d)-(?=\d)", " ", candidate)
    candidate = re.sub(r"(?<=\d)\.(?=\d)", " ", candidate)
    candidate = re.sub(r"\s+", " ", candidate).strip()
    return candidate


def _is_valid_phone(candidate):
    digits = re.sub(r"\D", "", candidate)
    if not 8 <= len(digits) <= 15:
        return False

    if len(set(digits)) <= 2:
        return False

    if re.fullmatch(r"(?:19|20)\d{2}", digits):
        return False

    if re.search(r"\b(?:score|ats|gpa|note|moyenne|salary|salaire|linkedin|github)\b", candidate, re.I):
        return False

    compact = re.sub(r"[\s().-]", "", candidate)
    return bool(re.fullmatch(r"\+?\d{8,15}", compact))


def extract_phone(text):
    if not text:
        return ""

    candidates = []
    contact_pattern = re.compile(
        r"(?:tel|telephone|phone|mobile|cell|gsm|whatsapp)\s*:?\s*"
        r"(\+?\d[\d\s().-]{7,24}\d)",
        re.I,
    )
    candidates.extend(match.group(1) for match in contact_pattern.finditer(text))

    generic_pattern = re.compile(r"(?<!\w)(\+?\d[\d\s().-]{7,24}\d)(?!\w)")
    candidates.extend(match.group(1) for match in generic_pattern.finditer(text))

    for candidate in candidates:
        formatted = _format_phone(candidate)
        if _is_valid_phone(formatted):
            return formatted

    return ""



def extract_skills(text):
    found_skills = set()

    lines = [l.strip() for l in text.split("\n") if l.strip()]

    start_headers = ["compÃ©tences", "skills", "outils", "techniques"]
    stop_headers = ["experience", "expÃ©riences", "formation", "langues", "contact", "profil"]

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
        # STOP DETECTION (header rÃ©el)
        # =========================
        if in_skills_section:
            # ligne courte + mot clÃ© = vrai header
            if (
                any(sh in line_lower for sh in stop_headers)
                and len(line.split()) <= 4
            ):
                break

            # =========================
            # EXTRACTION SKILLS
            # =========================
            parts = re.split(r'[,\-\â€¢\+\|/]', line)

            for p in parts:
                item = p.strip()

                if len(item) < 2:
                    continue

                if any(c.isdigit() for c in item):
                    continue

                if any(word in item.lower() for word in [
                    "stagiaire", "expÃ©rience", "projet", "direction"
                ]):
                    continue

                found_skills.add(item.title())

    return list(found_skills) if found_skills else ["Aucune compÃ©tence trouvÃ©e"]

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

    return "Non spÃ©cifiÃ©e"


MONTH_NAMES = {
    "janvier": 1, "janv": 1, "january": 1, "jan": 1,
    "fevrier": 2, "fevr": 2, "february": 2, "feb": 2,
    "mars": 3, "march": 3, "mar": 3,
    "avril": 4, "avr": 4, "april": 4, "apr": 4,
    "mai": 5, "may": 5,
    "juin": 6, "june": 6, "jun": 6,
    "juillet": 7, "july": 7, "jul": 7,
    "aout": 8, "august": 8, "aug": 8,
    "septembre": 9, "sept": 9, "september": 9, "sep": 9,
    "octobre": 10, "oct": 10, "october": 10,
    "novembre": 11, "nov": 11, "november": 11,
    "decembre": 12, "dec": 12, "december": 12,
}


def _normalize_text(value):
    normalized = unicodedata.normalize("NFKD", value or "")
    normalized = "".join(char for char in normalized if not unicodedata.combining(char))
    normalized = normalized.lower()
    normalized = normalized.replace("’", "'").replace("‐", "-").replace("‑", "-")
    normalized = normalized.replace("–", "-").replace("—", "-")
    return re.sub(r"[ \t]+", " ", normalized)


def _month_index(year, month):
    return year * 12 + month


def _parse_date_token(token, default_month):
    token = token.strip(" .,:;()[]{}")
    today = date.today()

    if re.search(r"\b(present|current|now|actuel|aujourd'hui|aujourdhui|presentement)\b", token):
        return _month_index(today.year, today.month)

    month_pattern = "|".join(sorted(map(re.escape, MONTH_NAMES), key=len, reverse=True))
    month_year = re.search(rf"\b({month_pattern})\.?\s+((?:19|20)\d{{2}})\b", token)
    if month_year:
        return _month_index(int(month_year.group(2)), MONTH_NAMES[month_year.group(1)])

    numeric_month_year = re.search(r"\b(0?[1-9]|1[0-2])[/.-]((?:19|20)\d{2})\b", token)
    if numeric_month_year:
        return _month_index(int(numeric_month_year.group(2)), int(numeric_month_year.group(1)))

    year_month = re.search(r"\b((?:19|20)\d{2})[/.-](0?[1-9]|1[0-2])\b", token)
    if year_month:
        return _month_index(int(year_month.group(1)), int(year_month.group(2)))

    year = re.search(r"\b((?:19|20)\d{2})\b", token)
    if year:
        return _month_index(int(year.group(1)), default_month)

    return None


def _merge_intervals(intervals):
    if not intervals:
        return []

    intervals = sorted(intervals)
    merged = [intervals[0]]
    for start, end in intervals[1:]:
        prev_start, prev_end = merged[-1]
        if start <= prev_end + 1:
            merged[-1] = (prev_start, max(prev_end, end))
        else:
            merged.append((start, end))
    return merged


def _months_to_label(total_months):
    if total_months <= 0:
        return "0 ans"
    if total_months < 12:
        return "Quelques mois"
    years = max(1, round(total_months / 12))
    return "1 an" if years == 1 else f"{years} ans"


def calculate_experience_accurate(text):
    normalized = _normalize_text(text)
    content = normalized
    explicit_content = normalized

    start_match = re.search(
        r"\b(experiences?|experience professionnelle|work experience|employment history|parcours professionnel)\b",
        normalized,
    )
    if start_match:
        content = normalized[start_match.start():]
        stop_match = re.search(
            r"\b(formation|education|academic|competences|skills|languages|langues|certifications?)\b",
            content[200:],
        )
        if stop_match:
            content = content[:200 + stop_match.start()]

    explicit_years = [
        float(value.replace(",", "."))
        for value in re.findall(
            r"\b(\d{1,2}(?:[,.]\d)?)\s*(?:\+?\s*)?(?:ans?|annees?|years?)\b.{0,30}\b(?:experience|experiences|exp)\b",
            explicit_content,
        )
        if float(value.replace(",", ".")) <= 50
    ]
    explicit_years.extend(
        float(value.replace(",", "."))
        for value in re.findall(
            r"\b(?:experience|experiences|exp)\b.{0,30}\b(\d{1,2}(?:[,.]\d)?)\s*(?:\+?\s*)?(?:ans?|annees?|years?)\b",
            explicit_content,
        )
        if float(value.replace(",", ".")) <= 50
    )
    if explicit_years:
        years = round(max(explicit_years))
        return "1 an" if years == 1 else f"{years} ans"

    month_pattern = "|".join(sorted(map(re.escape, MONTH_NAMES), key=len, reverse=True))
    date_token = (
        rf"(?:{month_pattern})\.?\s+(?:19|20)\d{{2}}"
        rf"|(?:0?[1-9]|1[0-2])[/.-](?:19|20)\d{{2}}"
        rf"|(?:19|20)\d{{2}}[/.-](?:0?[1-9]|1[0-2])"
        rf"|(?:19|20)\d{{2}}"
    )
    present_token = r"(?:present|current|now|actuel|aujourd'hui|aujourdhui|presentement)"
    separator = r"(?:\s*(?:-|a|to|until|jusqu'a|jusqua)\s*)"
    intervals = []

    range_pattern = re.compile(rf"({date_token}){separator}({date_token}|{present_token})")
    for match in range_pattern.finditer(content):
        start = _parse_date_token(match.group(1), default_month=1)
        end = _parse_date_token(match.group(2), default_month=12)
        if start and end and start <= end and end - start <= 600:
            intervals.append((start, end))

    since_pattern = re.compile(rf"\b(?:depuis|since)\s+({date_token})")
    today_month = _month_index(date.today().year, date.today().month)
    for match in since_pattern.finditer(content):
        start = _parse_date_token(match.group(1), default_month=1)
        if start and start <= today_month and today_month - start <= 600:
            intervals.append((start, today_month))

    merged = _merge_intervals(intervals)
    total_months = sum(end - start + 1 for start, end in merged)
    if total_months:
        return _months_to_label(total_months)

    explicit_months = [
        int(value)
        for value in re.findall(r"\b(\d{1,2})\s*(?:mois|months?)\b", content)
        if int(value) <= 60
    ]
    if explicit_months:
        return _months_to_label(sum(explicit_months))

    years = [int(value) for value in re.findall(r"\b((?:19|20)\d{2})\b", content)]
    if len(years) >= 2:
        diff = max(years) - min(years)
        if 0 < diff <= 45:
            return "1 an" if diff == 1 else f"{diff} ans"

    if any(word in content for word in ["stage", "internship", "stagiaire"]):
        return "Quelques mois"

    return "0 ans"


EXCLUDE_WORDS = ["engineer", "developer", "student", "cv", "resume", "curriculum", "vitae", "email", "tel"]

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
    result["phone"] = extract_phone(text)
    result["telephone"] = result["phone"]
    result["ville"] = extract_ville(text)
    result["experience"] = calculate_experience_accurate(text)
    result["skills"] = detect_skills(text)

    return result

