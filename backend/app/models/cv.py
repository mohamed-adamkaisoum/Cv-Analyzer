from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.database import Base

class CV(Base):
    __tablename__ = "cvs"

    id_cv = Column(Integer, primary_key=True, index=True) # Unique ID for each CV
    id_candidat = Column(Integer, ForeignKey("users.id"), nullable=False) # Link to User
    fichier_cv = Column(String, nullable=False) # Path to physical file
    texte_brut = Column(Text, nullable=True)    # Extracted text (AI Memory)
    date_upload = Column(DateTime(timezone=True), server_default=func.now())