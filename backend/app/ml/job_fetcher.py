import os
import requests
import pandas as pd
from typing import List, Dict

from urllib.parse import quote

# ─── DATASET CONFIG ───────────────────────────────────────────────

DATASET_PATH = os.getenv("JOBS_DATASET_PATH", "data/postings.csv")

# ─── API CONFIG ───────────────────────────────────────────────────
# We use Adzuna Api UNTIL WE DECIDE 0R MR ADAM FIND THE CH0SEN API
ADZUNA_APP_ID  = os.getenv("ADZUNA_APP_ID", "6b014431")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "c69a34c2c03284b180647eb88887db64")
ADZUNA_COUNTRY = os.getenv("ADZUNA_COUNTRY", "fr")  # ma = Morocco, fr = France, gb = UK...


def _normalize_job(title: str, company: str, description: str) -> Dict:
    """Make sure every job offer has the same structure."""
    return {
        "titre_poste": str(title).strip(),
        "entreprise": str(company).strip() if company else "Unknown",
        "description": str(description).strip(),
    }


def load_from_dataset(limit: int = 500) -> List[Dict]:
    """
    Load job offers from a local CSV file.
    Expected columns: title, company, description
    (works with Kaggle LinkedIn job postings dataset)
    """
    if not os.path.exists(DATASET_PATH):
        raise FileNotFoundError(
            f"Dataset not found at '{DATASET_PATH}'. "
            "Set the JOBS_DATASET_PATH env variable or place jobs.csv in the data/ folder."
        )

    df = pd.read_csv(DATASET_PATH)

    # Try to detect the right columns (different datasets use different names)
    col_map = {}
    for col in df.columns:
        lower = col.lower()
        if "title" in lower and "titre_poste" not in col_map:
            col_map["titre_poste"] = col
        elif "company" in lower and "entreprise" not in col_map:
            col_map["entreprise"] = col
        elif "description" in lower and "description" not in col_map:
            col_map["description"] = col

    missing = [k for k in ["titre_poste", "description"] if k not in col_map]
    if missing:
        raise ValueError(
            f"Could not find columns for: {missing}. "
            f"Available columns: {list(df.columns)}"
        )

    # Drop rows with empty descriptions
    df = df.dropna(subset=[col_map["description"]])
    df = df.head(limit)

    jobs = []
    for _, row in df.iterrows():
        jobs.append(_normalize_job(
            title=row.get(col_map["titre_poste"], "Unknown"),
            company=row.get(col_map.get("entreprise", ""), "Unknown"),
            description=row[col_map["description"]],
        ))

    print(f"Loaded {len(jobs)} job offers from dataset.")
    return jobs


def load_from_api(keywords: str, limit: int = 20) -> List[Dict]:
    """
    Fetch live job offers from Adzuna API.
    keywords: skills or job title extracted from the CV (e.g. "Python developer")
    """
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        raise ValueError(
            "Adzuna API credentials missing. "
            "Set ADZUNA_APP_ID and ADZUNA_APP_KEY in your .env file."
        )

    url = (
        f"https://api.adzuna.com/v1/api/jobs/{ADZUNA_COUNTRY}/search/1"
        f"?app_id={ADZUNA_APP_ID}"
        f"&app_key={ADZUNA_APP_KEY}"
        f"&results_per_page={limit}"
        #f"&what={requests.utils.quote(keywords)}"
        f"&what={quote(keywords)}"
        f"&content-type=application/json"
    )

    response = requests.get(url, timeout=10)
    response.raise_for_status()
    data = response.json()

    jobs = []
    for item in data.get("results", []):
        jobs.append(_normalize_job(
            title=item.get("title", "Unknown"),
            company=item.get("company", {}).get("display_name", "Unknown"),
            description=item.get("description", ""),
        ))

    print(f"Fetched {len(jobs)} job offers from Adzuna API.")
    return jobs


def get_job_offers(source: str = "dataset", keywords: str = "", limit: int = 200) -> List[Dict]:
    """
    Main function — call this from matcher.py.
    source: "dataset" or "api"
    keywords: used only for API mode (e.g. top skills from CV)
    """
    if source == "api":
        return load_from_api(keywords=keywords, limit=limit)
    else:
        return load_from_dataset(limit=limit)