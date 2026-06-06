# vectorisation dial les textes bach lmodel y9der y3ref ra python dev == developpeur python
from sentence_transformers import SentenceTransformer
import numpy as np

_model = None


def get_model():
    global _model
    if _model is None:
        print("Loading embedding model...")
        _model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
        print("Model loaded!")
    return _model


def encode(text: str) -> np.ndarray:
    """Convert any text into a vector."""
    model = get_model()
    return model.encode(text, convert_to_numpy=True)


def encode_batch(texts: list[str]) -> np.ndarray:
    """Convert a list of texts into vectors (faster than one by one)."""
    model = get_model()
    return model.encode(texts, convert_to_numpy=True, show_progress_bar=False)
