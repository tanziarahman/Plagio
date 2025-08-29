from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchCode, AvgSimilarity
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

    # Validate upload belongs to current user and is code type
    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload session not found or unauthorized'}), 404
    
    if upload.upload_type != "code":
        return jsonify({'error': f'Invalid comparison type for this upload. Found "{upload.upload_type}", expected "code"'}), 400

    # Get the upload folder path
    upload_folder_path = os.path.dirname(upload.files[0].file_path) if upload.files else None
    if not upload_folder_path or not os.path.exists(upload_folder_path):
        return jsonify({'error': 'Upload folder not found'}), 404

    # Get files and perform MOSS comparison
    try:
        moss_results = perform_code_comparison(upload_folder_path)
    except Exception as e:
        return jsonify({'error': f'MOSS comparison failed: {str(e)}'}), 500

    results = []
    
    # Store results in database
    for result in moss_results.get('results', []):
        # Find file IDs from filenames
        file1 = File.query.filter_by(original_name=result['file1_name'], upload_id=upload_id).first()
        file2 = File.query.filter_by(original_name=result['file2_name'], upload_id=upload_id).first()
        
        if file1 and file2:
            # Since calculate_avg_similarity_for_upload only uses file1_id comparisons,
            # we need to create TWO comparison records for bidirectional averaging
            
            # File1 -> File2 comparison
            comp1 = Comparison(
                file1_id=file1.file_id,
                file2_id=file2.file_id,
                plagiarism_percent=result.get('similarity_1_to_2', 0),
                comparison_type='code',
                checked_at=datetime.utcnow()
            )
            db.session.add(comp1)
            db.session.flush()
            
            # File2 -> File1 comparison  
            comp2 = Comparison(
                file1_id=file2.file_id,
                file2_id=file1.file_id,
                plagiarism_percent=result.get('similarity_2_to_1', 0),
                comparison_type='code',
                checked_at=datetime.utcnow()
            )
            db.session.add(comp2)
            db.session.flush()
            
            # Store line range matches for both directions
            for match in result.get('matches', []):
                if (match.get('file1_start') is not None and match.get('file2_start') is not None and
                    match.get('file1_end') is not None and match.get('file2_end') is not None):
                    
                    # Match for File1 -> File2 direction
                    match_code1 = MatchCode(
                        comparison_id=comp1.comparison_id,
                        file1_id=file1.file_id,
                        file1_start=match['file1_start'],
                        file1_end=match['file1_end'],
                        file2_id=file2.file_id,
                        file2_start=match['file2_start'],
                        file2_end=match['file2_end']
                    )
                    db.session.add(match_code1)
                    
                    # Match for File2 -> File1 direction (reversed)
                    match_code2 = MatchCode(
                        comparison_id=comp2.comparison_id,
                        file1_id=file2.file_id,
                        file1_start=match['file2_start'],
                        file1_end=match['file2_end'],
                        file2_id=file1.file_id,
                        file2_start=match['file1_start'],
                        file2_end=match['file1_end']
                    )
                    db.session.add(match_code2)
            
            results.append({
                'file1_id': file1.file_id,
                'file1_name': file1.original_name,
                'file2_id': file2.file_id,
                'file2_name': file2.original_name,
                'similarity_1_to_2': result.get('similarity_1_to_2', 0),
                'similarity_2_to_1': result.get('similarity_2_to_1', 0),
                'similarity_avg': (result.get('similarity_1_to_2', 0) + result.get('similarity_2_to_1', 0)) / 2,
                'matches_count': len(result.get('matches', [])),
                'comparison_id_1_to_2': comp1.comparison_id,
                'comparison_id_2_to_1': comp2.comparison_id
            })
    
    try:
        db.session.commit()
        
        # Now calculate averages - this will work correctly since we created
        # separate comparison records for each direction
        avg_results = calculate_avg_similarity_for_upload(upload_id)
        
        return jsonify({
            'message': 'Code comparison completed successfully',
            'upload_id': upload_id,
            'total_comparisons': len(results),
            'results': results,
            'average_results': avg_results,
            'moss_report_url': moss_results.get('report_url', '')
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Database error: {str(e)}'}), 500