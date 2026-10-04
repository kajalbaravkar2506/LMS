from flask import Flask
from .auth import auth_bp
from .courses import courses_bp
from .enrollments import enrollments_bp
from .assignments import assignments_bp
from .submissions import submissions_bp
from .quizzes import quizzes_bp
from .attendance import attendance_bp
from .announcements import announcements_bp
from .notifications import notifications_bp
from .users import users_bp
from .reports import reports_bp
from .dashboard import dashboard_bp

def register_blueprints(app: Flask):
    app.register_blueprint(auth_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(enrollments_bp)
    app.register_blueprint(assignments_bp)
    app.register_blueprint(submissions_bp)
    app.register_blueprint(quizzes_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(announcements_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(dashboard_bp)
