import os
import requests
from docx import Document
import PyPDF2

# WINSTON_API_KEY = "Je69Q3GK3fj18AHWNwRKFqxWuLH025HbeIeObMH1abf78c0c"  #THIS IS TEST
WINSTON_API_KEY="jYJhurNAnqhFd7A0wGyjBFOpnK5CeA2WKQksRKK3c4a62a3b"  #THIS IS FOR PLAGIO
WINSTON_API_URL = "https://api.gowinston.ai/v2/text-compare"



def read_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def read_docx(file_path):
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs])


def read_pdf(file_path):
    text = ""
    with open(file_path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += (page.extract_text() or "") + "\n"
    return text.strip()


def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        return read_txt(file_path)
    elif ext == ".docx":
        return read_docx(file_path)
    elif ext == ".pdf":  
        return read_pdf(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")



def compare_file_pair(file1_path, file2_path):
    text1 = extract_text(file1_path)
    text2 = extract_text(file2_path)

    headers = {
        "Authorization": f"Bearer {WINSTON_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "first_text": text1,
        "second_text": text2
    }

    resp = requests.post(WINSTON_API_URL, json=payload, headers=headers)
    resp.raise_for_status()
    data = resp.json()

    return {
        "file1": {
            "name": os.path.basename(file1_path),
            "text": text1,
            "similarity_percentage": data["first_text"]["similarity_percentage"],
            "matches": data["first_text"]["items"]
        },
        "file2": {
            "name": os.path.basename(file2_path),
            "text": text2,
            "similarity_percentage": data["second_text"]["similarity_percentage"],
            "matches": data["second_text"]["items"]
        },
        "overall_similarity_score": data["similarity_score"]
    }
