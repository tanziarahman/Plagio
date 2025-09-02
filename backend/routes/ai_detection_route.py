from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File, AIDetectionResult, AvgSimilarity
from datetime import datetime
import os
from ai import detect_ai_generated, extract_text  

ai_detect_bp = Blueprint("ai-detect", __name__)

@ai_detect_bp.route("/ai-detection", methods=["POST"])
@login_required
def detect_ai():
    data = request.get_json()
    upload_id = data.get("upload_id")

    if not upload_id:
        return jsonify({"error": "Missing upload_id"}), 400

    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({"error": "Upload not found or access denied"}), 404

    if upload.upload_type != "ai":
        return jsonify({"error": f"Invalid upload type. Expected 'ai', got '{upload.upload_type}'"}), 400

    files = File.query.filter_by(upload_id=upload_id).all()
    if not files:
        return jsonify({"error": "No files found for this upload"}), 404

    results = []
    try:
        for file in files:
            if not os.path.exists(file.file_path):
                continue
            
            text = extract_text(file.file_path)
            if not text.strip():
                # Save placeholder AI detection result
                ai_result = AIDetectionResult(
                    file_id=file.file_id,
                    ai_percentage=None,
                    score_html="⚠️ No readable text found in file.",
                    detected_at=datetime.utcnow()
                )
                db.session.add(ai_result)
                db.session.flush()

                # Save placeholder in AvgSimilarity
                avg_sim = AvgSimilarity(
                    upload_id=upload.upload_id,
                    file_id=file.file_id,
                    average_similarity=None,
                    calculated_at=datetime.utcnow()
                )
                db.session.add(avg_sim)

                results.append({
                    "file_id": file.file_id,
                    "file_name": file.original_name,
                    "ai_percentage": None,
                    "score_html": "⚠️ No readable text found in file."
                })
                continue

            # Run AI detection
            detection = detect_ai_generated(file.file_path)

            # Save AI detection result
            ai_result = AIDetectionResult(
                file_id=file.file_id,
                ai_percentage=detection["overall_score"],
                score_html=detection["score_html"],
                detected_at=datetime.utcnow()
            )
            db.session.add(ai_result)
            db.session.flush()

            # Save to AvgSimilarity table
            avg_sim = AvgSimilarity(
                upload_id=upload.upload_id,
                file_id=file.file_id,
                average_similarity=detection["overall_score"],  # store AI percentage
                calculated_at=datetime.utcnow()
            )
            db.session.add(avg_sim)

            results.append({
                "file_id": file.file_id,
                "file_name": file.original_name,
                "ai_percentage": detection["overall_score"],
                "score_html": detection["score_html"]
            })

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Detection failed: {str(e)}"}), 500

    return jsonify({
        "message": "AI detection completed successfully",
        "upload_id": upload_id,
        "results": results
    }), 200
