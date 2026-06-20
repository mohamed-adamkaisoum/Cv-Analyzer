import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
API_KEY = os.getenv("GROQ_API_KEY")
MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is not None:
        return _client

    if not API_KEY:
        raise ValueError(
            "GROQ_API_KEY manquante. Ajoutez-la dans backend/.env"
        )

    _client = OpenAI(base_url=BASE_URL, api_key=API_KEY)
    return _client


def generate_text(prompt: str) -> str:
    try:
        client = _get_client()
        completion = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.35,
            top_p=0.9,
            max_tokens=4096,
        )

        return completion.choices[0].message.content.strip()
    except Exception as e:
        return f"Erreur LLM: {str(e)}"
