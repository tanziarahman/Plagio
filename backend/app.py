from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from models import db
from flask_cors import CORS

app = Flask(__name__)
app.secret_key = 'supersecretkey123'  # Session encryption key

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///plagio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_PERMANENT'] = False


CORS(app, 
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type"])

# Initialize database
db.init_app(app)

# Create DB tables
with app.app_context():
    db.create_all()


@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the backend API!'})



if __name__ == '__main__':
    app.run(debug=True)