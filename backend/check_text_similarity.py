import re
from rapidfuzz import fuzz
from docx import Document
import os

def preprocess_line(line):
    # Lowercase and remove punctuation
    line = line.lower()
    line = re.sub(r'[^\w\s]', '', line)
    return line.strip()


def split_into_sentences(text):
    """Split text into sentences using punctuation as delimiters."""
    sentences = re.split(r'(?<=[.?!])\s+', text)
    return [preprocess_line(s) for s in sentences if s.strip()]

def read_txt_lines(filepath):
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        text = f.read()
    return split_into_sentences(text)

def read_docx_lines(filepath):
    doc = Document(filepath)
    full_text = " ".join([para.text for para in doc.paragraphs if para.text.strip()])
    return split_into_sentences(full_text)

def read_file_lines(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.txt':
        return read_txt_lines(filepath)
    elif ext == '.docx':
        return read_docx_lines(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

def calculate_similarity(file1_path, file2_path, threshold=90):
    lines1 = read_file_lines(file1_path)
    lines2 = read_file_lines(file2_path)

    matched_lines = []
    matched_lines_file2 = set()

    for i, line1 in enumerate(lines1):
        best_score = 0
        best_j = None
        for j, line2 in enumerate(lines2):
            if j in matched_lines_file2:
                continue

            score = fuzz.token_set_ratio(line1, line2)
            
            #print(f"Comparing File1 Line {i+1} to File2 Line {j+1}: score={score}")

            if score > best_score:
                best_score = score
                best_j = j

        if best_score >= threshold:
            matched_lines.append((i + 1, best_j + 1))
            matched_lines_file2.add(best_j)

    # ✅ Overall document similarity
    # text1 = read_full_text(file1_path)
    # text2 = read_full_text(file2_path)
    # overall_score = fuzz.ratio(text1, text2)

    # similarity_percentage = round((len(matched_lines) / max(len(lines1), len(lines2))) * 100, 2)
    similarity_percentage = round((len(matched_lines) / len(lines1)) * 100, 2) if lines1 else 0

    return {
        'file1': file1_path,
        'file2': file2_path,
        'overall_similarity': similarity_percentage,
        'matched_lines': matched_lines
    }
