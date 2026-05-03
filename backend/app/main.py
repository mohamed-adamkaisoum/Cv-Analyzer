from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.api.routes import router as api_router
from app.db.database import Base, engine
import app.models.user 
import app.models.cv  

app = FastAPI(title="CV Analyzer AI")

# CORS allows your React frontend to communicate with this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Physically create tables in sql_app.db
Base.metadata.create_all(bind=engine)

# Include all routes (/auth, /cv, etc)
app.include_router(api_router)

# Mount the uploads folder so you can view PDFs via URL
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "CV Analyzer API is running 🚀"}