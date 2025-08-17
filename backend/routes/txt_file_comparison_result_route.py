from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchItem
import os
from docx import Document

txt_comparison_result_bp = Blueprint('txt-comparison-result', __name__)

def extract_text_from_path(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.txt':
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception:
            return ""
    elif ext == '.docx':
        try:
            doc = Document(file_path)
            return "\n".join([para.text for para in doc.paragraphs])
        except Exception:
            return ""
    else:
        return ""

@txt_comparison_result_bp.route('/comparison', methods=['GET'])
@login_required
def get_comparison_data():
    upload_id = request.args.get('upload_id', type=int)
    if not upload_id:
        return jsonify({'error': 'Missing upload_id parameter'}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    
    if not upload:
        return jsonify({'error': 'Upload not found or access denied'}), 404
    
    if upload.upload_type != "text":
        return jsonify({'error': f"This route only supports text comparisons, but this upload is '{upload.comparison_type}'"}), 400

    # Get file_ids from upload
    file_ids_subquery = db.session.query(File.file_id).filter_by(upload_id=upload_id).subquery()

    # Get comparisons involving those files
    comparisons = Comparison.query.filter(
        ((Comparison.file1_id.in_(file_ids_subquery)) | 
         (Comparison.file2_id.in_(file_ids_subquery))) &
        (Comparison.comparison_type == "text")
    ).all()

    result = {
        'upload_id': upload_id,
        'comparisons': []
    }

    for c in comparisons:
        file1_text = extract_text_from_path(c.file1.file_path)
        file2_text = extract_text_from_path(c.file2.file_path)

        result['comparisons'].append({
            'comparison_id': c.comparison_id,
            'file1_id': c.file1_id,
            'file1_name': c.file1.original_name,
            'file1_text': file1_text,
            'file2_id': c.file2_id,
            'file2_name': c.file2.original_name,
            'file2_text': file2_text,
            'similarity': c.plagiarism_percent,
            'compared_at': c.checked_at.isoformat(),
            'matches': [{
                'match_type': m.match_type,
                'word_count': m.word_count,
                'index_start': m.index_start,
                'length': m.length
            } for m in c.matches]
        })

    return jsonify(result), 200
