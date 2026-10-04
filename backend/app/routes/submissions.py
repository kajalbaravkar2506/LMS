from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models import db, Submission, Assignment, Enrollment
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.services.grading_service import grade_submission_transaction
from app.utils.response import success_response, error_response
from app.utils.file_upload import save_uploaded_file

submissions_bp = Blueprint('submissions', __name__, url_prefix='/api/submissions')

@submissions_bp.route('', methods=['GET'])
@jwt_required()
def get_submissions():
    user = get_current_user_object()
    assignment_id = request.args.get('assignment_id')
    
    query = Submission.query
    if assignment_id:
        query = query.filter_by(assignment_id=int(assignment_id))

    if user.role == 'student' and user.student_profile:
        query = query.filter_by(student_id=user.student_profile.id)
    elif user.role == 'faculty' and user.faculty_profile:
        query = query.join(Assignment).join(Assignment.course).filter_by(faculty_id=user.faculty_profile.id)

    submissions = query.order_by(Submission.submitted_at.desc()).all()
    return success_response([s.to_dict(include_student=True) for s in submissions])


@submissions_bp.route('', methods=['POST'])
@role_required(['student'])
def submit_assignment():
    user = get_current_user_object()
    if not user.student_profile:
        return error_response("Student profile not found", 400)

    assignment_id = request.form.get('assignment_id') or (request.json.get('assignment_id') if request.is_json else None)
    external_url = request.form.get('file_url') or (request.json.get('file_url') if request.is_json else None)

    if not assignment_id:
        return error_response("Assignment ID is required", 400)

    assignment = Assignment.query.get(assignment_id)
    if not assignment:
        return error_response("Assignment not found", 404)

    # Check student enrollment in this course
    enrolled = Enrollment.query.filter_by(course_id=assignment.course_id, student_id=user.student_profile.id, status='active').first()
    if not enrolled:
        return error_response("You must be enrolled in the course to submit assignments", 403)

    file_url = external_url
    if 'file' in request.files and request.files['file'].filename:
        try:
            file_url = save_uploaded_file(request.files['file'], subfolder='submissions')
        except Exception as e:
            return error_response(f"File upload failed: {str(e)}", 400)

    if not file_url:
        return error_response("Please upload a submission file or provide a valid file link", 400)

    # Check if submission already exists (update submission)
    submission = Submission.query.filter_by(assignment_id=assignment.id, student_id=user.student_profile.id).first()
    is_late = datetime.utcnow() > assignment.due_date

    try:
        if submission:
            if submission.status == 'graded':
                return error_response("This submission has already been graded and cannot be modified", 400)
            submission.file_url = file_url
            submission.submitted_at = datetime.utcnow()
            submission.status = 'late' if is_late else 'submitted'
        else:
            submission = Submission(
                assignment_id=assignment.id,
                student_id=user.student_profile.id,
                file_url=file_url,
                submitted_at=datetime.utcnow(),
                status='late' if is_late else 'submitted'
            )
            db.session.add(submission)

        db.session.commit()
        return success_response(submission.to_dict(include_student=True), "Assignment submitted successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to submit assignment: {str(e)}", 500)


@submissions_bp.route('/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_submission_detail(submission_id: int):
    user = get_current_user_object()
    submission = Submission.query.get(submission_id)
    if not submission:
        return error_response("Submission not found", 404)

    if user.role == 'student' and (not user.student_profile or submission.student_id != user.student_profile.id):
        return error_response("You are not authorized to view this submission", 403)

    return success_response(submission.to_dict(include_student=True))


@submissions_bp.route('/<int:submission_id>/grade', methods=['PUT', 'POST'])
@role_required(['faculty', 'admin'])
def grade_submission(submission_id: int):
    user = get_current_user_object()
    submission = Submission.query.get(submission_id)
    if not submission:
        return error_response("Submission not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or submission.assignment.course.faculty_id != user.faculty_profile.id):
        return error_response("You can only grade submissions for courses you teach", 403)

    data = request.get_json() or {}
    if 'marks' not in data:
        return error_response("Marks value is required", 400)

    try:
        marks = float(data['marks'])
        feedback = data.get('feedback', '')
        graded_sub = grade_submission_transaction(submission_id, marks=marks, feedback=feedback)
        return success_response(graded_sub.to_dict(include_student=True), "Submission graded successfully")
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(f"Grading failed: {str(e)}", 500)
