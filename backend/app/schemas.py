from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class CVProfile(BaseModel):
    nom: str = Field(..., description="Nom complet du candidat")
    email: Optional[EmailStr] = Field(None, description="Adresse email détectée")
    telephone: Optional[str] = Field(None, description="Numéro de téléphone")

    competences: List[str] = Field(
        default_factory=list,
        description="Liste des compétences détectées via NLP/embeddings"
    )

    annees_experience: int = Field(
        default=0,
        ge=0,
        description="Nombre d'années d'expérience estimé"
    )

    niveau: str = Field(
        default="Junior",
        description="Niveau estimé : Junior / Mid / Senior"
    )

    sections_presentes: List[str] = Field(
        default_factory=list,
        description="Sections détectées dans le CV"
    )

    ats_score: float = Field(
        default=0.0,
        ge=0,
        le=100,
        description="Score ATS entre 0 et 100"
    )

    texte_brut: str = Field(
        default="",
        description="Texte brut extrait du CV"
    )


class JobMatch(BaseModel):
    titre_poste: str = Field(..., description="Titre du poste")
    entreprise: Optional[str] = Field(
        None,
        description="Nom de l'entreprise"
    )
    score: float = Field(
        ...,
        ge=0,
        le=1,
        description="Score de similarité entre le CV et l'offre"
    )
    competences_manquantes: List[str] = Field(
        default_factory=list,
        description="Compétences requises mais absentes du CV"
    )
    top_skills_match: List[str] = Field(
        default_factory=list,
        description="Compétences en commun CV ↔ job"
    )


class AnalysisResult(BaseModel):
    cv_profile: CVProfile
    job_matches: List[JobMatch] = Field(
        default_factory=list,
        description="Liste des offres les plus pertinentes"
    )
    lettre_motivation: Optional[str] = Field(
        None,
        description="Lettre de motivation générée par le LLM"
    )
    feedback: Optional[str] = Field(
        None,
        description="Suggestions pour améliorer le CV"
    )


class CoverLetterRequest(BaseModel):
    cv_profile: CVProfile
    job_title: str


class AnalyzeResponse(BaseModel):
    success: bool
    data: AnalysisResult
    message: Optional[str] = None


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool

    class Config:
        orm_mode = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str

class CVRead(BaseModel):
    id_cv: int
    fichier_cv: str
    date_upload: datetime

    class Config:
        orm_mode = True