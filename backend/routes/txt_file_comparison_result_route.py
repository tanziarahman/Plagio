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
    base_file_id = request.args.get('file_id', type=int)  # base file clicked
    if not upload_id or not base_file_id:
        return jsonify({'error': 'Missing upload_id or file_id parameter'}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload not found or access denied'}), 404

    if upload.upload_type != "text":
        return jsonify({'error': f"This route only supports text comparisons"}), 400

    base_file = File.query.filter_by(file_id=base_file_id, upload_id=upload_id).first()
    if not base_file:
        return jsonify({'error': 'Base file not found in this upload'}), 404

    # Fetch comparisons where base file is file1, ordered by file2_id
    comparisons = Comparison.query.filter_by(
        file1_id=base_file_id, comparison_type="text"
    ).order_by(Comparison.file2_id).all()

    # Build the comparison list for right pane
    comp_list = []
    for c in comparisons:
        target_file = c.file2
        comp_list.append({
            'file_id': target_file.file_id,
            'name': target_file.original_name,
            'similarity': c.plagiarism_percent,
            'matches': [
                {
                    'match_type': m.match_type,
                    'word_count': m.word_count,
                    'index_start': m.index_start,
                    'length': m.length
                } for m in c.matches
            ]
        })

    # Include all files in upload for the right-side list
    all_files = [
        {'file_id': f.file_id, 'name': f.original_name}
        for f in upload.files if f.file_id != base_file.file_id
    ]

    return jsonify({
        'upload_id': upload_id,
        'base_file': {
            'file_id': base_file.file_id,
            'name': base_file.original_name,
            'text': extract_text_from_path(base_file.file_path)
        },
        'comparisons': comp_list,
        'all_files': all_files
    }), 200


