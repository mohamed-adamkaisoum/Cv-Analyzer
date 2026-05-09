# extractor.py

import pdfplumber
from docx import Document
import pytesseract
from PIL import Image
import pytesseract
import re

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def clean_text(text):
    text = re.sub(r'\r', '\n', text)
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\b(?:[A-Z]\s+){2,}[A-Z]\b',
                  lambda m: m.group(0).replace(" ", ""), text)

    return text
def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

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