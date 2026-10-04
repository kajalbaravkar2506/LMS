from datetime import datetime
from decimal import Decimal
from app.models import db, Submission, Assignment, Notification

def grade_submission_transaction(submission_id: int, marks: float, feedback: str = None) -> Submission:
    """
    Grades an assignment submission within a transactional boundary:
    1. Checks bounds (0 <= marks <= max_marks)
    2. Updates submission status and grading timestamp
    3. Notifies student of the posted grade
    """
    submission = Submission.query.get(submission_id)
    if not submission:
        raise ValueError("Submission not found")

    assignment = submission.assignment
    if not assignment:
        raise ValueError("Associated assignment not found")

    max_marks = float(assignment.max_marks or 100.0)
    if marks < 0:
        raise ValueError("Marks cannot be negative")
    if marks > max_marks:
        raise ValueError(f"Marks ({marks}) cannot exceed maximum allowed marks ({max_marks})")

    try:
        submission.marks = Decimal(str(marks))
        submission.feedback = feedback
        submission.status = 'graded'
        submission.graded_at = datetime.utcnow()

        student_user_id = submission.student.user_id if submission.student else None
        if student_user_id:
            notif = Notification(
                user_id=student_user_id,
                title="Assignment Graded",
                message=f'Your submission for "{assignment.title}" has been graded: {marks}/{max_marks}.',
                type="grade"
            )
            db.session.add(notif)

        db.session.commit()
        return submission
    except Exception as e:
        db.session.rollback()
        raise e
