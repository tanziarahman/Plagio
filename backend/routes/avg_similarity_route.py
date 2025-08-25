from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import Upload
from file_avg_similarity import calculate_avg_similarity_for_upload 

avgSimilarity_bp = Blueprint('avg-similarity', __name__)


@avgSimilarity_bp.route('/average-similarity', methods=['POST'])
@login_required
def get_avg_similarity():
    data = request.get_json()
    upload_id = data.get("upload_id")

    if not upload_id:
        return jsonify({'error': 'Missing upload_id in request'}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload session not found or unauthorized'}), 404

    try:
        results = calculate_avg_similarity_for_upload(upload_id)

        return jsonify({
            "message": "Average similarity calculated successfully",
            "upload_id": upload_id,
            "upload_type": upload.upload_type,  
            "results": results   
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to calculate average similarity: {str(e)}"}), 500
