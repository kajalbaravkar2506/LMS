from datetime import datetime, date
from flask import Blueprint, request
from sqlalchemy import func, case
from flask_jwt_extended import jwt_required
from app.models import db, Attendance, Course, Enrollment, Student
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.utils.response import success_response, error_response

attendance_bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@attendance_bp.route('', methods=['GET'])
@attendance_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_attendance_overview():
    user = get_current_user_object()
    course_id = request.args.get('course_id')

    if user.role == 'student':
        if not user.student_profile:
            return success_response([])

        # Calculate student course-wise percentage
        query = db.session.query(
            Course.id.label('course_id'),
            Course.course_code,
            Course.course_name,
            func.count(Attendance.id).label('total_classes'),
            func.count(case((Attendance.status == 'present', 1))).label('present_count'),
            func.count(case((Attendance.status == 'absent', 1))).label('absent_count'),
        ).join(Enrollment, (Course.id == Enrollment.course_id) & (Enrollment.student_id == user.student_profile.id) & (Enrollment.status == 'active'))\
         .outerjoin(Attendance, (Course.id == Attendance.course_id) & (Attendance.student_id == user.student_profile.id))

        if course_id:
            query = query.filter(Course.id == int(course_id))

        results = query.group_by(Course.id, Course.course_code, Course.course_name).all()

        summary = []
        for r in results:
            total = r.total_classes or 0
            present = r.present_count or 0
            absent = r.absent_count or 0
            pct = round((present * 100.0 / total), 2) if total > 0 else 100.0
            
            # Fetch log history
            logs = Attendance.query.filter_by(
                course_id=r.course_id,
                student_id=user.student_profile.id
            ).order_by(Attendance.date.desc()).all()

            summary.append({
                'course_id': r.course_id,
                'course_code': r.course_code,
                'course_name': r.course_name,
                'total_classes': total,
                'present_count': present,
                'absent_count': absent,
                'percentage': pct,
                'is_low_attendance': pct < 75.0,
                'history': [l.to_dict() for l in logs]
            })

        return success_response(summary)

    elif user.role in ['faculty', 'admin']:
        if not course_id:
            return error_response("Course ID is required for faculty attendance overview", 400)
        
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found", 404)

        # Get aggregate stats for all students in this course
        enrollments = Enrollment.query.filter_by(course_id=course.id, status='active').all()
        student_stats = []
        for enr in enrollments:
            stu = enr.student
            if not stu:
                continue
            total = Attendance.query.filter_by(course_id=course.id, student_id=stu.id).count()
            present = Attendance.query.filter_by(course_id=course.id, student_id=stu.id, status='present').count()
            absent = Attendance.query.filter_by(course_id=course.id, student_id=stu.id, status='absent').count()
            pct = round((present * 100.0 / total), 2) if total > 0 else 100.0

            student_stats.append({
                'student_id': stu.id,
                'student_number': stu.student_number,
                'student_name': stu.user.full_name if stu.user else '',
                'student_email': stu.user.email if stu.user else '',
                'total_classes': total,
                'present_count': present,
                'absent_count': absent,
                'percentage': pct,
                'is_low': pct < 75.0
            })

        return success_response({
            'course_id': course.id,
            'course_code': course.course_code,
            'course_name': course.course_name,
            'students': student_stats
        })


@attendance_bp.route('/course/<int:course_id>', methods=['GET'])
@role_required(['faculty', 'admin'])
def get_course_date_sheet(course_id: int):
    target_date_str = request.args.get('date', date.today().isoformat())
    try:
        target_date = datetime.strptime(target_date_str, '%Y-%m-%d').date()
    except Exception:
        target_date = date.today()

    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    # Get enrolled students
    enrollments = Enrollment.query.filter_by(course_id=course.id, status='active').all()
    records = []
    for enr in enrollments:
        stu = enr.student
        if not stu:
            continue
        att_record = Attendance.query.filter_by(
            course_id=course.id,
            student_id=stu.id,
            date=target_date
        ).first()

        records.append({
            'student_id': stu.id,
            'student_number': stu.student_number,
            'student_name': stu.user.full_name if stu.user else '',
            'status': att_record.status if att_record else 'present',
            'marked': att_record is not None
        })

    return success_response({
        'course_id': course.id,
        'course_code': course.course_code,
        'date': target_date.isoformat(),
        'roster': records
    })


@attendance_bp.route('/mark', methods=['POST'])
@role_required(['faculty', 'admin'])
def mark_attendance_batch():
    user = get_current_user_object()
    data = request.get_json() or {}

    course_id = data.get('course_id')
    date_str = data.get('date', date.today().isoformat())
    roster = data.get('records', []) or data.get('attendance_list', [])

    if not course_id or not roster:
        return error_response("Course ID and attendance records list are required", 400)

    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
        return error_response("You can only mark attendance for your assigned courses", 403)

    try:
        session_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except Exception:
        session_date = date.today()

    try:
        for item in roster:
            stu_id = item.get('student_id')
            status = item.get('status', 'present')
            if not stu_id or status not in ['present', 'absent']:
                continue

            record = Attendance.query.filter_by(
                course_id=course.id,
                student_id=stu_id,
                date=session_date
            ).first()

            if record:
                record.status = status
                record.marked_by = user.id
            else:
                record = Attendance(
                    course_id=course.id,
                    student_id=stu_id,
                    date=session_date,
                    status=status,
                    marked_by=user.id
                )
                db.session.add(record)

        db.session.commit()
        return success_response(None, f"Attendance saved successfully for {session_date.isoformat()}")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to record attendance: {str(e)}", 500)
