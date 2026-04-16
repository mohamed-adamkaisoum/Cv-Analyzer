import os
import shutil
from fastapi import UploadFile
from uuid import uuid4

UPLOAD_DIR = "uploads"

# Extensions autorisées
ALLOWED_EXTENSIONS = [".pdf", ".docx"]

# Taille max (5MB)
MAX_FILE_SIZE = 5 * 1024 * 1024


def ensure_upload_dir():
    """Créer le dossier uploads s'il n'existe pas"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)


def get_file_extension(filename: str) -> str:
    """Retourne l'extension du fichier"""
    return os.path.splitext(filename)[1].lower()


def is_allowed_file(filename: str) -> bool:
    """Vérifie si l'extension est autorisée"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


async def validate_file(file: UploadFile):
  
    if not is_allowed_file(file.filename):
        raise ValueError("Format non supporté. Utilisez PDF ou DOCX.")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise ValueError("Fichier trop volumineux (max 5MB).")

    file.file.seek(0)


def generate_unique_filename(filename: str) -> str:
    """Génère un nom unique pour éviter les collisions"""
    ext = get_file_extension(filename)
    return f"{uuid4().hex}{ext}"


def save_file(file: UploadFile) -> str:
    """Sauvegarde le fichier et retourne son chemin"""
    
    ensure_upload_dir()

    unique_name = generate_unique_filename(file.filename)
    file_path = os.path.join(UPLOAD_DIR, unique_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return file_path


def delete_file(file_path: str):
    """Supprime un fichier"""
    if os.path.exists(file_path):
        os.remove(file_path)