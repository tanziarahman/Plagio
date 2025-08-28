from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from models import Upload, Comparison
from check_code_similarity import code_file_percnbtage, get_code_file_highlights  

moss_bp = Blueprint('code', __name__)

@moss_bp.route('/code-check', methods=['POST'])
@login_required
def moss_check_and_highlights():
    """
    Runs MOSS check for the current user's session, stores similarity percentages,
    extracts matched code sequences, and returns combined results.
    """
    data = request.get_json()
    language = data.get("language")
    session = data.get("session")

    if not all([language, session]):
        return jsonify({"error": "Missing required parameters: language, session"}), 400

    # Use current_user.id as the user_id
    user_id = current_user.id

    # Step 1: Run MOSS and store similarity percentages
    perc_results = code_file_percnbtage(language, user_id, session)
    if "error" in perc_results:
        return jsonify(perc_results), 400

    report_url = perc_results.get("report_url")
    upload_obj = Upload.query.filter_by(user_id=user_id, session=session).first()
    if not upload_obj:
        return jsonify({"error": "Upload not found after MOSS check"}), 400

    all_matches = []

    # Step 2: For each comparison created, extract highlighted code sequences
    comparisons = Comparison.query.filter_by(comparison_type='code').all()
    for comp in comparisons:
        highlights = get_code_file_highlights(report_url, comp)
        if "matches" in highlights:
            all_matches.extend(highlights["matches"])

    # Step 3: Return combined results
    return jsonify({
        "message": "MOSS check and highlights completed",
        "report_url": report_url,
        "similarities": perc_results["matches"],
        "average_similarities": perc_results["average_similarities"],
        "highlighted_matches": all_matches
    })
