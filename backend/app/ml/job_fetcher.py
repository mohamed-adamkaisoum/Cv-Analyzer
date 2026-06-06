import os
import requests
import pandas as pd
from typing import Iterable, List, Dict

# ─── DATASET CONFIG ───────────────────────────────────────────────

DATASET_PATH = os.getenv("JOBS_DATASET_PATH", "data/postings.csv")

# ─── API CONFIG ───────────────────────────────────────────────────
# We use Adzuna Api UNTIL WE DECIDE 0R MR ADAM FIND THE CH0SEN API
ADZUNA_APP_ID  = os.getenv("ADZUNA_APP_ID", "6b014431")
ADZUNA_APP_KEY = os.getenv("ADZUNA_APP_KEY", "c69a34c2c03284b180647eb88887db64")
ADZUNA_COUNTRY = os.getenv("ADZUNA_COUNTRY", "fr")  # ma = Morocco, fr = France, gb = UK...


def _normalize_job(
    title: str,
    company: str,
    description: str,
    url: str = "",
    location: str = "",
    salary_min=None,
    salary_max=None,
    contract_time: str = "",
    category: str = "",
    created: str = "",
) -> Dict:
    """Make sure every job offer has the same structure."""
    return {
        "titre_poste": str(title).strip(),
        "entreprise": str(company).strip() if company else "Unknown",
        "description": str(description).strip(),
        "url": str(url).strip(),
        "location": str(location).strip(),
        "salary_min": salary_min,
        "salary_max": salary_max,
        "contract_time": str(contract_time).strip(),
        "category": str(category).strip(),
        "created": str(created).strip(),
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


def _as_queries(keywords: str | Iterable[str]) -> List[str]:
    if isinstance(keywords, str):
        queries = [keywords]
    else:
        queries = list(keywords)
    return [str(query).strip() for query in queries if str(query).strip()]


def load_from_api(keywords: str | Iterable[str], limit: int = 20) -> List[Dict]:
    """
    Fetch live job offers from Adzuna API.
    keywords: skills or job title extracted from the CV (e.g. "Python developer")
    """
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        raise ValueError(
            "Adzuna API credentials missing. "
            "Set ADZUNA_APP_ID and ADZUNA_APP_KEY in your .env file."
        )

    url = f"https://api.adzuna.com/v1/api/jobs/{ADZUNA_COUNTRY}/search/1"
    jobs = []
    seen = set()
    queries = _as_queries(keywords) or [""]
    per_query_limit = min(max((limit // max(len(queries), 1)) + 2, 3), 10)

    for query in [*queries, ""]:
        if len(jobs) >= limit:
            break

        params = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": per_query_limit,
            "content-type": "application/json",
        }
        if query:
            params["what"] = query

        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        for item in data.get("results", []):
            title = item.get("title", "Unknown")
            company = item.get("company", {}).get("display_name", "Unknown")
            description = item.get("description", "")
            key = (str(title).lower(), str(company).lower(), str(description)[:90].lower())
            if key in seen:
                continue
            seen.add(key)
            jobs.append(_normalize_job(
                title=title,
                company=company,
                description=description,
                url=item.get("redirect_url", ""),
                location=item.get("location", {}).get("display_name", ""),
                salary_min=item.get("salary_min"),
                salary_max=item.get("salary_max"),
                contract_time=item.get("contract_time", ""),
                category=item.get("category", {}).get("label", ""),
                created=item.get("created", ""),
            ))
            if len(jobs) >= limit:
                break

    print(f"Fetched {len(jobs)} job offers from Adzuna API.")
    return jobs


def get_job_offers(source: str = "dataset", keywords: str | Iterable[str] = "", limit: int = 200) -> List[Dict]:
    """
    Main function — call this from matcher.py.
    source: "dataset" or "api"
    keywords: used only for API mode (e.g. top skills from CV)
    """
    if source == "api":
        return load_from_api(keywords=keywords, limit=limit)
    else:
        return load_from_dataset(limit=limit)
