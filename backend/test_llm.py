from dotenv import load_dotenv
import os

# Load .env BEFORE importing app modules
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

from app.schemas import CVProfile
from app.llm.generator import generate_cover_letter, generate_feedback


def test_llm():
    cv = CVProfile(
        nom="Adam Kaisoum",
        email="ahmed@gmail.com",
        telephone="0600000000",
        competences=["Excellente maîtrise des outils bureautiques ", "Gestion des réservations et dessystèmes de gestion hôtelière", "Compétences en communication et en relations interpersonnelles"],
        annees_experience=2,
        niveau="Junior",
        sections_presentes=["experience", "education", "skills"],
        ats_score=75,
        texte_brut="..."
    )
    print("=== LETTRE DE MOTIVATION ===")
    letter = generate_cover_letter(cv, "conseiller juridique")
    print(letter)

    print("\n\n=== FEEDBACK ===")
    feedback = generate_feedback(cv)
    print(feedback)
if __name__ == "__main__":
    test_llm()