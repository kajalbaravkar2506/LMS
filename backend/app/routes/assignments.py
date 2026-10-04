from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models import db, Assignment, Course, Submission, Notification, Enrollment
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.utils.response import success_response, error_response

assignments_bp = Blueprint('assignments', __name__, url_prefix='/api/assignments')

@assignments_bp.route('', methods=['GET'])
@jwt_required()
def get_assignments():
    user = get_current_user_object()
    course_id = request.args.get('course_id')
    status_filter = request.args.get('status') # 'pending', 'submitted', 'graded'

    query = Assignment.query

    if course_id:
        query = query.filter(Assignment.course_id == int(course_id))

    if user.role == 'faculty' and user.faculty_profile:
        # Filter assignments for courses taught by this faculty member
        query = query.join(Course).filter(Course.faculty_id == user.faculty_profile.id)
    elif user.role == 'student' and user.student_profile:
        # Filter assignments for courses in which student is enrolled
        enrolled_ids = [e.course_id for e in Enrollment.query.filter_by(student_id=user.student_profile.id, status='active').all()]
        query = query.filter(Assignment.course_id.in_(enrolled_ids))

    assignments = query.order_by(Assignment.due_date.asc()).all()

    result = []
    for a in assignments:
        a_dict = a.to_dict(include_submissions_count=True)
        if user.role == 'student' and user.student_profile:
            sub = Submission.query.filter_by(assignment_id=a.id, student_id=user.student_profile.id).first()
            a_dict['submission'] = sub.to_dict(include_student=False) if sub else None
            a_dict['is_submitted'] = sub is not None
            a_dict['is_graded'] = sub.status == 'graded' if sub else False

            # Filter by status if requested
            if status_filter == 'pending' and sub is not None:
                continue
            if status_filter == 'submitted' and (not sub or sub.status == 'graded'):
                continue
            if status_filter == 'graded' and (not sub or sub.status != 'graded'):
                continue

        result.append(a_dict)

    return success_response(result)


@assignments_bp.route('/<int:assignment_id>', methods=['GET'])
@jwt_required()
def get_assignment_detail(assignment_id: int):
    user = get_current_user_object()
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return error_response("Assignment not found", 404)

    data = assignment.to_dict(include_submissions_count=True)
    if user.role == 'student' and user.student_profile:
        sub = Submission.query.filter_by(assignment_id=assignment.id, student_id=user.student_profile.id).first()
        data['submission'] = sub.to_dict(include_student=False) if sub else None
        data['is_submitted'] = sub is not None

    return success_response(data)


@assignments_bp.route('', methods=['POST'])
@role_required(['faculty', 'admin'])
def create_assignment():
    user = get_current_user_object()
    data = request.get_json() or {}

    course_id = data.get('course_id')
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    due_date_str = data.get('due_date')
    max_marks = float(data.get('max_marks', 100.0))

    if not course_id or not title or not due_date_str:
        return error_response("Course ID, title, and due date are required", 400)

    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
        return error_response("You are only allowed to create assignments for your own courses", 403)

    try:
        due_date = datetime.fromisoformat(due_date_str.replace('Z', '+00:00'))
    except Exception:
        return error_response("Invalid due date format. Use ISO format (YYYY-MM-DDTHH:MM)", 400)

    if max_marks < 0:
        return error_response("Maximum marks cannot be negative", 400)

    try:
        assignment = Assignment(
            course_id=course.id,
            title=title,
            description=description,
            due_date=due_date,
            max_marks=max_marks,
            created_by=user.id
        )
        db.session.add(assignment)
        db.session.flush()

        # Notify enrolled students
        enrolled_students = Enrollment.query.filter_by(course_id=course.id, status='active').all()
        for enr in enrolled_students:
            if enr.student:
                notif = Notification(
                    user_id=enr.student.user_id,
                    title="New Assignment Posted",
                    message=f'New assignment "{title}" posted in {course.course_code}. Due: {due_date.strftime("%b %d, %Y %I:%M %p")}',
                    type="assignment"
                )
                db.session.add(notif)

        db.session.commit()
        return success_response(assignment.to_dict(), "Assignment created successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create assignment: {str(e)}", 500)


@assignments_bp.route('/<int:assignment_id>', methods=['PUT'])
@role_required(['faculty', 'admin'])
def update_assignment(assignment_id: int):
    user = get_current_user_object()
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return error_response("Assignment not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or assignment.course.faculty_id != user.faculty_profile.id):
        return error_response("You can only modify assignments in your own courses", 403)

    data = request.get_json() or {}
    if 'title' in data and data['title'].strip():
        assignment.title = data['title'].strip()
    if 'description' in data:
        assignment.description = data['description']
    if 'max_marks' in data:
        if float(data['max_marks']) < 0:
            return error_response("Maximum marks cannot be negative", 400)
        assignment.max_marks = float(data['max_marks'])
    if 'due_date' in data and data['due_date']:
        try:
            assignment.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        except Exception:
            return error_response("Invalid due date format", 400)

    try:
        db.session.commit()
        return success_response(assignment.to_dict(), "Assignment updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update assignment: {str(e)}", 500)


@assignments_bp.route('/<int:assignment_id>', methods=['DELETE'])
@role_required(['faculty', 'admin'])
def delete_assignment(assignment_id: int):
    user = get_current_user_object()
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return error_response("Assignment not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or assignment.course.faculty_id != user.faculty_profile.id):
        return error_response("You can only delete assignments in your own courses", 403)

    try:
        db.session.delete(assignment)
        db.session.commit()
        return success_response(None, "Assignment deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete assignment: {str(e)}", 500)


@assignments_bp.route('/<int:assignment_id>/submissions', methods=['GET'])
@role_required(['faculty', 'admin'])
def get_assignment_submissions(assignment_id: int):
    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return error_response("Assignment not found", 404)

    submissions = assignment.submissions.order_by(Submission.submitted_at.desc()).all()
    return success_response([s.to_dict(include_student=True) for s in submissions])
