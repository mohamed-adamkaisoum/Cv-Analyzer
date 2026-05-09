# hna khass nderu detection dial les competences/skills l output khass ykun liste dial les competences par exemple ['SQL','python']
import spacy
from backend.app.nlp.extractor import extract
import re
nlp = spacy.load("en_core_web_sm")

 


def extract_skills_from_file(file_path, ext):
    #extraire texte
    text = extract(file_path, ext)
    
    #extraire skills
    skills = extract_skills(text)
    
    return skills



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



