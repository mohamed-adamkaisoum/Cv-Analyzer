from dotenv import load_dotenv
import os

# Load .env file BEFORE importing routes
load_dotenv(os.path.join(os.path.dirname(__file__), '../.env'))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import router as api_router


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

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "message": "CV Analyzer API is running 🚀"
    }
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")