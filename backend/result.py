from models import db, Upload, File, Comparison, MatchedLine
import os
import difflib
from datetime import datetime
from flask import request

# def calculate_similarity(file1_path, file2_path):
#     """Calculate text similarity between two files"""
#     try:
#         with open(file1_path, 'r', encoding='utf-8') as f1, \
#              open(file2_path, 'r', encoding='utf-8') as f2:
            
#             text1 = f1.read()
#             text2 = f2.read()
            
#             if not text1.strip() or not text2.strip():
#                 return None
                
#             seq = difflib.SequenceMatcher(None, text1, text2)
#             similarity = seq.ratio() * 100
            
#             matching_blocks = []
#             for block in seq.get_matching_blocks():
#                 if block.size > 0:
#                     matching_blocks.append({
#                         'file1_start': block.a,
#                         'file1_end': block.a + block.size,
#                         'file2_start': block.b,
#                         'file2_end': block.b + block.size,
#                         'size': block.size
#                     })
            
#             return {
#                 'similarity': round(similarity, 2),
#                 'matching_blocks': matching_blocks,
#                 'file1_length': len(text1),
#                 'file2_length': len(text2)
#             }
            
#     except Exception as e:
#         print(f"Error comparing files: {e}")
#         return None

def perform_comparison():
    """Core comparison logic - gets upload_id from request context"""
    # Get upload_id from request (Flask example)
    upload_id = request.json.get('upload_id')  # or request.args for GET
    
    if not upload_id:
        return {'error': 'Missing upload_id in request'}, 400

    upload = Upload.query.get(upload_id)
    if not upload:
        return {'error': 'Upload session not found'}, 404

    files = File.query.filter_by(upload_id=upload_id).all()
    if len(files) < 2:
        return {'error': 'Need at least 2 files for comparison'}, 400

    results = []
    seen_pairs = set()

    for i in range(len(files)):
        for j in range(len(files)):  # Compare with all files (including previous)
            if i != j:  # Skip self-comparison
                file1 = files[i]
                file2 = files[j]

                # Skip if files don't exist
                if not all(os.path.exists(f.file_path) for f in [file1, file2]):
                    continue

                # Skip if files have different sizes (optimization)
                if os.path.getsize(file1.file_path) == os.path.getsize(file2.file_path):
                    with open(file1.file_path, 'rb') as f1, open(file2.file_path, 'rb') as f2:
                        if f1.read() == f2.read():  # Skip if identical content
                            continue

                # Ensure we only compare each pair once
                pair_key = tuple(sorted([file1.file_id, file2.file_id]))
                if pair_key in seen_pairs:
                    continue
                seen_pairs.add(pair_key)
                
                # Perform actual comparison
                comparison_result = calculate_similarity(file1.file_path, file2.file_path)
                if not comparison_result:
                    continue

                # Store comparison in database
                comparison = Comparison(
                    file1_id=file1.file_id,
                    file2_id=file2.file_id,
                    plagiarism_percent=comparison_result['similarity'],
                    comparison_type='text',
                    checked_at=datetime.utcnow()
                )
                db.session.add(comparison)
                
                # Store matching blocks
                for block in comparison_result['matching_blocks']:
                    matched_line = MatchedLine(
                        comparison_id=comparison.comparison_id,
                        file1_line=block['file1_start'],
                        file2_line=block['file2_start'],
                        size=block['size']
                    )
                    db.session.add(matched_line)
                
                # Add to results
                results.append({
                    'file1_id': file1.file_id,
                    'file1_name': file1.original_name,
                    'file2_id': file2.file_id,
                    'file2_name': file2.original_name,
                    'similarity': comparison_result['similarity'],
                    'details': comparison_result['matching_blocks']
                })

    db.session.commit()
    return {
        'upload_id': upload_id,
        'total_comparisons': len(results),
        'results': results
    }, 200

def get_comparison_data(upload_id):
    """Retrieve comparison results from database"""
    comparisons = Comparison.query.filter(
        (Comparison.file1.has(upload_id=upload_id)) | 
        (Comparison.file2.has(upload_id=upload_id))
    ).all()
    
    return {
        'comparisons': [{
            'comparison_id': c.comparison_id,
            'file1': c.file1.original_name,
            'file2': c.file2.original_name,
            'similarity': c.plagiarism_percent,
            'compared_at': c.checked_at.isoformat(),
            'matches': [{
                'file1_line': m.file1_line,
                'file2_line': m.file2_line,
                'size': m.size
            } for m in c.matches]
        } for c in comparisons]
    }, 200