from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from models import db

app = Flask(__name__)
app.config.from_object(Config)

db.init_app(app)
CORS(app)
JWTManager(app)

from routes.auth import auth_bp
from routes.doctors import doctors_bp
from routes.appointments import appointments_bp
from routes.patients import patients_bp
from routes.admin import admin_bp

app.register_blueprint(auth_bp,         url_prefix='/api/auth')
app.register_blueprint(doctors_bp,      url_prefix='/api/doctors')
app.register_blueprint(appointments_bp, url_prefix='/api/appointments')
app.register_blueprint(patients_bp,     url_prefix='/api/patients')
app.register_blueprint(admin_bp,        url_prefix='/api/admin')

# this runs always — even with gunicorn
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)