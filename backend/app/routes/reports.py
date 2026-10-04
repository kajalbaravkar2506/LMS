from flask import Blueprint, request
from app.middleware.auth_middleware import role_required
from app.services.report_service import (
    get_enrollment_report,
    get_student_performance_report,
    get_attendance_report,
    get_submission_report
)
from app.utils.response import success_response, error_response

reports_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@reports_bp.route('/enrollments', methods=['GET'])
@role_required(['admin', 'faculty'])
def enrollment_report():
    department = request.args.get('department')
    course_id = request.args.get('course_id')
    try:
        c_id = int(course_id) if course_id else None
        data = get_enrollment_report(department=department, course_id=c_id)
        return success_response(data)
    except Exception as e:
        return error_response(f"Failed to fetch enrollment report: {str(e)}", 500)


@reports_bp.route('/performance', methods=['GET'])
@role_required(['admin', 'faculty'])
def performance_report():
    department = request.args.get('department')
    course_id = request.args.get('course_id')
    try:
        c_id = int(course_id) if course_id else None
        data = get_student_performance_report(department=department, course_id=c_id)
        return success_response(data)
    except Exception as e:
        return error_response(f"Failed to fetch performance report: {str(e)}", 500)


@reports_bp.route('/attendance', methods=['GET'])
@role_required(['admin', 'faculty'])
def attendance_report():
    course_id = request.args.get('course_id')
    min_pct = request.args.get('min_percentage')
    max_pct = request.args.get('max_percentage')
    try:
        c_id = int(course_id) if course_id else None
        min_p = float(min_pct) if min_pct else None
        max_p = float(max_pct) if max_pct else None
        data = get_attendance_report(course_id=c_id, min_percentage=min_p, max_percentage=max_p)
        return success_response(data)
    except Exception as e:
        return error_response(f"Failed to fetch attendance report: {str(e)}", 500)


@reports_bp.route('/submissions', methods=['GET'])
@role_required(['admin', 'faculty'])
def submission_report():
    course_id = request.args.get('course_id')
    assignment_id = request.args.get('assignment_id')
    try:
        c_id = int(course_id) if course_id else None
        a_id = int(assignment_id) if assignment_id else None
        data = get_submission_report(course_id=c_id, assignment_id=a_id)
        return success_response(data)
    except Exception as e:
        return error_response(f"Failed to fetch submission report: {str(e)}", 500)
