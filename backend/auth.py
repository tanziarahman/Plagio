from flask import Blueprint, request, jsonify, make_response
from flask_login import login_user, logout_user, login_required,LoginManager
from models import db, User
import bcrypt

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

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    
    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 409

    
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    new_user = User(email=email, password=hashed.decode('utf-8'))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Account created successfully. Please log in.'}), 201




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