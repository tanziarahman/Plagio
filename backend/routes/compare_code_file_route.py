from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Upload, File, Comparison
from check_code_similarity import code_file_percnbtage, get_code_file_highlights  
import os

moss_bp = Blueprint('code', __name__)

@moss_bp.route('/code-check', methods=['POST'])
@login_required
def moss_check_and_highlights():
    """
    Runs MOSS check for the current user's session, validates upload type and file extensions,
    stores similarity percentages, extracts matched code sequences, and returns combined results.
    """
    data = request.get_json()
    language = data.get("language")
    session = data.get("session")

    if not all([language, session]):
        return jsonify({"error": "Missing required parameters: language, session"}), 400

    user_id = current_user.id

    upload_obj = Upload.query.filter_by(user_id=user_id, session=session).first()
    if not upload_obj:
        return jsonify({"error": "Upload not found for this session"}), 404

    if upload_obj.upload_type != "code":
        return jsonify({"error": f'Invalid comparison type for this upload. Found "{upload_obj.upload_type}"'}), 400

    files = File.query.filter_by(upload_id=upload_obj.upload_id).all()
    if len(files) < 2:
        return jsonify({"error": "At least two files are required for code comparison"}), 400

    extensions = {os.path.splitext(f.original_name)[1].lower() for f in files}
    if len(extensions) > 1:
        return jsonify({"error": f"All files must have the same extension. Found: {list(extensions)}"}), 400

    perc_results = code_file_percnbtage(language, user_id, session)
    if "error" in perc_results:
        return jsonify(perc_results), 400

    report_url = perc_results.get("report_url")

    all_matches = []

    comparisons = Comparison.query.filter_by(upload_id=upload_obj.upload_id, comparison_type='code').all()
    for comp in comparisons:
        highlights = get_code_file_highlights(report_url, comp)
        if "matches" in highlights:
            all_matches.extend(highlights["matches"])

    return jsonify({
        "message": "MOSS check and highlights completed",
        "upload_id": upload_obj.upload_id,
        "report_url": report_url,
        "similarities": perc_results["matches"],
        "average_similarities": perc_results["average_similarities"],
        "highlighted_matches": all_matches
    }), 200
