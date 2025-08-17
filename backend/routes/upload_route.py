from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from models import db, Upload, File
from werkzeug.utils import secure_filename
import os, uuid
from datetime import datetime
from flask import current_app

upload_bp = Blueprint('upload', __name__)

       

ALLOWED_EXTENSIONS = {'txt', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



@upload_bp.route('/upload', methods=['POST'])
@login_required
def upload_files():
    if 'files' not in request.files:
        return jsonify({'error': 'No files part'}), 400

    files = request.files.getlist('files')
    if not files or all(file.filename == '' for file in files):
        return jsonify({'error': 'No selected files'}), 400

    extensions = set()
    valid_files = []

    for file in files:
        if file and allowed_file(file.filename):
            ext = file.filename.rsplit('.', 1)[1].lower()
            extensions.add(ext)
            valid_files.append(file)
        else:
            return jsonify({
                'error': f'Invalid file type: {file.filename}',
                'allowed_extensions': list(ALLOWED_EXTENSIONS)
            }), 400

    if len(extensions) > 1:
        return jsonify({
            'error': 'All files must have the same extension',
            'detected_extensions': list(extensions)
        }), 400

    # Get upload type from form, default to 'text' if not provided
    upload_type = request.form.get('upload_type', 'text').lower()
    if upload_type not in ('text', 'code', 'ai'):
        return jsonify({
            'error': f"Invalid upload_type: {upload_type}",
            'allowed_types': ['text', 'code', 'ai']
        }), 400

    # Create Upload record
    new_upload = Upload(
        user_id=current_user.id,
        session_name=request.form.get('analysis_name') or f"Upload_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        comparison_type=upload_type,  
        created_at=datetime.utcnow()
    )
    db.session.add(new_upload)
    db.session.flush()  

    saved_files = []

    for file in valid_files:
        filename = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex
        new_filename = f"{unique_id}_{filename}"

        user_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], f"user_{current_user.id}")
        session_folder = os.path.join(user_folder, f"session_{new_upload.upload_id}")
        os.makedirs(session_folder, exist_ok=True)

        save_path = os.path.join(session_folder, new_filename)
        file.save(save_path)

        new_file = File(
            upload_id=new_upload.upload_id,
            original_name=filename,
            stored_name=new_filename,
            file_path=save_path,
            upload_time=datetime.utcnow()
        )
        db.session.add(new_file)

        saved_files.append({
            'file_id': new_file.file_id, 
            'original_name': filename,
            'stored_name': new_filename,
            'upload_id': new_upload.upload_id
        })

    db.session.commit()

    for i, file_obj in enumerate(new_upload.files):
        saved_files[i]['file_id'] = file_obj.file_id

    return jsonify({
        'message': 'Files uploaded successfully',
        'upload_id': new_upload.upload_id,
        'upload_type': new_upload.comparison_type,
        'files': saved_files
    }), 201
