from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.app.api.routes import router
from backend.app.nlp.extractor import extract
from backend.app.nlp.parser import parse_cv

app = FastAPI(
    title="CV Analyzer AI",
    description="API pour analyser des CV, matcher avec des jobs et générer des lettres de motivation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(router)

@app.get("/")
def root():
    return {"message": "CV Analyzer API is running 🚀"}

@app.get("/")
def root():
    return {"message": "API is running"}

if __name__ == "__main__":
    file_path = r"C:\Users\hp\Downloads\cv_test_sara_benali.pdf"
   
    if os.path.exists(file_path):
        try:
            ext = file_path.split(".")[-1].lower()
            raw_text = extract(file_path, ext)

            print("\n--- TEXTE BRUT DU CV ---")
            print(raw_text) 
            print("-" * 30)

            
            cv_data = parse_cv(raw_text, lang="fr")
            
            

            print("\n--- INFORMATION EXTRACTED ---")
            print(f"Nom & Prénom: {cv_data['name']}")
            print(f"Email: {cv_data['email']}")
            print(f"Ville: {cv_data['ville']}")
            print(f"Expérience: {cv_data['experience']}")
            print("-" * 30)
            skills_list = cv_data.get('skills', [])
            print(f"Skills: {', '.join(skills_list) if skills_list else 'Aucune compétence trouvée'}")
            
            print("-" * 30)

        except Exception as e:
            print(f"\n❌ Erreur: {e}")
    else:
        print(f"❌ File not found: {file_path}")