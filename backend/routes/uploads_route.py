from flask import jsonify , Blueprint
from flask_login import login_required, current_user
from models import  Upload


uploads_bp = Blueprint('uploads', __name__)


@uploads_bp.route('/uploads', methods=['GET'])
@login_required
def get_user_uploads():
    """Get all upload sessions for the logged-in user"""
    user_id = current_user.id
    uploads = Upload.query.filter_by(user_id=user_id).order_by(Upload.created_at.desc()).all()

    upload_data = [{
        'upload_id': upload.upload_id,
        'session_name': upload.session_name,
        'comparison_type': upload.comparison_type,
        'created_at': upload.created_at.isoformat(),
        'file_count': len(upload.files)
    } for upload in uploads]

    return jsonify({
        'message': 'User upload sessions retrieved successfully',
        'uploads': upload_data
    }), 200

    