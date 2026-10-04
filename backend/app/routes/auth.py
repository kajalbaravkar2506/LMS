from flask import Blueprint, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User, Student
from app.utils.response import success_response, error_response
from app.middleware.auth_middleware import get_current_user_object

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    department = data.get('department', 'Computer Science').strip()
    year = int(data.get('year', 1))
    semester = int(data.get('semester', 1))
    student_number = data.get('student_number', '').strip()

    if not full_name or not email or not password:
        return error_response("Full name, email, and password are required", 400)

    if len(password) < 6:
        return error_response("Password must be at least 6 characters long", 400)

    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists", 409)

    # Generate student number if not provided
    if not student_number:
        count = Student.query.count() + 1
        student_number = f"STU{datetime.now().year}{count:04d}"

    try:
        user = User(
            full_name=full_name,
            email=email,
            role='student',
            phone=data.get('phone'),
            profile_image='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
            is_active=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        student = Student(
            user_id=user.id,
            student_number=student_number,
            department=department,
            year=year,
            semester=semester
        )
        db.session.add(student)
        db.session.commit()

        # Create JWT Token
        additional_claims = {
            'role': user.role,
            'email': user.email,
            'full_name': user.full_name,
            'student_id': student.id
        }
        access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)

        return success_response({
            'token': access_token,
            'user': user.to_dict(),
            'redirect_url': '/student/dashboard'
        }, "Registration successful", 201)

    except Exception as e:
        db.session.rollback()
        return error_response(f"Registration failed: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return error_response("Email and password are required", 400)

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return error_response("Invalid email or password", 401)

    if not user.is_active:
        return error_response("Your account has been deactivated. Please contact the administrator.", 403)

    additional_claims = {
        'role': user.role,
        'email': user.email,
        'full_name': user.full_name
    }
    if user.role == 'student' and user.student_profile:
        additional_claims['student_id'] = user.student_profile.id
    elif user.role == 'faculty' and user.faculty_profile:
        additional_claims['faculty_id'] = user.faculty_profile.id

    access_token = create_access_token(identity=str(user.id), additional_claims=additional_claims)

    redirect_url = f"/{user.role}/dashboard"

    return success_response({
        'token': access_token,
        'user': user.to_dict(),
        'redirect_url': redirect_url
    }, "Login successful")


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user_profile():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)
    return success_response(user.to_dict())


@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)

    data = request.get_json() or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        user.phone = data['phone']
    if 'profile_image' in data:
        user.profile_image = data['profile_image']

    if user.role == 'student' and user.student_profile:
        if 'department' in data:
            user.student_profile.department = data['department']
        if 'year' in data:
            user.student_profile.year = int(data['year'])
        if 'semester' in data:
            user.student_profile.semester = int(data['semester'])

    elif user.role == 'faculty' and user.faculty_profile:
        if 'department' in data:
            user.faculty_profile.department = data['department']
        if 'designation' in data:
            user.faculty_profile.designation = data['designation']

    try:
        db.session.commit()
        return success_response(user.to_dict(), "Profile updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update profile: {str(e)}", 500)


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)

    data = request.get_json() or {}
    old_password = data.get('old_password', '')
    new_password = data.get('new_password', '')

    if not old_password or not new_password:
        return error_response("Old and new passwords are required", 400)

    if not user.check_password(old_password):
        return error_response("Incorrect current password", 400)

    if len(new_password) < 6:
        return error_response("New password must be at least 6 characters", 400)

    try:
        user.set_password(new_password)
        db.session.commit()
        return success_response(None, "Password updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update password: {str(e)}", 500)


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    return success_response(None, "Logged out successfully")
