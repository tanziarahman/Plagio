from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
from datetime import datetime
import os
from models import db, Upload, File

upload_bp = Blueprint("upload", __name__)

ALLOWED_EXTENSIONS_BY_TYPE = {
    "text": {"txt", "docx"},
    "code": {"py", "java", "cpp", "c", "js", "ts", "rb", "php"},
    "ai": {"txt", "docx"}
}

def allowed_file(filename, upload_type):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED_EXTENSIONS_BY_TYPE.get(upload_type, set())


@upload_bp.route("/upload", methods=["POST"])
@login_required
def upload_files():
    upload_type = request.form.get("scanType")
    if upload_type not in ALLOWED_EXTENSIONS_BY_TYPE:
        return jsonify({"error": f"Invalid upload_type: {upload_type}"}), 400

    uploaded_files = request.files.getlist("files")
    if not uploaded_files:
        return jsonify({"error": "No files uploaded"}), 400

    file_extensions = set()
    for file in uploaded_files:
        if not allowed_file(file.filename, upload_type):
            return jsonify({
                "error": f"Invalid file type: {file.filename}",
                "allowed_extensions": list(ALLOWED_EXTENSIONS_BY_TYPE[upload_type])
            }), 400
        ext = file.filename.rsplit(".", 1)[1].lower()
        file_extensions.add(ext)

    if len(file_extensions) > 1:
        return jsonify({
            "error": "All files must have the same extension",
            "detected_extensions": list(file_extensions)
        }), 400

    new_upload = Upload(
        user_id=current_user.id,
        session_name=request.form.get("analysis_name")
        or f"Upload_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        upload_type=upload_type,
        created_at=datetime.utcnow()
    )
    db.session.add(new_upload)
    db.session.commit()

    upload_dir = os.path.join(
        current_app.config.get("UPLOAD_FOLDER", "uploads"),
        f"user_{current_user.id}",
        f"session_{new_upload.upload_id}"
    )
    os.makedirs(upload_dir, exist_ok=True)

    saved_files = []

    for file in uploaded_files:
        filename = secure_filename(file.filename)
        file_path = os.path.join(upload_dir, filename)
        file.save(file_path)

        file_obj = File(
            upload_id=new_upload.upload_id,
            original_name=file.filename,
            stored_name=filename,
            file_path=file_path,
            upload_time=datetime.utcnow()
        )
        db.session.add(file_obj)
        db.session.flush()  

        saved_files.append({
            "file_id": file_obj.file_id,
            "original_name": file.filename,
            "stored_name": filename,
            "file_path": file_path
        })

    db.session.commit()

    return jsonify({
        "upload_id": new_upload.upload_id,
        "upload_type": upload_type,
        "files": saved_files
    }), 201
