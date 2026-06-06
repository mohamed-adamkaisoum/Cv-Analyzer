import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(os.path.join(os.path.dirname(__file__), "../../.env"))

BASE_URL = os.getenv(
    "NVIDIA_BASE_URL",
    "https://integrate.api.nvidia.com/v1",
)
API_KEY = os.getenv("NVIDIA_API_KEY") or os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("NVIDIA_MODEL", "minimaxai/minimax-m2.7")

_client: OpenAI | None = None


def _get_client() -> OpenAI:
    global _client
    if _client is not None:
        return _client

    if not API_KEY:
        raise ValueError(
            "NVIDIA_API_KEY manquante. Ajoutez-la dans backend/.env"
        )

    _client = OpenAI(base_url=BASE_URL, api_key=API_KEY)
    return _client


def generate_text(prompt: str) -> str:
    try:
        client = _get_client()
        stream = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.35,
            top_p=0.9,
            max_tokens=8192,
            stream=True,
        )

        parts: list[str] = []
        for chunk in stream:
            if not getattr(chunk, "choices", None):
                continue
            delta = chunk.choices[0].delta
            if delta.content:
                parts.append(delta.content)

        return "".join(parts).strip()
    except Exception as e:
        return f"Erreur LLM: {str(e)}"
