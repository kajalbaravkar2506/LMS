from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models import db, Enrollment, Student
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.services.enrollment_service import enroll_student_in_course
from app.utils.response import success_response, error_response

enrollments_bp = Blueprint('enrollments', __name__, url_prefix='/api/enrollments')

@enrollments_bp.route('', methods=['GET'])
@jwt_required()
def get_enrollments():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)

    status_filter = request.args.get('status')
    query = Enrollment.query

    if user.role == 'student':
        if not user.student_profile:
            return success_response([])
        query = query.filter_by(student_id=user.student_profile.id)
    elif user.role == 'faculty':
        if not user.faculty_profile:
            return success_response([])
        # Get enrollments for courses taught by faculty
        query = query.join(Enrollment.course).filter_by(faculty_id=user.faculty_profile.id)

    if status_filter:
        query = query.filter(Enrollment.status == status_filter)

    enrollments = query.order_by(Enrollment.enrollment_date.desc()).all()
    return success_response([e.to_dict(include_details=True) for e in enrollments])


@enrollments_bp.route('', methods=['POST'])
@role_required(['student', 'admin'])
def create_enrollment():
    user = get_current_user_object()
    data = request.get_json() or {}
    course_id = data.get('course_id')

    if not course_id:
        return error_response("Course ID is required", 400)

    if user.role == 'student':
        if not user.student_profile:
            return error_response("Student profile not found", 400)
        student_id = user.student_profile.id
    else: # admin enrolling a specific student
        student_id = data.get('student_id')
        if not student_id:
            return error_response("Student ID is required for admin enrollment", 400)

    try:
        enrollment = enroll_student_in_course(student_id=student_id, course_id=int(course_id))
        return success_response(enrollment.to_dict(include_details=True), "Enrolled successfully", 201)
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(f"Enrollment failed: {str(e)}", 500)


@enrollments_bp.route('/<int:enrollment_id>', methods=['DELETE'])
@jwt_required()
def drop_enrollment(enrollment_id: int):
    user = get_current_user_object()
    enrollment = Enrollment.query.get(enrollment_id)
    if not enrollment:
        return error_response("Enrollment record not found", 404)

    if user.role == 'student' and (not user.student_profile or enrollment.student_id != user.student_profile.id):
        return error_response("You are not authorized to drop this enrollment", 403)

    try:
        enrollment.status = 'dropped'
        db.session.commit()
        return success_response(None, "Course dropped successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to drop course: {str(e)}", 500)
