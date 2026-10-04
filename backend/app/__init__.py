import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .config import config_by_name, Config
from .models import db
from .routes import register_blueprints
from .utils.response import error_response

def create_app(config_name='default'):
    app = Flask(__name__)
    app_config = config_by_name.get(config_name, Config)
    app.config.from_object(app_config)

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}, r"/uploads/*": {"origins": "*"}})

    # Ensure Uploads Directory Exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    for sub in ['materials', 'submissions', 'misc']:
        os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], sub), exist_ok=True)

    # Initialize Extensions
    db.init_app(app)
    jwt = JWTManager(app)

    # JWT Error handlers
    @jwt.unauthorized_loader
    def unauthorized_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Missing or invalid authentication token',
            'errors': str(callback)
        }), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'message': 'Authentication token has expired. Please log in again.',
            'code': 'token_expired'
        }), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(callback):
        return jsonify({
            'success': False,
            'message': 'Invalid authentication token',
            'errors': str(callback)
        }), 401

    # Serve static uploaded files
    @app.route('/uploads/<path:filename>', methods=['GET'])
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # API Health Check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'database': 'connected',
            'version': '1.0.0'
        }), 200

    # Register all API Route Blueprints
    register_blueprints(app)

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found(e):
        return error_response("The requested API resource was not found", 404)

    @app.errorhandler(500)
    def internal_server_error(e):
        return error_response(f"Internal server error: {str(e)}", 500)

    return app
