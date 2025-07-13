import os
import uuid
from flask import current_app
from datetime import datetime
from werkzeug.utils import secure_filename
from models import db, User, Upload, File

ALLOWED_EXTENSIONS = {'txt', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def handle_file_upload(user_id, request_files):
    """Core file upload logic"""
    user = User.query.get(user_id)
    if not user:
        return {'error': 'User not found'}, 404

    if 'files' not in request_files:
        return {'error': 'No files part'}, 400

    files = request_files.getlist('files')
    if not files or all(file.filename == '' for file in files):
        return {'error': 'No selected files'}, 400

    extensions = set()
    valid_files = []
    
    # Validate files and collect extensions
    for file in files:
        if file and file.filename:
            if allowed_file(file.filename):
                ext = file.filename.rsplit('.', 1)[1].lower()
                extensions.add(ext)
                valid_files.append(file)
            else:
                return {
                    'error': f'Invalid file type: {file.filename}',
                    'allowed_extensions': list(ALLOWED_EXTENSIONS)
                }, 400

    if len(extensions) > 1:
        return {
            'error': 'All files in a session must have the same extension',
            'detected_extensions': list(extensions)
        }, 400

    # Create upload record first (without path yet)
    new_upload = Upload(
        user_id=user.id,
        session_name=f"Upload_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
        created_at=datetime.utcnow(),
        file_type=extensions.pop() if extensions else None
    )
    db.session.add(new_upload)
    db.session.flush()  # Generate upload_id

    # Now create folder structure
    user_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], f"user_{user.id}")
    session_folder = os.path.join(user_folder, f"session_{new_upload.upload_id}")
    os.makedirs(session_folder, exist_ok=True)

    # Update upload record with the session path
    new_upload.upload_path = session_folder

    # Process and save files
    saved_files = []
    for file in valid_files:
        filename = secure_filename(file.filename)
        unique_id = uuid.uuid4().hex
        new_filename = f"{unique_id}_{filename}"
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

    return {
        'message': 'Files uploaded successfully',
        'upload_id': new_upload.upload_id,
        'file_type': new_upload.file_type,
        'files': saved_files,
        'session_path': session_folder  # Optional: return path in response
    }, 201

def get_user_uploads(user_id):
    """Get all upload sessions for a user"""
    uploads = Upload.query.filter_by(user_id=user_id).all()
    return [{
        'upload_id': upload.upload_id,
        'session_name': upload.session_name,
        'created_at': upload.created_at.isoformat(),
        'file_count': len(upload.files)
    } for upload in uploads]

def get_upload_files(upload_id):
    """Get all files in a specific upload session"""
    files = File.query.filter_by(upload_id=upload_id).all()
    return [{
        'file_id': f.file_id,
        'original_name': f.original_name,
        'upload_time': f.upload_time.isoformat()
    } for f in files]