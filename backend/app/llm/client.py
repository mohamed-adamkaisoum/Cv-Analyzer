# Client LLM utilisant Ollama (local et gratuit)
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load .env file
load_dotenv(os.path.join(os.path.dirname(__file__), '../../.env'))

# Ollama tourne localement sur le port 11434
client = OpenAI(
    api_key="ollama",
    base_url="http://localhost:11434/v1"
)


def generate_text(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="llama3.2",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Erreur Ollama: {str(e)}"