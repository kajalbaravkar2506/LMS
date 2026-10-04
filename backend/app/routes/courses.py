import os
from flask import Blueprint, request, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt
from app.models import db, Course, CourseMaterial, Enrollment, Faculty, User, Student
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.utils.response import success_response, error_response
from app.utils.file_upload import save_uploaded_file

courses_bp = Blueprint('courses', __name__, url_prefix='/api/courses')

@courses_bp.route('', methods=['GET'])
@jwt_required()
def get_courses():
    search = request.args.get('search', '').strip()
    department = request.args.get('department', '').strip()
    faculty_id = request.args.get('faculty_id')
    my_courses_only = request.args.get('my_courses', '').lower() == 'true'

    user = get_current_user_object()
    query = Course.query

    if search:
        query = query.filter(
            (Course.course_name.ilike(f'%{search}%')) | 
            (Course.course_code.ilike(f'%{search}%')) |
            (Course.description.ilike(f'%{search}%'))
        )

    if department:
        query = query.filter(Course.department == department)

    if faculty_id:
        query = query.filter(Course.faculty_id == int(faculty_id))

    if my_courses_only and user:
        if user.role == 'student' and user.student_profile:
            enrolled_ids = [e.course_id for e in Enrollment.query.filter_by(student_id=user.student_profile.id, status='active').all()]
            query = query.filter(Course.id.in_(enrolled_ids))
        elif user.role == 'faculty' and user.faculty_profile:
            query = query.filter(Course.faculty_id == user.faculty_profile.id)

    courses = query.order_by(Course.course_code.asc()).all()

    # If student, attach enrollment status
    enrolled_course_ids = set()
    if user and user.role == 'student' and user.student_profile:
        active_enrollments = Enrollment.query.filter_by(student_id=user.student_profile.id, status='active').all()
        enrolled_course_ids = {e.course_id for e in active_enrollments}

    result = []
    for c in courses:
        data = c.to_dict(include_faculty=True, include_counts=True)
        if user and user.role == 'student':
            data['is_enrolled'] = c.id in enrolled_course_ids
        result.append(data)

    return success_response(result)


@courses_bp.route('/<int:course_id>', methods=['GET'])
@jwt_required()
def get_course_detail(course_id: int):
    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    user = get_current_user_object()
    data = course.to_dict(include_faculty=True, include_counts=True)
    
    # Include materials, assignments, and quizzes
    data['materials'] = [m.to_dict() for m in course.materials.order_by(CourseMaterial.created_at.desc()).all()]
    data['assignments'] = [a.to_dict(include_submissions_count=True) for a in course.assignments.all()]
    
    is_student = (user and user.role == 'student')
    data['quizzes'] = [q.to_dict(include_questions=False, is_student_view=is_student) for q in course.quizzes.all()]

    if is_student and user.student_profile:
        enrollment = Enrollment.query.filter_by(course_id=course.id, student_id=user.student_profile.id).first()
        data['enrollment_status'] = enrollment.status if enrollment else None
        data['is_enrolled'] = enrollment.status == 'active' if enrollment else False

    return success_response(data)


@courses_bp.route('', methods=['POST'])
@role_required(['faculty', 'admin'])
def create_course():
    user = get_current_user_object()
    data = request.get_json() or {}

    course_code = data.get('course_code', '').strip().upper()
    course_name = data.get('course_name', '').strip()
    description = data.get('description', '').strip()
    syllabus = data.get('syllabus', '').strip()
    credits = int(data.get('credits', 3))
    semester = int(data.get('semester', 1))
    department = data.get('department', 'Computer Science').strip()

    if not course_code or not course_name:
        return error_response("Course code and course name are required", 400)

    if Course.query.filter_by(course_code=course_code).first():
        return error_response(f"Course with code {course_code} already exists", 409)

    # Determine faculty_id
    if user.role == 'faculty':
        if not user.faculty_profile:
            return error_response("Faculty profile not found for this account", 400)
        faculty_id = user.faculty_profile.id
    else: # admin
        faculty_id = data.get('faculty_id')
        if not faculty_id:
            return error_response("Faculty assignment is required for admin course creation", 400)
        if not Faculty.query.get(faculty_id):
            return error_response("Assigned faculty member not found", 404)

    try:
        course = Course(
            course_code=course_code,
            course_name=course_name,
            description=description,
            syllabus=syllabus,
            credits=credits,
            semester=semester,
            department=department,
            faculty_id=faculty_id
        )
        db.session.add(course)
        db.session.commit()
        return success_response(course.to_dict(include_faculty=True), "Course created successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create course: {str(e)}", 500)


