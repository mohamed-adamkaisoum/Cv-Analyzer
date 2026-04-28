# extractor.py

import pdfplumber
from docx import Document
import pytesseract
from PIL import Image
import pytesseract
import re

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_text(text):
    if not text:
        return ""
    
   
    text = re.sub(r'[^a-zA-Z0-9@\.\s\/\-\+\:À-ÿ]', ' ', text)
    
    text = re.sub(r'\s+', ' ', text)
    
    return text.strip()

def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return clean_text(text)


def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text= "\n".join([p.text for p in doc.paragraphs])
    return clean_text(text)



    



def extract_text_from_image(image_path):
    # هادي هي اللي كتحول التصويرة لنص
    text = pytesseract.image_to_string(Image.open(image_path))
    return clean_text(text)
def extract(file_path, ext):
    ext = ext.lower()
    if ext == "pdf":
        return extract_text_from_pdf(file_path)
    elif ext == "docx":
        return extract_text_from_docx(file_path)
    elif ext in ["image", "png", "jpg", "jpeg"]: 
        return extract_text_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")