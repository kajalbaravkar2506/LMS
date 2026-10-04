from sqlalchemy import func, case, distinct
from app.models import (
    db, Course, Faculty, Student, User, Enrollment,
    Assignment, Submission, Quiz, QuizAttempt, Attendance
)

def get_enrollment_report(department: str = None, course_id: int = None):
    """
    DBMS Query: Course enrollment statistics with aggregate breakdown
    Uses: JOIN, COUNT, CASE WHEN, GROUP BY
    """
    query = db.session.query(
        Course.id.label('course_id'),
        Course.course_code,
        Course.course_name,
        Course.department,
        Course.credits,
        User.full_name.label('faculty_name'),
        func.count(Enrollment.id).label('total_enrolled'),
        func.count(case((Enrollment.status == 'active', 1))).label('active_enrolled'),
        func.count(case((Enrollment.status == 'dropped', 1))).label('dropped_enrolled'),
        func.count(case((Enrollment.status == 'completed', 1))).label('completed_enrolled')
    ).join(Faculty, Course.faculty_id == Faculty.id)\
     .join(User, Faculty.user_id == User.id)\
     .outerjoin(Enrollment, Course.id == Enrollment.course_id)

    if department:
        query = query.filter(Course.department == department)
    if course_id:
        query = query.filter(Course.id == course_id)

    results = query.group_by(
        Course.id, Course.course_code, Course.course_name, 
        Course.department, Course.credits, User.full_name
    ).all()

    return [{
        'course_id': r.course_id,
        'course_code': r.course_code,
        'course_name': r.course_name,
        'department': r.department,
        'credits': r.credits,
        'faculty_name': r.faculty_name,
        'total_enrolled': r.total_enrolled,
        'active_enrolled': r.active_enrolled,
        'dropped_enrolled': r.dropped_enrolled,
        'completed_enrolled': r.completed_enrolled
    } for r in results]


def get_student_performance_report(department: str = None, course_id: int = None):
    """
    DBMS Query: Composite academic report card joining students, courses, assignments, and quizzes
    Uses: Multi-table JOINs, Subqueries, Aggregations, GROUP BY
    """
    # Subquery for assignment stats per student & course
    asgn_sub = db.session.query(
        Submission.student_id,
        Assignment.course_id,
        func.avg((Submission.marks / func.nullif(Assignment.max_marks, 0)) * 100).label('avg_assignment_pct'),
        func.count(Submission.id).label('submitted_assignments_count')
    ).join(Assignment, Submission.assignment_id == Assignment.id)\
     .filter(Submission.status == 'graded')\
     .group_by(Submission.student_id, Assignment.course_id).subquery()

    # Subquery for quiz stats per student & course
    quiz_sub = db.session.query(
        QuizAttempt.student_id,
        Quiz.course_id,
        func.avg((QuizAttempt.score / func.nullif(Quiz.max_marks, 0)) * 100).label('avg_quiz_pct'),
        func.count(QuizAttempt.id).label('completed_quizzes_count')
    ).join(Quiz, QuizAttempt.quiz_id == Quiz.id)\
     .filter(QuizAttempt.submitted_at.isnot(None))\
     .group_by(QuizAttempt.student_id, Quiz.course_id).subquery()

    # Subquery for attendance percentage
    att_sub = db.session.query(
        Attendance.student_id,
        Attendance.course_id,
        func.count(Attendance.id).label('total_classes'),
        func.count(case((Attendance.status == 'present', 1))).label('classes_present'),
        (func.count(case((Attendance.status == 'present', 1))) * 100.0 / func.nullif(func.count(Attendance.id), 0)).label('attendance_pct')
    ).group_by(Attendance.student_id, Attendance.course_id).subquery()

    query = db.session.query(
        Student.id.label('student_id'),
        Student.student_number,
        User.full_name.label('student_name'),
        User.email.label('student_email'),
        Student.department,
        Course.id.label('course_id'),
        Course.course_code,
        Course.course_name,
        asgn_sub.c.avg_assignment_pct,
        asgn_sub.c.submitted_assignments_count,
        quiz_sub.c.avg_quiz_pct,
        quiz_sub.c.completed_quizzes_count,
        att_sub.c.attendance_pct,
        att_sub.c.total_classes,
        att_sub.c.classes_present
    ).join(User, Student.user_id == User.id)\
     .join(Enrollment, Student.id == Enrollment.student_id)\
     .join(Course, Enrollment.course_id == Course.id)\
     .outerjoin(asgn_sub, (Student.id == asgn_sub.c.student_id) & (Course.id == asgn_sub.c.course_id))\
     .outerjoin(quiz_sub, (Student.id == quiz_sub.c.student_id) & (Course.id == quiz_sub.c.course_id))\
     .outerjoin(att_sub, (Student.id == att_sub.c.student_id) & (Course.id == att_sub.c.course_id))\
     .filter(Enrollment.status == 'active')

    if department:
        query = query.filter(Student.department == department)
    if course_id:
        query = query.filter(Course.id == course_id)

    results = query.all()

    report = []
    for r in results:
        asgn_pct = round(float(r.avg_assignment_pct), 2) if r.avg_assignment_pct is not None else None
        qz_pct = round(float(r.avg_quiz_pct), 2) if r.avg_quiz_pct is not None else None
        att_pct = round(float(r.attendance_pct), 2) if r.attendance_pct is not None else None
        
        # Overall weighted calculation: Assignment (50%) + Quiz (30%) + Attendance (20%)
        weighted_score = 0.0
        weight_total = 0.0
        if asgn_pct is not None:
            weighted_score += asgn_pct * 0.5
            weight_total += 0.5
        if qz_pct is not None:
            weighted_score += qz_pct * 0.3
            weight_total += 0.3
        if att_pct is not None:
            weighted_score += att_pct * 0.2
            weight_total += 0.2

        overall_grade = round(weighted_score / weight_total, 2) if weight_total > 0 else None

        report.append({
            'student_id': r.student_id,
            'student_number': r.student_number,
            'student_name': r.student_name,
            'student_email': r.student_email,
            'department': r.department,
            'course_id': r.course_id,
            'course_code': r.course_code,
            'course_name': r.course_name,
            'assignment_avg_percentage': asgn_pct,
            'quiz_avg_percentage': qz_pct,
            'attendance_percentage': att_pct,
            'overall_score': overall_grade
        })

    return report


