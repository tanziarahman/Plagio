from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchCode
from datetime import datetime
import os
from check_code_similarity import perform_code_comparison 
from file_avg_similarity import calculate_avg_similarity_for_upload

compareCodeFile_bp = Blueprint('compare-code', __name__)

@compareCodeFile_bp.route('/compare-code', methods=['POST'])
@login_required
def perform_code_comparison_route():
    data = request.get_json()
    upload_id = data.get('upload_id')

    if not upload_id:
        return jsonify({'error': 'Missing upload_id in request'}), 400

    # validate upload belongs to current user
    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload session not found or unauthorized'}), 404

    if upload.upload_type != "code":
        return jsonify({'error': f'Invalid comparison type for this upload. Found \"{upload.upload_type}\"'}), 400

    files = File.query.filter_by(upload_id=upload_id).all()
    if len(files) < 2:
        return jsonify({'error': 'At least two code files are required for comparison'}), 400

    folder_path = os.path.dirname(files[0].file_path)
    results = []

    try:
        moss_result = perform_code_comparison(folder_path)

        # --- handle errors consistently ---
        if not isinstance(moss_result, dict):
            return jsonify({'error': 'Unexpected result from code comparison'}), 500

        if "error" in moss_result:
            return jsonify(moss_result), 400

        for comp in moss_result.get("results", []):
            # match DB files by original_name
            file1 = File.query.filter_by(upload_id=upload_id, original_name=comp["file1_name"]).first()
            file2 = File.query.filter_by(upload_id=upload_id, original_name=comp["file2_name"]).first()

            if not file1 or not file2:
                return jsonify({"error": "file1_id and file2_id are required"}), 400
            
            existing = Comparison.query.filter(
                ((Comparison.file1_id == file1.file_id) & (Comparison.file2_id == file2.file_id)) |
                ((Comparison.file1_id == file2.file_id) & (Comparison.file2_id == file1.file_id))
            ).first()

            if existing:
                continue

            # file1 → file2 comparison
            comp1 = Comparison(
                file1_id=file1.file_id,
                file2_id=file2.file_id,
                plagiarism_percent=comp['similarity_1_to_2'],
                comparison_type='code',
                checked_at=datetime.utcnow()
            )
            db.session.add(comp1)
            db.session.flush()

            for match in comp['matches_1_to_2']:
                match_code = MatchCode(
                    comparison_id=comp1.comparison_id,
                    file1_id=file1.file_id,
                    file1_start=match['file1_start'],
                    file1_end=match['file1_end'],
                    file2_id=file2.file_id,
                    file2_start=match['file2_start'],
                    file2_end=match['file2_end'],
                )
                db.session.add(match_code)

            # file2 → file1 comparison
            comp2 = Comparison(
                file1_id=file2.file_id,
                file2_id=file1.file_id,
                plagiarism_percent=comp['similarity_2_to_1'],
                comparison_type='code',
                checked_at=datetime.utcnow()
            )
            db.session.add(comp2)
            db.session.flush()

            for match in comp['matches_2_to_1']:
                match_code = MatchCode(
                    comparison_id=comp2.comparison_id,
                    file1_id=file2.file_id,
                    file1_start=match['file2_start'],
                    file1_end=match['file2_end'],
                    file2_id=file1.file_id,
                    file2_start=match['file1_start'],
                    file2_end=match['file1_end'],
                )
                db.session.add(match_code)

            results.append({
                'file1_id': file1.file_id,
                'file1_name': file1.original_name,
                'file2_id': file2.file_id,
                'file2_name': file2.original_name,
                'similarity_file1_to_file2': comp['similarity_1_to_2'],
                'similarity_file2_to_file1': comp['similarity_2_to_1'],
                'matches_file1_to_file2': comp['matches_1_to_2'],
                'matches_file2_to_file1': comp['matches_2_to_1']
            })

        db.session.commit()
        calculate_avg_similarity_for_upload(upload_id)

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    return jsonify({
        'message': 'Code comparison completed successfully',
        'upload_id': upload_id,
        'report_url': moss_result.get("report_url"),
        'total_comparisons': len(results),
        'results': results
    }), 200

