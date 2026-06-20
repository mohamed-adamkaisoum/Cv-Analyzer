from dotenv import load_dotenv
import os

# Load .env file BEFORE importing routes
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from app.api.routes import router

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

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "../frontend/out")
if not os.path.isdir(FRONTEND_DIR):
    FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "../frontend")

if os.path.isdir(FRONTEND_DIR):
    app.mount("/app", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")

app.include_router(router)

@app.get("/", include_in_schema=False)
def frontend_root():
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)

    return {"message": "CV Analyzer API is running"}

@app.get("/{path:path}", include_in_schema=False)
def catch_all(path: str):
    # 1. Clean path
    cleaned_path = path.strip("/")
    
    # 2. Check if file exists in FRONTEND_DIR
    file_path = os.path.join(FRONTEND_DIR, cleaned_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
        
    # 3. Check if path + ".html" exists (e.g. analyze/scouty -> analyze/scouty.html)
    html_file_path = f"{file_path}.html"
    if os.path.isfile(html_file_path):
        return FileResponse(html_file_path)
        
    # 4. Check if index.html exists in subdirectory
    sub_index_path = os.path.join(file_path, "index.html")
    if os.path.isfile(sub_index_path):
        return FileResponse(sub_index_path)
        
    # 5. Fallback to main index.html for client-side routing
    main_index = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(main_index):
        return FileResponse(main_index)
        
    return {"message": "Resource not found"}
