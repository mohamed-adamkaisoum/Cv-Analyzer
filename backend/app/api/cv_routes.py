import os
import shutil
import pdfplumber
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.cv import CV
from app.api.user_routes import get_current_user
from app.models.user import User

router = APIRouter(prefix="/cv", tags=["CV Management"])

@router.post("/upload")
async def upload_cv(
    file: UploadFile = File(...), # This grabs WHATEVER file you dropped
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Ensure the physical folder exists
    os.makedirs("uploads/cvs", exist_ok=True)
    
    # 2. Use the REAL filename of the file you dropped
    # We prefix it with user_id to keep the 'stock' organized
    file_location = f"uploads/cvs/{current_user.id}_{file.filename}"
    
    # 3. Physically save it to the folder
    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # 4. Extract text for the Database (The 'AI Memory')
    extracted_text = ""
    if file.filename.lower().endswith(".pdf"):
        try:
            with pdfplumber.open(file_location) as pdf:
                extracted_text = "\n".join([page.extract_text() for page in pdf.pages if page.extract_text()])
        except Exception:
            extracted_text = "Extraction logic failed for this specific file."

    # 5. Save the record in the Database
    new_cv = CV(
        id_candidat=current_user.id, 
        fichier_cv=file_location, 
        texte_brut=extracted_text
    )
    db.add(new_cv)
    db.commit()
    db.refresh(new_cv)
    
    return {
        "message": "Stocked successfully!",
        "cv_id": new_cv.id_cv,
        "filename": file.filename,
        "location": file_location
    }
    
@router.delete("/{cv_id}")
async def delete_cv(cv_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Find the CV in the stock
    cv_entry = db.query(CV).filter(CV.id_cv == cv_id, CV.id_candidat == current_user.id).first()
    
    if not cv_entry:
        raise HTTPException(status_code=404, detail="CV non trouvé")

    # Remove the physical file
    if os.path.exists(cv_entry.fichier_cv):
        os.remove(cv_entry.fichier_cv)

    # Delete from database memory
    db.delete(cv_entry)
    db.commit()
    
    return {"message": f"CV #{cv_id} deleted and forgotten."}