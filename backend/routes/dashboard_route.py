from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user


dashboard_bp = Blueprint('dashboard', __name__)


@dashboard_bp.route('/dashboard')
@login_required
def dashboard():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Unauthorized'}), 401
    return jsonify({'message': f'Welcome, {current_user.email}'})