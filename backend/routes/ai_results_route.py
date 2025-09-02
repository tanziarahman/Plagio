from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Upload, File


aiHistory_bp = Blueprint('ai_detection_result', __name__)

# Route to fetch previous detection results

@aiHistory_bp.route('/ai-results', methods=['GET'])
@login_required
def get_ai_results():
    upload_id = request.args.get("upload_id", type=int)
    if not upload_id:
        return jsonify({"error": "Missing upload_id"}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({"error": "Upload not found or access denied"}), 404

    if upload.upload_type != "ai":
        return jsonify({"error": f"Invalid upload type. Expected 'ai', got '{upload.upload_type}'"}), 400

    files = File.query.filter_by(upload_id=upload_id).all()

    results = []
    for f in files:
        for res in f.ai_results:
            results.append({
                "file_id": f.file_id,
                "file_name": f.original_name,
                "ai_percentage": res.ai_percentage,
                "score_html": res.score_html,
                "detected_at": res.detected_at.isoformat()
            })

    return jsonify({
        "upload_id": upload_id,
        "results": results
    }), 200
