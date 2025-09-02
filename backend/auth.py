from flask import Blueprint, request, jsonify, make_response, current_app
from flask_login import login_user, logout_user, login_required, LoginManager, current_user
from models import db, User
import bcrypt
import random
import string
from flask_mail import Message, Mail
from datetime import datetime, timedelta
import dns.resolver
from socket import gaierror
import re

verification_codes = {}  

auth_bp = Blueprint('auth', __name__)

# Initialize LoginManager
login_manager = LoginManager()
login_manager.login_view = 'auth.login'  

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@login_manager.unauthorized_handler
def unauthorized_callback():
    return make_response(jsonify({'message': 'Unauthorized'}), 401)

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    # Check if current_user is authenticated and loaded properly
    if current_user.is_authenticated:
        return jsonify({
            'email': current_user.email,
            'id': current_user.id
        }), 200
    else:
        return jsonify({'message': 'User not authenticated'}), 401

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
        login_user(user, remember=remember)  
        return jsonify({'message': 'Login successful'}), 200

    return jsonify({'message': 'Invalid credentials. Try again.'}), 401

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200



def domain_exists(email):
    """Validate email format and domain"""
    if not email or '@' not in email:
        return False
        
    # Basic email format validation
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        return False
    
    domain = email.split('@')[-1]
    
    try:
        # Check MX records (mail server existence)
        mx_records = dns.resolver.resolve(domain, 'MX')
        if not mx_records:
            return False
            
        # verify the domain itself exists
        dns.resolver.resolve(domain, 'A')
        return True
    except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers, gaierror):
        return False
    except dns.exception.DNSException:
        return False



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
    
    
    if not domain_exists(email):
        return jsonify({
            'success': False,
            'message': 'Please enter an email with a valid domain'
        }), 400
    

    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    expires_at = datetime.utcnow() + timedelta(minutes=5)
    
    # Store code
    verification_codes[email] = {
        'code': code,
        'expires_at': expires_at
    }

    try:
        msg = Message(
            'Your Verification Code',
            sender=current_app.config['MAIL_DEFAULT_SENDER'],
            recipients=[email]
        )
        msg.body = f'Thank you for using Plagio! Your email verification code is: {code} (valid for 5 minutes)'
        mail.send(msg)
        return jsonify({'message': 'Verification code sent'}), 200
    except Exception as e:
        current_app.logger.error(f"Failed to send email: {str(e)}")
        return jsonify({'message': 'Failed to send verification code. Please try again.'}), 500
    