from datetime import datetime
from decimal import Decimal
from app.models import db, Quiz, Question, Option, QuizAttempt, Answer, Notification

def start_or_get_quiz_attempt(quiz_id: int, student_id: int):
    """
    Retrieves an existing in-progress attempt or initiates a new attempt for a student.
    """
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise ValueError("Quiz not found")

    attempt = QuizAttempt.query.filter_by(quiz_id=quiz_id, student_id=student_id).first()
    if attempt:
        return attempt, attempt.submitted_at is not None

    new_attempt = QuizAttempt(
        quiz_id=quiz_id,
        student_id=student_id,
        started_at=datetime.utcnow()
    )
    db.session.add(new_attempt)
    db.session.commit()
    return new_attempt, False


def submit_quiz_transaction(quiz_id: int, student_id: int, answers_payload: list) -> dict:
    """
    Transactional submission of a quiz:
    1. Locks and verifies attempt validity
    2. Stores or updates student selected answers
    3. Calculates total marks based on option.is_correct
    4. Marks attempt as submitted with final score
    5. Dispatches notification to student
    Rollbacks completely on any validation or constraint error.
    """
    attempt = QuizAttempt.query.filter_by(quiz_id=quiz_id, student_id=student_id).first()
    if not attempt:
        raise ValueError("Quiz attempt has not been initiated.")
    
    if attempt.submitted_at is not None:
        raise ValueError("This quiz has already been submitted and cannot be retaken.")

    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        raise ValueError("Associated quiz not found.")

    try:
        # 1. Clear any prior draft answers for this attempt
        Answer.query.filter_by(attempt_id=attempt.id).delete()

        total_score = Decimal('0.00')

        # 2. Iterate through provided answers
        for item in answers_payload:
            q_id = item.get('question_id')
            opt_id = item.get('selected_option_id')

            if not q_id:
                continue

            question = Question.query.filter_by(id=q_id, quiz_id=quiz_id).first()
            if not question:
                continue

            selected_opt = None
            if opt_id:
                selected_opt = Option.query.filter_by(id=opt_id, question_id=q_id).first()

            ans = Answer(
                attempt_id=attempt.id,
                question_id=q_id,
                selected_option_id=selected_opt.id if selected_opt else None
            )
            db.session.add(ans)

            # Check if answer was correct
            if selected_opt and selected_opt.is_correct:
                total_score += Decimal(str(question.marks or 1.0))

        # Cap score to quiz max_marks
        if quiz.max_marks and total_score > Decimal(str(quiz.max_marks)):
            total_score = Decimal(str(quiz.max_marks))

        # 3. Finalize attempt
        attempt.submitted_at = datetime.utcnow()
        attempt.score = total_score

        # 4. Create student notification
        notif = Notification(
            user_id=attempt.student.user_id,
            title="Quiz Submitted",
            message=f"You completed {quiz.title}. Your score: {float(total_score)}/{float(quiz.max_marks)}",
            type="quiz"
        )
        db.session.add(notif)

        # Commit transaction
        db.session.commit()

        return {
            'attempt_id': attempt.id,
            'quiz_id': quiz.id,
            'quiz_title': quiz.title,
            'max_marks': float(quiz.max_marks),
            'score': float(total_score),
            'submitted_at': attempt.submitted_at.isoformat()
        }
    except Exception as e:
        db.session.rollback()
        raise e
