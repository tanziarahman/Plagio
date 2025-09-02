from flask import Flask
from flask_mail import Mail, Message
from auth import auth_bp
from models import db
from flask_cors import CORS
import os
from routes import all_blueprints
from auth import login_manager

app = Flask(__name__)
app.secret_key = 'supersecretkey123' 


app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///plagio.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True  
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_PERMANENT'] = False

app.config['UPLOAD_FOLDER'] = 'uploads'


app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'plagio.plagiarismchecker@gmail.com'
app.config['MAIL_PASSWORD'] = 'omottvhuriyhrxyd'  # Use App Password for Gmail
app.config['MAIL_DEFAULT_SENDER']='plagio.plagiarismchecker@gmail.com'

mail = Mail(app)



CORS(app, 
     resources={r"/*": {"origins": "http://localhost:3000"}},
     supports_credentials=True,
     allow_headers=["Content-Type"])


db.init_app(app)


login_manager.init_app(app)


app.register_blueprint(auth_bp)


for bp in all_blueprints:
    app.register_blueprint(bp)


with app.app_context():
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    db.create_all()
    
    

if __name__ == '__main__':
    app.run(debug=True)
