from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, AvgSimilarity, File

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
        avg_rows = AvgSimilarity.query.filter_by(upload_id=upload_id).all()

        if not avg_rows:
            return jsonify({'error': 'No average similarity data found for this upload'}), 404

        results = []
        for row in avg_rows:
            results.append({
                "file_id": row.file_id,
                "file_name": row.file.original_name if row.file else None,
                "average_similarity": row.average_similarity,
                "calculated_at": row.calculated_at.strftime("%Y-%m-%d %H:%M:%S")
            })

        return jsonify({
            "message": "Average similarity fetched successfully",
            "upload_id": upload_id,
            "upload_type": upload.upload_type,
            "results": results
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to fetch average similarity: {str(e)}"}), 500