def get_attendance_report(course_id: int = None, min_percentage: float = None, max_percentage: float = None):
    """
    DBMS Query: Course attendance report with HAVING clause filtering
    """
    query = db.session.query(
        Course.course_code,
        Course.course_name,
        Student.student_number,
        User.full_name.label('student_name'),
        User.email.label('student_email'),
        func.count(Attendance.id).label('total_sessions'),
        func.count(case((Attendance.status == 'present', 1))).label('present_count'),
        func.count(case((Attendance.status == 'absent', 1))).label('absent_count'),
        (func.count(case((Attendance.status == 'present', 1))) * 100.0 / func.nullif(func.count(Attendance.id), 0)).label('attendance_pct')
    ).join(Course, Attendance.course_id == Course.id)\
     .join(Student, Attendance.student_id == Student.id)\
     .join(User, Student.user_id == User.id)

    if course_id:
        query = query.filter(Course.id == course_id)

    results = query.group_by(
        Course.course_code, Course.course_name,
        Student.student_number, User.full_name, User.email
    ).all()

    report = []
    for r in results:
        pct = round(float(r.attendance_pct), 2) if r.attendance_pct is not None else 0.0
        if min_percentage is not None and pct < min_percentage:
            continue
        if max_percentage is not None and pct > max_percentage:
            continue

        report.append({
            'course_code': r.course_code,
            'course_name': r.course_name,
            'student_number': r.student_number,
            'student_name': r.student_name,
            'student_email': r.student_email,
            'total_sessions': r.total_sessions,
            'present_count': r.present_count,
            'absent_count': r.absent_count,
            'attendance_percentage': pct,
            'is_shortage': pct < 75.0
        })

    return report


def get_submission_report(course_id: int = None, assignment_id: int = None):
    """
    DBMS Query: Assignment submission rates and marks statistics
    """
    query = db.session.query(
        Assignment.id.label('assignment_id'),
        Assignment.title.label('assignment_title'),
        Assignment.due_date,
        Assignment.max_marks,
        Course.course_code,
        Course.course_name,
        func.count(distinct(Enrollment.student_id)).label('eligible_students'),
        func.count(distinct(Submission.id)).label('total_submitted'),
        func.count(distinct(case((Submission.status == 'late', Submission.id)))).label('late_submissions'),
        func.count(distinct(case((Submission.status == 'graded', Submission.id)))).label('graded_submissions'),
        func.avg(case((Submission.status == 'graded', Submission.marks))).label('avg_marks'),
        func.min(case((Submission.status == 'graded', Submission.marks))).label('min_marks'),
        func.max(case((Submission.status == 'graded', Submission.marks))).label('max_marks_obtained')
    ).join(Course, Assignment.course_id == Course.id)\
     .join(Enrollment, (Course.id == Enrollment.course_id) & (Enrollment.status == 'active'))\
     .outerjoin(Submission, (Assignment.id == Submission.assignment_id) & (Submission.student_id == Enrollment.student_id))

    if course_id:
        query = query.filter(Course.id == course_id)
    if assignment_id:
        query = query.filter(Assignment.id == assignment_id)

    results = query.group_by(
        Assignment.id, Assignment.title, Assignment.due_date,
        Assignment.max_marks, Course.course_code, Course.course_name
    ).all()

    return [{
        'assignment_id': r.assignment_id,
        'assignment_title': r.assignment_title,
        'course_code': r.course_code,
        'course_name': r.course_name,
        'due_date': r.due_date.isoformat() if r.due_date else None,
        'max_marks': float(r.max_marks) if r.max_marks is not None else 100.0,
        'eligible_students': r.eligible_students,
        'total_submitted': r.total_submitted,
        'late_submissions': r.late_submissions,
        'graded_submissions': r.graded_submissions,
        'pending_submissions': max(0, r.eligible_students - r.total_submitted),
        'submission_rate': round((r.total_submitted * 100.0 / r.eligible_students), 2) if r.eligible_students > 0 else 0.0,
        'avg_marks': round(float(r.avg_marks), 2) if r.avg_marks is not None else None,
        'min_marks': float(r.min_marks) if r.min_marks is not None else None,
        'max_marks_obtained': float(r.max_marks_obtained) if r.max_marks_obtained is not None else None
    } for r in results]
