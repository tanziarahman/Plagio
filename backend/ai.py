import os
import requests
from docx import Document

SAPLING_API_KEY = "URV8GPGB28ZQV5DW1MB5N5CD85Z6363B"
SAPLING_API_URL = "https://api.sapling.ai/api/v1/aidetect"

def read_txt(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def read_docx(file_path):
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs])

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".txt":
        return read_txt(file_path)
    elif ext == ".docx":
        return read_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def detect_ai_generated(file_path, version="20240606"):
    text = extract_text(file_path)

    payload = {
        "key": SAPLING_API_KEY,
        "text": text,
        "sent_scores": False,
        "score_string": True,
        "version": version
    }

    resp = requests.post(SAPLING_API_URL, json=payload)
    resp.raise_for_status()
    result = resp.json()

    return {
        "overall_score": result.get("score", 0.0) * 100,
        "score_html": result.get("score_string", "")
    }
