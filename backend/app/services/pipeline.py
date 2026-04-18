from app.llm.generator import generate_cover_letter, generate_feedback
from app.schemas import CVProfile


def run_analysis(file_path):
    # TODO: extraction
    # TODO: parsing
    # TODO: skills
    # TODO: scoring
    # TODO: matching

    cv_profile = CVProfile(
        # nom=infos_personnelles['nom'],
        # email=infos_personnelles['email'],
        # telephone=infos_personnelles['telephone'],
        # competences=competences,
        # annees_experience=annees_exp,
        # niveau=niveau,
        # sections_presentes=infos_personnelles['sections'],
        # ats_score=ats_score,
        # texte_brut=texte_brut
    )

    lettre_motivation = generate_cover_letter(cv_profile,#job_title
                                              )
    feedback = generate_feedback(cv_profile)

    return {
        "lettre_motivation": lettre_motivation,
        "feedback": feedback
    }