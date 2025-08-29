from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, Comparison, MatchCode
import os

code_comparison_result_bp = Blueprint("code-comparison-result", __name__)

def extract_code_from_path(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    code_extensions = ['.py', '.java', '.cpp', '.c', '.js', '.ts', '.cs', '.php', '.rb', '.go']  
    
    if ext in code_extensions:
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read()
        except Exception:
            return ""
    else:
        return ""


@code_comparison_result_bp.route("/code-comparison", methods=["GET"])
@login_required
def get_code_comparison_data():
    upload_id = request.args.get("upload_id", type=int)
    if not upload_id:
        return jsonify({"error": "Missing upload_id parameter"}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({"error": "Upload not found or access denied"}), 404

    if upload.upload_type != "code":
        return jsonify({"error": f"This route only supports code comparisons, but this upload is '{upload.upload_type}'"}), 400

    file_ids_subquery = db.session.query(File.file_id).filter_by(upload_id=upload_id).subquery()

    comparisons = Comparison.query.filter(
        ((Comparison.file1_id.in_(file_ids_subquery)) |
         (Comparison.file2_id.in_(file_ids_subquery))) &
        (Comparison.comparison_type == "code")
    ).all()

    result = {
        "upload_id": upload_id,
        "comparisons": []
    }

    for c in comparisons:
        file1_code = extract_code_from_path(c.file1.file_path)
        file2_code = extract_code_from_path(c.file2.file_path)

        result["comparisons"].append({
            "comparison_id": c.comparison_id,
            "file1_id": c.file1_id,
            "file1_name": c.file1.original_name,
            "file1_code": file1_code,
            "file2_id": c.file2_id,
            "file2_name": c.file2.original_name,
            "file2_code": file2_code,
            "similarity": c.plagiarism_percent,
            "compared_at": c.checked_at.isoformat() if c.checked_at else None,
            "matches": [
                {
                    "match_id": m.match_id,
                    "file1_id": m.file1_id,
                    "file1_start": m.file1_start,
                    "file1_end": m.file1_end,
                    "file2_id": m.file2_id,
                    "file2_start": m.file2_start,
                    "file2_end": m.file2_end,
                }
                for m in c.match_codes
            ],
        })

    return jsonify(result), 200
