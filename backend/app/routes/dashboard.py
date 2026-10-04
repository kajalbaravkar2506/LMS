from datetime import datetime
from flask import Blueprint
from sqlalchemy import func, case
from flask_jwt_extended import jwt_required
from app.models import (
    db, User, Student, Faculty, Course, Enrollment,
    Assignment, Submission, Quiz, QuizAttempt, Attendance, Announcement
)
from app.middleware.auth_middleware import get_current_user_object
from app.utils.response import success_response, error_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_dashboard_stats():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)

    if user.role == 'student':
        stu = user.student_profile
        if not stu:
            return error_response("Student profile not found", 404)

        # 1. Enrolled Courses
        enrollments = Enrollment.query.filter_by(student_id=stu.id, status='active').all()
        enrolled_course_ids = [e.course_id for e in enrollments]
        courses_count = len(enrolled_course_ids)

        # 2. Assignments
        all_course_assignments = Assignment.query.filter(Assignment.course_id.in_(enrolled_course_ids)).all() if enrolled_course_ids else []
        assignment_ids = [a.id for a in all_course_assignments]
        
        submissions = Submission.query.filter(
            Submission.student_id == stu.id,
            Submission.assignment_id.in_(assignment_ids)
        ).all() if assignment_ids else []
        submitted_assignment_ids = {s.assignment_id for s in submissions}
        
        pending_assignments = [a for a in all_course_assignments if a.id not in submitted_assignment_ids and a.due_date >= datetime.utcnow()]
        completed_assignments_count = len(submissions)

        # 3. Average Grade
        graded_submissions = [s for s in submissions if s.status == 'graded' and s.marks is not None]
        avg_assignment_pct = 0.0
        if graded_submissions:
            pct_list = []
            for s in graded_submissions:
                max_m = float(s.assignment.max_marks) if s.assignment and s.assignment.max_marks else 100.0
                pct_list.append((float(s.marks) / max_m) * 100.0)
            avg_assignment_pct = round(sum(pct_list) / len(pct_list), 1)

        # 4. Quizzes
        quiz_attempts = QuizAttempt.query.filter_by(student_id=stu.id).filter(QuizAttempt.submitted_at.isnot(None)).all()
        avg_quiz_pct = 0.0
        if quiz_attempts:
            qz_pct_list = []
            for qa in quiz_attempts:
                max_m = float(qa.quiz.max_marks) if qa.quiz and qa.quiz.max_marks else 20.0
                qz_pct_list.append((float(qa.score or 0) / max_m) * 100.0)
            avg_quiz_pct = round(sum(qz_pct_list) / len(qz_pct_list), 1)

        # 5. Attendance
        total_att = Attendance.query.filter_by(student_id=stu.id).count()
        present_att = Attendance.query.filter_by(student_id=stu.id, status='present').count()
        attendance_pct = round((present_att * 100.0 / total_att), 1) if total_att > 0 else 100.0

        # 6. Upcoming deadlines
        upcoming = []
        for a in sorted(pending_assignments, key=lambda x: x.due_date)[:5]:
            upcoming.append({
                'id': a.id,
                'title': a.title,
                'course_code': a.course.course_code if a.course else '',
                'due_date': a.due_date.isoformat(),
                'type': 'assignment'
            })

        # 7. Recent Announcements
        recent_announcements = Announcement.query.filter(
            (Announcement.course_id.in_(enrolled_course_ids)) | (Announcement.course_id.is_(None))
        ).order_by(Announcement.created_at.desc()).limit(4).all() if enrolled_course_ids else Announcement.query.filter_by(course_id=None).limit(4).all()

        # 8. Charts data: Grade Breakdown per course
        course_grades_chart = []
        for e in enrollments:
            c = e.course
            if not c:
                continue
            # Calculate course avg grade
            c_subs = [s for s in graded_submissions if s.assignment and s.assignment.course_id == c.id]
            c_grade = 0.0
            if c_subs:
                c_grade = round(sum([(float(s.marks) / float(s.assignment.max_marks or 100.0)) * 100 for s in c_subs]) / len(c_subs), 1)
            
            c_att_total = Attendance.query.filter_by(student_id=stu.id, course_id=c.id).count()
            c_att_present = Attendance.query.filter_by(student_id=stu.id, course_id=c.id, status='present').count()
            c_att_pct = round((c_att_present * 100.0 / c_att_total), 1) if c_att_total > 0 else 100.0

            course_grades_chart.append({
                'course_code': c.course_code,
                'course_name': c.course_name,
                'grade_percentage': c_grade,
                'attendance_percentage': c_att_pct
            })

        return success_response({
            'role': 'student',
            'summary': {
                'enrolled_courses_count': courses_count,
                'pending_assignments_count': len(pending_assignments),
                'completed_assignments_count': completed_assignments_count,
                'average_grade_percentage': avg_assignment_pct,
                'average_quiz_percentage': avg_quiz_pct,
                'attendance_percentage': attendance_pct,
            },
            'upcoming_deadlines': upcoming,
            'recent_announcements': [a.to_dict() for a in recent_announcements],
            'course_progress_charts': course_grades_chart
        })

    elif user.role == 'faculty':
        fac = user.faculty_profile
        if not fac:
            return error_response("Faculty profile not found", 404)

        courses = Course.query.filter_by(faculty_id=fac.id).all()
        course_ids = [c.id for c in courses]

        # 1. Total Enrolled Students
        enrolled_students_count = Enrollment.query.filter(
            Enrollment.course_id.in_(course_ids),
            Enrollment.status == 'active'
        ).count() if course_ids else 0

        # 2. Total Assignments & Quizzes
        total_assignments = Assignment.query.filter(Assignment.course_id.in_(course_ids)).count() if course_ids else 0
        total_quizzes = Quiz.query.filter(Quiz.course_id.in_(course_ids)).count() if course_ids else 0

        # 3. Pending Submissions to Grade
        pending_grading_count = Submission.query.join(Assignment).filter(
            Assignment.course_id.in_(course_ids),
            Submission.status.in_(['submitted', 'late'])
        ).count() if course_ids else 0

        # 4. Recent Submissions Queue
        recent_submissions = Submission.query.join(Assignment).filter(
            Assignment.course_id.in_(course_ids)
        ).order_by(Submission.submitted_at.desc()).limit(6).all() if course_ids else []

        # 5. Course breakdown chart
        course_analytics = []
        for c in courses:
            enr_count = Enrollment.query.filter_by(course_id=c.id, status='active').count()
            sub_count = Submission.query.join(Assignment).filter(Assignment.course_id == c.id).count()
            graded_count = Submission.query.join(Assignment).filter(Assignment.course_id == c.id, Submission.status == 'graded').count()
            course_analytics.append({
                'course_code': c.course_code,
                'course_name': c.course_name,
                'enrolled_students': enr_count,
                'total_submissions': sub_count,
                'graded_submissions': graded_count
            })

        return success_response({
            'role': 'faculty',
            'summary': {
                'courses_count': len(courses),
                'total_students_count': enrolled_students_count,
                'pending_grading_count': pending_grading_count,
                'total_assignments_count': total_assignments,
                'total_quizzes_count': total_quizzes
            },
            'recent_submissions': [s.to_dict(include_student=True) for s in recent_submissions],
            'course_analytics': course_analytics
        })

    elif user.role == 'admin':
        total_students = Student.query.count()
        total_faculty = Faculty.query.count()
        total_courses = Course.query.count()
        total_enrollments = Enrollment.query.filter_by(status='active').count()
        total_assignments = Assignment.query.count()
        total_quizzes = Quiz.query.count()
        total_submissions = Submission.query.count()

        # Department distribution
        dept_stats = db.session.query(
            Student.department,
            func.count(Student.id)
        ).group_by(Student.department).all()

        dept_chart = [{
            'department': d[0] or 'General',
            'students_count': d[1]
        } for d in dept_stats]

        # Courses enrollment distribution
        course_dist = db.session.query(
            Course.course_code,
            Course.course_name,
            func.count(Enrollment.id).label('students_count')
        ).outerjoin(Enrollment, (Course.id == Enrollment.course_id) & (Enrollment.status == 'active'))\
         .group_by(Course.id, Course.course_code, Course.course_name).all()

        courses_chart = [{
            'course_code': c.course_code,
            'course_name': c.course_name,
            'students_count': c.students_count
        } for c in course_dist]

        return success_response({
            'role': 'admin',
            'summary': {
                'total_students': total_students,
                'total_faculty': total_faculty,
                'total_courses': total_courses,
                'total_active_enrollments': total_enrollments,
                'total_assignments': total_assignments,
                'total_quizzes': total_quizzes,
                'total_submissions': total_submissions
            },
            'department_distribution': dept_chart,
            'course_enrollment_chart': courses_chart
        })
