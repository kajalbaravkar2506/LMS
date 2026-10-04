import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))

class Config:
    """Base Configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'lms-super-secret-key-development-2026')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'lms-jwt-super-secret-key-development-2026')
    
    token_minutes = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_MINUTES', '1440'))
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=token_minutes)
    
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', str(16 * 1024 * 1024))) # 16 MB
    ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'py', 'java', 'cpp', 'c', 'sql', 'ppt', 'pptx'}

    # MySQL Configuration
    MYSQL_HOST = os.getenv('MYSQL_HOST', 'localhost')
    MYSQL_PORT = os.getenv('MYSQL_PORT', '3306')
    MYSQL_USER = os.getenv('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.getenv('MYSQL_PASSWORD', '')
    MYSQL_DATABASE = os.getenv('MYSQL_DATABASE', 'lms_database')

    # Construct SQLAlchemy Database URI
    custom_db_url = os.getenv('DATABASE_URL')
    if custom_db_url:
        SQLALCHEMY_DATABASE_URI = custom_db_url
    elif os.getenv('USE_MYSQL', 'true').lower() == 'true':
        import socket
        mysql_available = False
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)
            result = sock.connect_ex((MYSQL_HOST, int(MYSQL_PORT)))
            if result == 0:
                mysql_available = True
            sock.close()
        except Exception:
            mysql_available = False

        if mysql_available:
            if MYSQL_PASSWORD:
                SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
            else:
                SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{MYSQL_USER}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
        else:
            SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'lms.db')}"
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'lms.db')}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        'pool_recycle': 280,
        'pool_pre_ping': True,
    }

class DevConfig(Config):
    DEBUG = True

class ProdConfig(Config):
    DEBUG = False
    TESTING = False

config_by_name = {
    'development': DevConfig,
    'production': ProdConfig,
    'default': DevConfig
}
