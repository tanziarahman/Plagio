from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchCode
import os

code_comparison_result_bp = Blueprint('code-comparison-result', __name__)

def extract_code_content(file_path):
    """Extract code content from various file types"""
    ext = os.path.splitext(file_path)[1].lower()
    supported_extensions = ('.py', '.c', '.cpp', '.java', '.js', '.cs', '.php', '.rb', '.go', '.txt')
    
    if ext in supported_extensions:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Error reading file: {str(e)}"
    else:
        return f"Unsupported file type: {ext}"

@code_comparison_result_bp.route('/code-comparison', methods=['GET'])
@login_required
def get_code_comparison_data():
    upload_id = request.args.get('upload_id', type=int)
    if not upload_id:
        return jsonify({'error': 'Missing upload_id parameter'}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    
    if not upload:
        return jsonify({'error': 'Upload not found or access denied'}), 404
    
    if upload.upload_type != "code":
        return jsonify({'error': f"This route only supports code comparisons, but this upload is '{upload.upload_type}'"}), 400

    # Get all files in this upload
    files = File.query.filter_by(upload_id=upload_id).all()
    file_ids = [f.file_id for f in files]
    
    # Get unique file pairs to avoid duplicate comparisons
    comparisons = []
    seen_pairs = set()
    
    # Get all code comparisons involving files from this upload
    all_comparisons = Comparison.query.filter(
        ((Comparison.file1_id.in_(file_ids)) | (Comparison.file2_id.in_(file_ids))) &
        (Comparison.comparison_type == "code")
    ).all()
    
    # Group comparisons by file pair and direction
    comparison_groups = {}
    for comp in all_comparisons:
        pair_key = tuple(sorted([comp.file1_id, comp.file2_id]))
        if pair_key not in comparison_groups:
            comparison_groups[pair_key] = {'file1_id': comp.file1_id, 'file2_id': comp.file2_id, 'comparisons': []}
        comparison_groups[pair_key]['comparisons'].append(comp)
    
    result = {
        'upload_id': upload_id,
        'upload_type': 'code',
        'file_pairs': []
    }

    for pair_key, pair_data in comparison_groups.items():
        file1_id, file2_id = pair_key
        file1 = next((f for f in files if f.file_id == file1_id), None)
        file2 = next((f for f in files if f.file_id == file2_id), None)
        
        if not file1 or not file2:
            continue
            
        file1_content = extract_code_content(file1.file_path)
        file2_content = extract_code_content(file2.file_path)
        
        # Get comparisons for both directions
        comp_1_to_2 = next((c for c in pair_data['comparisons'] if c.file1_id == file1_id and c.file2_id == file2_id), None)
        comp_2_to_1 = next((c for c in pair_data['comparisons'] if c.file1_id == file2_id and c.file2_id == file1_id), None)
        
        # Get matches for both directions
        line_matches_1_to_2 = []
        line_matches_2_to_1 = []
        
        if comp_1_to_2:
            for match in comp_1_to_2.match_codes:
                line_matches_1_to_2.append({
                    'file1_start_line': match.file1_start,
                    'file1_end_line': match.file1_end,
                    'file2_start_line': match.file2_start,
                    'file2_end_line': match.file2_end,
                    'match_length': (match.file1_end - match.file1_start + 1) if match.file1_start and match.file1_end else 0
                })
        
        if comp_2_to_1:
            for match in comp_2_to_1.match_codes:
                line_matches_2_to_1.append({
                    'file1_start_line': match.file1_start,  # This is actually file2 in original direction
                    'file1_end_line': match.file1_end,      # This is actually file2 in original direction
                    'file2_start_line': match.file2_start,  # This is actually file1 in original direction
                    'file2_end_line': match.file2_end,      # This is actually file1 in original direction
                    'match_length': (match.file1_end - match.file1_start + 1) if match.file1_start and match.file1_end else 0
                })
        
        # Calculate average similarity
        similarities = []
        if comp_1_to_2:
            similarities.append(comp_1_to_2.plagiarism_percent)
        if comp_2_to_1:
            similarities.append(comp_2_to_1.plagiarism_percent)
        
        avg_similarity = sum(similarities) / len(similarities) if similarities else 0
        
        result['file_pairs'].append({
            'file1_id': file1.file_id,
            'file1_name': file1.original_name,
            'file1_content': file1_content,
            'file1_lines': file1_content.count('\n') + 1 if file1_content else 0,
            'file2_id': file2.file_id,
            'file2_name': file2.original_name,
            'file2_content': file2_content,
            'file2_lines': file2_content.count('\n') + 1 if file2_content else 0,
            'similarity_1_to_2': comp_1_to_2.plagiarism_percent if comp_1_to_2 else 0,
            'similarity_2_to_1': comp_2_to_1.plagiarism_percent if comp_2_to_1 else 0,
            'similarity_avg': avg_similarity,
            'compared_at': comp_1_to_2.checked_at.isoformat() if comp_1_to_2 else (comp_2_to_1.checked_at.isoformat() if comp_2_to_1 else None),
            'line_matches_1_to_2': line_matches_1_to_2,
            'line_matches_2_to_1': line_matches_2_to_1,
            'total_matches': len(line_matches_1_to_2) + len(line_matches_2_to_1),
            'comparison_id_1_to_2': comp_1_to_2.comparison_id if comp_1_to_2 else None,
            'comparison_id_2_to_1': comp_2_to_1.comparison_id if comp_2_to_1 else None
        })

    return jsonify(result), 200