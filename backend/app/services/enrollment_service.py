from datetime import date
from app.models import db, Enrollment, Course, Student, Notification

def enroll_student_in_course(student_id: int, course_id: int) -> Enrollment:
    """
    Atomic course enrollment:
    1. Validates course existence and student eligibility
    2. Prevents duplicate active enrollment
    3. Creates enrollment record
    4. Issues welcome notification
    """
    course = Course.query.get(course_id)
    if not course:
        raise ValueError("Course not found")

    student = Student.query.get(student_id)
    if not student:
        raise ValueError("Student profile not found")

    existing = Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first()
    if existing:
        if existing.status == 'active':
            raise ValueError("You are already actively enrolled in this course")
        else:
            # Re-activate dropped course
            existing.status = 'active'
            existing.enrollment_date = date.today()
            db.session.commit()
            return existing

    try:
        enrollment = Enrollment(
            student_id=student_id,
            course_id=course_id,
            enrollment_date=date.today(),
            status='active'
        )
        db.session.add(enrollment)

        notif = Notification(
            user_id=student.user_id,
            title="Course Enrolled",
            message=f"You have successfully enrolled in {course.course_code} - {course.course_name}.",
            type="course"
        )
        db.session.add(notif)

        db.session.commit()
        return enrollment
    except Exception as e:
        db.session.rollback()
        raise e
