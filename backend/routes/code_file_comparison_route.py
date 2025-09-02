from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchCode
from datetime import datetime
import os
from check_code_similarity import fetch_full_code_from_file  

code_comparison_result_bp = Blueprint('code-comparison-result', __name__)

@code_comparison_result_bp.route('/code-comparison', methods=['GET'])
@login_required
def get_code_comparison_data():
    upload_id = request.args.get('upload_id', type=int)
    if not upload_id:
        return jsonify({'error': 'Missing upload_id parameter'}), 400

    # Validate upload
    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload not found or access denied'}), 404

    if upload.upload_type != "code":
        return jsonify({
            'error': f"This route only supports code comparisons, "
                     f"but this upload is '{upload.upload_type}'"
        }), 400

    try:
        # Get file IDs for this upload
        file_ids_subquery = db.session.query(File.file_id).filter_by(upload_id=upload_id).subquery()

        # Get comparisons for these files
        comparisons = Comparison.query.filter(
            ((Comparison.file1_id.in_(file_ids_subquery)) | 
             (Comparison.file2_id.in_(file_ids_subquery))) &
            (Comparison.comparison_type == "code")
        ).all()

        # If no comparisons found, return a message
        if not comparisons:
            return jsonify({
                'error': 'No comparisons found for this upload.',
                'upload_id': upload_id,
                'total_comparisons': 0,
                'comparisons': []
            }), 404

        result = {
            'upload_id': upload_id,
            'total_comparisons': len(comparisons),
            'comparisons': []
        }

        for c in comparisons:
            # Safely fetch full file content
            try:
                file1_code_full = fetch_full_code_from_file(c.file1.file_path)
            except Exception:
                file1_code_full = ""

            try:
                file2_code_full = fetch_full_code_from_file(c.file2.file_path)
            except Exception:
                file2_code_full = ""

            # Keep raw content intact
            snippet1 = file1_code_full or ""
            snippet2 = file2_code_full or ""

            # Collect match ranges
            matches_list = [
                {
                    'file1_start': m.file1_start,
                    'file1_end': m.file1_end,
                    'file2_start': m.file2_start,
                    'file2_end': m.file2_end,
                }
                for m in c.match_codes
            ]

            result['comparisons'].append({
                'comparison_id': c.comparison_id,
                'file1_id': c.file1_id,
                'file1_name': c.file1.original_name,
                'file2_id': c.file2_id,
                'file2_name': c.file2.original_name,
                'similarity': c.plagiarism_percent,
                'compared_at': c.checked_at.isoformat() if c.checked_at else None,
                'file1_content': snippet1,
                'file2_content': snippet2,
                'matches': matches_list
            })

        return jsonify(result), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': f'Failed to fetch comparison data: {str(e)}'}), 500
