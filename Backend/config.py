

from datetime import timedelta

class Config:
    SQLALCHEMY_DATABASE_URI = "mysql+pymysql://root:@localhost/doctor_db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = "super-secret-key-123"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)  # lasts 1 day