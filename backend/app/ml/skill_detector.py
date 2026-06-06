import re
import unicodedata

from app.nlp.extractor import extract


SKILL_ALIASES = {
    "python": "Python",
    "r": "R",
    "sql": "SQL",
    "mysql": "MySQL",
    "postgresql": "PostgreSQL",
    "postgres": "PostgreSQL",
    "sql server": "SQL Server",
    "mongodb": "MongoDB",
    "redis": "Redis",
    "excel": "Excel",
    "power bi": "Power BI",
    "tableau": "Tableau",
    "looker": "Looker",
    "data visualization": "Data Visualization",
    "data visualisation": "Data Visualization",
    "matplotlib": "Matplotlib",
    "seaborn": "Seaborn",
    "plotly": "Plotly",
    "statistics": "Statistics",
    "statistical analysis": "Statistical Analysis",
    "machine learning": "Machine Learning",
    "deep learning": "Deep Learning",
    "nlp": "NLP",
    "natural language processing": "NLP",
    "computer vision": "Computer Vision",
    "tensorflow": "TensorFlow",
    "pytorch": "PyTorch",
    "scikit-learn": "Scikit-learn",
    "sklearn": "Scikit-learn",
    "pandas": "Pandas",
    "numpy": "NumPy",
    "scipy": "SciPy",
    "keras": "Keras",
    "spark": "Apache Spark",
    "apache spark": "Apache Spark",
    "hadoop": "Hadoop",
    "airflow": "Airflow",
    "dbt": "dbt",
    "etl": "ETL",
    "data mining": "Data Mining",
    "data modeling": "Data Modeling",
    "data modelling": "Data Modeling",
    "time series": "Time Series",
    "forecasting": "Forecasting",
    "a/b testing": "A/B Testing",
    "ab testing": "A/B Testing",
    "fraud detection": "Fraud Detection",
    "dashboarding": "Dashboarding",
    "dashboards": "Dashboarding",
    "java": "Java",
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "php": "PHP",
    "c#": "C#",
    "c++": "C++",
    "html": "HTML",
    "css": "CSS",
    "sass": "Sass",
    "react": "React",
    "angular": "Angular",
    "vue": "Vue.js",
    "node.js": "Node.js",
    "nodejs": "Node.js",
    "express": "Express",
    "spring boot": "Spring Boot",
    "laravel": "Laravel",
    "django": "Django",
    "flask": "Flask",
    "fastapi": "FastAPI",
    "asp.net": "ASP.NET",
    "asp.net core": "ASP.NET Core",
    ".net": ".NET",
    "rest api": "REST API",
    "api rest": "REST API",
    "graphql": "GraphQL",
    "mvc": "MVC",
    "git": "Git",
    "github": "GitHub",
    "gitlab": "GitLab",
    "docker": "Docker",
    "kubernetes": "Kubernetes",
    "aws": "AWS",
    "azure": "Azure",
    "gcp": "GCP",
    "google cloud": "GCP",
    "linux": "Linux",
    "jira": "Jira",
    "postman": "Postman",
    "agile": "Agile",
    "scrum": "Scrum",
    "project management": "Project Management",
    "communication": "Communication",
    "communication efficace": "Communication",
    "leadership": "Leadership",
    "problem solving": "Problem Solving",
    "resolution de problemes": "Problem Solving",
    "résolution de problèmes": "Problem Solving",
    "microsoft office": "Microsoft Office",
    "office": "Microsoft Office",
    "google suite": "Google Suite",
    "outils bureautiques": "Outils bureautiques",
    "gestion des reservations": "Gestion des réservations",
    "gestion des réservations": "Gestion des réservations",
    "systemes de gestion hoteliere": "Systèmes de gestion hôtelière",
    "systèmes de gestion hôtelière": "Systèmes de gestion hôtelière",
    "relations interpersonnelles": "Relations interpersonnelles",
    "travail sous pression": "Travail sous pression",
    "gestion des priorites": "Gestion des priorités",
    "gestion des priorités": "Gestion des priorités",
    "gestion de projet": "Gestion de projet",
    "relations publiques": "Relations publiques",
    "travail d'equipe": "Travail d'équipe",
    "travail d'équipe": "Travail d'équipe",
    "gestion du temps": "Gestion du temps",
    "pensee critique": "Pensée critique",
    "pensée critique": "Pensée critique",
    "premiers secours": "Premiers secours",
    "secourisme": "Secourisme",
    "droit prive": "Droit privé",
    "droit privé": "Droit privé",
    "droit des contrats": "Droit des contrats",
    "droit des affaires": "Droit des affaires",
    "accompagnement juridique": "Accompagnement juridique",
    "gestion juridique": "Gestion juridique",
}

SOFT_SKILLS = {
    "Communication",
    "Leadership",
    "Problem Solving",
    "Relations interpersonnelles",
    "Travail sous pression",
    "Gestion des priorités",
    "Travail d'équipe",
    "Gestion du temps",
    "Pensée critique",
}

SECTION_STARTERS = {
    "skills",
    "technical skills",
    "core skills",
    "core competencies",
    "competencies",
    "competences",
    "competences techniques",
    "competences cles",
    "outils",
    "outils et environnements",
    "technologies",
    "technical competencies",
    "programming languages",
    "languages and tools",
    "frameworks",
    "libraries",
}

