from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload
import os

delete_bp = Blueprint('delete', __name__)

@delete_bp.route('/delete_upload', methods=['DELETE'])
@login_required
def delete_upload():
    upload_id = request.args.get('upload_id', type=int)

    if not upload_id:
        return jsonify({'error': 'Missing upload_id'}), 400


    upload = Upload.query.filter_by(upload_id=upload_id, user_id=current_user.id).first()
    if not upload:
        return jsonify({'error': 'Upload not found or access denied'}), 404
    
    for file in upload.files:
        if os.path.exists(file.file_path):
            try:
                os.remove(file.file_path)
            except Exception as e:
                print(f"Failed to delete file {file.file_path}: {e}")

    try:
        db.session.delete(upload)
        db.session.commit()
        return jsonify({'message': 'Upload deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete upload', 'details': str(e)}), 500
    