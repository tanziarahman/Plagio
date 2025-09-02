from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchItem
from datetime import datetime
import os
from text_file_similarity import compare_file_pair 
from file_avg_similarity import calculate_avg_similarity_for_upload

compareTxtFile_bp = Blueprint('compare-txt', __name__)


@compareTxtFile_bp.route('/compare-txt', methods=['POST'])
@login_required
def perform_comparison():
    data = request.get_json()
    upload_id = data.get('upload_id')

    if not upload_id:
        return jsonify({'error': 'Missing upload_id in request'}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload session not found or unauthorized'}), 404
    
    if upload.upload_type != "text":
        return jsonify({'error': f'Invalid comparison type for this upload. Found "{upload.comparison_type}"'}), 400

    files = File.query.filter_by(upload_id=upload_id).all()
    if len(files) < 2:
        return jsonify({'error': 'At least two files are required for comparison'}), 400

    results = []

    try:
        for i in range(len(files)):
            for j in range(i+1, len(files)):
                file1 = files[i]
                file2 = files[j]

                if not all(os.path.exists(os.path.normpath(f.file_path)) for f in [file1, file2]):
                    continue

                comparison_result = compare_file_pair(
                    os.path.normpath(file1.file_path),
                    os.path.normpath(file2.file_path)
                )

                if not comparison_result:
                    continue

                # file1 -> file2 comparison
                comp1 = Comparison(
                    file1_id=file1.file_id,
                    file2_id=file2.file_id,
                    plagiarism_percent=comparison_result['file1']['similarity_percentage'],
                    comparison_type='text',
                    checked_at=datetime.utcnow()
                )
                db.session.add(comp1)
                db.session.flush()

                for match in comparison_result['file1']['matches']:
                    match_item = MatchItem(
                        comparison_id=comp1.comparison_id,
                        match_type=match.get('type'),
                        word_count=match.get('word_count'),
                        index_start=match.get('index_start'),
                        length=match.get('length')
                    )
                    db.session.add(match_item)

                # file2 -> file1 comparison
                comp2 = Comparison(
                    file1_id=file2.file_id,
                    file2_id=file1.file_id,
                    plagiarism_percent=comparison_result['file2']['similarity_percentage'],
                    comparison_type='text',
                    checked_at=datetime.utcnow()
                )
                db.session.add(comp2)
                db.session.flush()

                for match in comparison_result['file2']['matches']:
                    match_item = MatchItem(
                        comparison_id=comp2.comparison_id,
                        match_type=match.get('type'),
                        word_count=match.get('word_count'),
                        index_start=match.get('index_start'),
                        length=match.get('length')
                    )
                    db.session.add(match_item)

                results.append({
                    'file1_id': file1.file_id,
                    'file1_name': file1.original_name,
                    'file2_id': file2.file_id,
                    'file2_name': file2.original_name,
                    'similarity_file1_to_file2': comparison_result['file1']['similarity_percentage'],
                    'similarity_file2_to_file1': comparison_result['file2']['similarity_percentage'],
                    'matches_file1_to_file2': comparison_result['file1']['matches'],
                    'matches_file2_to_file1': comparison_result['file2']['matches'],
                })

        db.session.commit()
        
        calculate_avg_similarity_for_upload(upload_id)
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500

    return jsonify({
        'message': 'Comparison completed successfully',
        'upload_id': upload_id,
        'total_comparisons': len(results),
        'results': results
    }), 200