SECTION_STOPPERS = {
    "experience",
    "experiences",
    "professional experience",
    "work experience",
    "employment history",
    "formation",
    "education",
    "projects",
    "personal projects",
    "selected publications",
    "publications",
    "certifications",
    "certifications and training",
    "training",
    "awards",
    "honors",
    "research",
    "research funding",
    "professional contributions",
    "community engagement",
    "volunteer",
    "hobbies",
    "other interests",
    "interests",
    "languages",
    "langues",
    "references",
    "contact",
    "profile",
    "profil",
    "summary",
}

CONTEXT_WORDS = {
    "journal",
    "reviewer",
    "university",
    "lecturer",
    "publication",
    "published",
    "paper",
    "papers",
    "funding",
    "hobby",
    "hobbies",
    "photography",
    "marathon",
    "mentor",
    "volunteer",
    "community",
    "student",
    "students",
    "stakeholder",
    "stakeholders",
    "client",
    "clients",
    "company",
    "oy",
    "croissant rouge",
    "progettomondo",
    "faculte",
    "faculté",
    "universite",
    "université",
}


def _normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    value = value.replace("&", " and ")
    value = re.sub(r"\s+", " ", value)
    return value.strip().lower()


def _heading_key(line: str) -> str:
    normalized = _normalize(line)
    normalized = re.sub(r"[:\-–—]+$", "", normalized).strip()
    return normalized


def _is_heading(line: str) -> bool:
    cleaned = line.strip()
    words = cleaned.split()
    if not cleaned or len(words) > 5:
        return False
    letters = re.sub(r"[^A-Za-zÀ-ÿ]", "", cleaned)
    return bool(letters) and (cleaned.isupper() or cleaned.istitle())


def _extract_skill_sections(lines: list[str]) -> list[str]:
    sections = []
    in_section = False

    for line in lines:
        key = _heading_key(line)

        if key in SECTION_STARTERS or any(key.startswith(f"{starter}:") for starter in SECTION_STARTERS):
            in_section = True
            remainder = re.sub(r"^[^:]+:\s*", "", line).strip()
            if remainder and _heading_key(remainder) != key:
                sections.append(remainder)
            continue

        inline_starter = next((starter for starter in SECTION_STARTERS if key.startswith(f"{starter} ")), None)
        if inline_starter:
            in_section = True
            remainder = line[len(line.split()[0]):].strip()
            if remainder:
                sections.append(remainder)
            continue

        if in_section and (_heading_key(line) in SECTION_STOPPERS or (_is_heading(line) and _heading_key(line) in SECTION_STOPPERS)):
            in_section = False
            continue

        if in_section:
            cropped = re.split(r"\b(FORMATION|FORMATIONS|LANGUAGES|LANGUES|EXPERIENCES|EXPERIENCE|CONTACT|PROFILE|PROFIL)\b", line, maxsplit=1)[0].strip()
            if cropped:
                sections.append(cropped)

    return sections


def _contains_context_noise(candidate: str) -> bool:
    normalized = _normalize(candidate)
    return any(re.search(rf"\b{re.escape(word)}\b", normalized) for word in CONTEXT_WORDS)


def _is_valid_candidate(candidate: str) -> bool:
    candidate = candidate.strip(" .;:()[]{}")
    words = candidate.split()
    if not 2 <= len(candidate) <= 40:
        return False
    if len(words) > 4:
        return False
    if _contains_context_noise(candidate):
        return False
    if re.search(r"\d{4}", candidate):
        return False
    if re.search(r"[.!?]$", candidate):
        return False

    normalized = _normalize(candidate)
    if normalized in SKILL_ALIASES:
        return True

    has_tech_signal = bool(re.search(r"(\+\+|#|\.js|\.net|api|sql|git|ai|ml|nlp|bi|etl)", normalized))
    has_acronym = bool(re.search(r"\b[A-Z]{2,}\b", candidate))
    return has_tech_signal or has_acronym


def _canonicalize(candidate: str) -> str | None:
    cleaned = candidate.strip(" .;:()[]{}")
    cleaned = re.sub(r"\b20\d{2}\b.*$", "", cleaned).strip(" .;:()[]{}")
    normalized = _normalize(cleaned)
    if normalized in SKILL_ALIASES:
        return SKILL_ALIASES[normalized]
    if _is_valid_candidate(cleaned):
        return cleaned.strip()
    return None


def _split_candidates(text: str) -> list[str]:
    text = re.sub(r"^[•\-\*\u2022]\s*", "", text.strip())
    text = re.sub(r"^[A-Za-zÀ-ÿ &/]+:\s*", "", text)
    return [part.strip() for part in re.split(r"[,;|/•\n]+", text) if part.strip()]


def _find_known_skills(text: str) -> set[str]:
    normalized_text = f" {_normalize(text)} "
    found = set()

    for alias, canonical in sorted(SKILL_ALIASES.items(), key=lambda item: len(item[0]), reverse=True):
        pattern = rf"(?<![\w.+#-]){re.escape(alias)}(?![\w.+#-])"
        if canonical in SOFT_SKILLS:
            continue
        if re.search(pattern, normalized_text):
            found.add(canonical)

    return found


def extract_skills_from_file(file_path, ext):
    text = extract(file_path, ext)
    return extract_skills(text)


def extract_skills(text):
    found_skills = _find_known_skills(text)
    lines = [line.strip() for line in text.splitlines() if line.strip()]

    for section_line in _extract_skill_sections(lines):
        for candidate in _split_candidates(section_line):
            skill = _canonicalize(candidate)
            if skill:
                found_skills.add(skill)

    return sorted(found_skills) if found_skills else ["Aucune compétence trouvée"]
