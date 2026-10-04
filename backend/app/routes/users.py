from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models import db, User, Faculty, Student
from app.middleware.auth_middleware import role_required
from app.utils.response import success_response, error_response

users_bp = Blueprint('users', __name__, url_prefix='/api/users')

@users_bp.route('', methods=['GET'])
@role_required(['admin'])
def get_all_users():
    role = request.args.get('role')
    search = request.args.get('search', '').strip()
    is_active = request.args.get('is_active')

    query = User.query

    if role in ['student', 'faculty', 'admin']:
        query = query.filter(User.role == role)

    if is_active is not None:
        query = query.filter(User.is_active == (is_active.lower() == 'true'))

    if search:
        query = query.filter(
            (User.full_name.ilike(f'%{search}%')) | 
            (User.email.ilike(f'%{search}%')) |
            (User.phone.ilike(f'%{search}%'))
        )

    users = query.order_by(User.id.asc()).all()
    return success_response([u.to_dict(include_profile=True) for u in users])


@users_bp.route('/faculty-list', methods=['GET'])
@jwt_required()
def get_faculty_dropdown():
    faculty = Faculty.query.all()
    return success_response([f.to_dict() for f in faculty])


@users_bp.route('/faculty', methods=['POST'])
@role_required(['admin'])
def create_faculty_user():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', 'Password123!')
    department = data.get('department', 'Computer Science').strip()
    designation = data.get('designation', 'Assistant Professor').strip()
    faculty_number = data.get('faculty_number', '').strip()

    if not full_name or not email:
        return error_response("Full name and email are required", 400)

    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists", 409)

    if not faculty_number:
        count = Faculty.query.count() + 1
        faculty_number = f"FAC{count:03d}"

    try:
        user = User(
            full_name=full_name,
            email=email,
            role='faculty',
            phone=data.get('phone'),
            profile_image=data.get('profile_image', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
            is_active=True
        )
        user.set_password(password)
        db.session.add(user)
        db.session.flush()

        faculty = Faculty(
            user_id=user.id,
            faculty_number=faculty_number,
            department=department,
            designation=designation
        )
        db.session.add(faculty)
        db.session.commit()

        return success_response(user.to_dict(include_profile=True), "Faculty account created successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create faculty: {str(e)}", 500)


@users_bp.route('/student', methods=['POST'])
@role_required(['admin'])
def create_student_user():
    data = request.get_json() or {}
    full_name = data.get('full_name', '').strip()
    email = data.get('email', '').strip().lower()
    password = data.get('password', 'Password123!')
    department = data.get('department', 'Computer Science').strip()
    year = int(data.get('year', 1))
    semester = int(data.get('semester', 1))
    student_number = data.get('student_number', '').strip()

    if not full_name or not email:
        return error_response("Full name and email are required", 400)

    if User.query.filter_by(email=email).first():
        return error_response("An account with this email already exists", 409)

    if not student_number:
        count = Student.query.count() + 1
        student_number = f"STU{datetime.now().year}{count:04d}"

    try:
        user = User(
            full_name=full_name,
            email=email,
            role='student',
            phone=data.get('phone'),
            profile_image=data.get('profile_image', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'),
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

        return success_response(user.to_dict(include_profile=True), "Student account created successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create student: {str(e)}", 500)


@users_bp.route('/<int:user_id>', methods=['PUT'])
@role_required(['admin'])
def update_user_by_admin(user_id: int):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)

    data = request.get_json() or {}
    if 'full_name' in data and data['full_name'].strip():
        user.full_name = data['full_name'].strip()
    if 'phone' in data:
        user.phone = data['phone']
    if 'is_active' in data:
        user.is_active = bool(data['is_active'])

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
        return success_response(user.to_dict(include_profile=True), "User updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update user: {str(e)}", 500)


@users_bp.route('/<int:user_id>/status', methods=['PUT'])
@role_required(['admin'])
def toggle_user_status(user_id: int):
    user = User.query.get(user_id)
    if not user:
        return error_response("User not found", 404)

    try:
        user.is_active = not user.is_active
        db.session.commit()
        state = "activated" if user.is_active else "deactivated"
        return success_response({'is_active': user.is_active}, f"User successfully {state}")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to change user status: {str(e)}", 500)