@courses_bp.route('/<int:course_id>', methods=['PUT'])
@role_required(['faculty', 'admin'])
def update_course(course_id: int):
    user = get_current_user_object()
    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    # Faculty can only update their own courses
    if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
        return error_response("You are only authorized to update courses you teach", 403)

    data = request.get_json() or {}
    if 'course_name' in data and data['course_name'].strip():
        course.course_name = data['course_name'].strip()
    if 'description' in data:
        course.description = data['description']
    if 'syllabus' in data:
        course.syllabus = data['syllabus']
    if 'credits' in data:
        course.credits = int(data['credits'])
    if 'semester' in data:
        course.semester = int(data['semester'])
    if 'department' in data and data['department'].strip():
        course.department = data['department'].strip()

    if user.role == 'admin' and 'faculty_id' in data:
        faculty = Faculty.query.get(data['faculty_id'])
        if not faculty:
            return error_response("Specified faculty member does not exist", 404)
        course.faculty_id = faculty.id

    try:
        db.session.commit()
        return success_response(course.to_dict(include_faculty=True), "Course updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update course: {str(e)}", 500)


@courses_bp.route('/<int:course_id>', methods=['DELETE'])
@role_required(['faculty', 'admin'])
def delete_course(course_id: int):
    user = get_current_user_object()
    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
        return error_response("You are only authorized to delete courses you teach", 403)

    try:
        db.session.delete(course)
        db.session.commit()
        return success_response(None, "Course deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete course: {str(e)}", 500)


@courses_bp.route('/<int:course_id>/materials', methods=['GET'])
@jwt_required()
def get_materials(course_id: int):
    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)
    materials = course.materials.order_by(CourseMaterial.created_at.desc()).all()
    return success_response([m.to_dict() for m in materials])


@courses_bp.route('/<int:course_id>/materials', methods=['POST'])
@role_required(['faculty', 'admin'])
def upload_material(course_id: int):
    user = get_current_user_object()
    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
        return error_response("You can only upload materials to your own courses", 403)

    title = request.form.get('title', '').strip()
    description = request.form.get('description', '').strip()
    material_type = request.form.get('material_type', 'document')
    external_url = request.form.get('file_url', '').strip()

    if not title:
        return error_response("Material title is required", 400)

    file_url = external_url
    if 'file' in request.files and request.files['file'].filename:
        try:
            file_url = save_uploaded_file(request.files['file'], subfolder='materials')
        except Exception as e:
            return error_response(f"File upload error: {str(e)}", 400)

    if not file_url:
        return error_response("Please upload a file or provide a file URL", 400)

    try:
        material = CourseMaterial(
            course_id=course.id,
            title=title,
            description=description,
            file_url=file_url,
            material_type=material_type,
            uploaded_by=user.id
        )
        db.session.add(material)
        db.session.commit()
        return success_response(material.to_dict(), "Material uploaded successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to save material: {str(e)}", 500)


@courses_bp.route('/materials/<int:material_id>', methods=['DELETE'])
@role_required(['faculty', 'admin'])
def delete_material(material_id: int):
    user = get_current_user_object()
    material = CourseMaterial.query.get(material_id)
    if not material:
        return error_response("Material not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or material.course.faculty_id != user.faculty_profile.id):
        return error_response("You can only delete materials from your own courses", 403)

    try:
        db.session.delete(material)
        db.session.commit()
        return success_response(None, "Material deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete material: {str(e)}", 500)


@courses_bp.route('/<int:course_id>/students', methods=['GET'])
@role_required(['faculty', 'admin'])
def get_enrolled_students(course_id: int):
    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    enrollments = Enrollment.query.filter_by(course_id=course.id, status='active').all()
    result = []
    for enr in enrollments:
        stu_dict = enr.student.to_dict() if enr.student else {}
        stu_dict['enrollment_id'] = enr.id
        stu_dict['enrollment_date'] = enr.enrollment_date.isoformat()
        result.append(stu_dict)

    return success_response(result)
