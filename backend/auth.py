from flask import Blueprint, request, jsonify, make_response, current_app
from flask_login import login_user, logout_user, login_required,LoginManager
from models import db, User
import bcrypt
import random
import string
from flask_mail import Message,Mail
from datetime import datetime, timedelta

verification_codes = {} 


auth_bp = Blueprint('auth', __name__)


login_manager = LoginManager()
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))


@login_manager.unauthorized_handler
def unauthorized_callback():
    return make_response(jsonify({'message': 'Unauthorized'}), 401)




@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    code = data.get('code')

    if not all([email, password, code]):
        return jsonify({'message': 'Missing required fields'}), 400

    # Check verification code
    entry = verification_codes.get(email)
    if not entry or entry['code'] != code:
        return jsonify({'message': 'Invalid verification code'}), 400
        
    if entry['expires_at'] < datetime.utcnow():
        return jsonify({'message': 'Verification code expired'}), 400

    # Check if email already registered
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    # Create new user
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(email=email, password=hashed.decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()
    
    login_user(new_user)

    # Clean up verification code
    verification_codes.pop(email, None)

    return jsonify({'message': 'Account created successfully'}), 201




@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    remember = data.get('remember', False)  

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.checkpw(password.encode('utf-8'), user.password.encode('utf-8')):
        logout_user()
        login_user(user, remember=remember)
        return jsonify({'message': 'Login successful'}), 200

    return jsonify({'message': 'Invalid credentials. Try again.'}), 401




@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200




@auth_bp.route('/send-code', methods=['POST'])
def send_code():
    from app import mail
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email is required'}), 400

    # Check if email already registered
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Store code
    verification_codes[email] = {
        'code': code,
        'expires_at': expires_at
    }

    try:
        # Send email
        msg = Message(
            'Your Verification Code',
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[email]
        )
        msg.body = f'Your verification code is: {code} (valid for 5 minutes)'
        mail.send(msg)
        return jsonify({'message': 'Verification code sent'}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return jsonify({'message': 'Failed to send verification code. Please try again.'}), 500