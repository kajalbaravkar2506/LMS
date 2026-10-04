from datetime import datetime
from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models import db, Quiz, Question, Option, QuizAttempt, Course, Enrollment, Notification
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.services.quiz_service import start_or_get_quiz_attempt, submit_quiz_transaction
from app.utils.response import success_response, error_response

quizzes_bp = Blueprint('quizzes', __name__, url_prefix='/api/quizzes')

@quizzes_bp.route('', methods=['GET'])
@jwt_required()
def get_quizzes():
    user = get_current_user_object()
    course_id = request.args.get('course_id')

    query = Quiz.query
    if course_id:
        query = query.filter(Quiz.course_id == int(course_id))

    if user.role == 'faculty' and user.faculty_profile:
        query = query.join(Course).filter(Course.faculty_id == user.faculty_profile.id)
    elif user.role == 'student' and user.student_profile:
        enrolled_ids = [e.course_id for e in Enrollment.query.filter_by(student_id=user.student_profile.id, status='active').all()]
        query = query.filter(Quiz.course_id.in_(enrolled_ids))

    quizzes = query.order_by(Quiz.created_at.desc()).all()
    
    result = []
    for q in quizzes:
        q_dict = q.to_dict(include_questions=False, is_student_view=(user.role == 'student'))
        if user.role == 'student' and user.student_profile:
            attempt = QuizAttempt.query.filter_by(quiz_id=q.id, student_id=user.student_profile.id).first()
            q_dict['attempt'] = attempt.to_dict(include_answers=False) if attempt else None
            q_dict['is_attempted'] = attempt.submitted_at is not None if attempt else False
        result.append(q_dict)

    return success_response(result)


@quizzes_bp.route('/<int:quiz_id>', methods=['GET'])
@jwt_required()
def get_quiz_detail(quiz_id: int):
    user = get_current_user_object()
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return error_response("Quiz not found", 404)

    is_student = (user and user.role == 'student')
    data = quiz.to_dict(include_questions=True, is_student_view=is_student)

    if is_student and user.student_profile:
        attempt = QuizAttempt.query.filter_by(quiz_id=quiz.id, student_id=user.student_profile.id).first()
        data['attempt'] = attempt.to_dict(include_answers=True) if attempt else None
        data['is_attempted'] = attempt.submitted_at is not None if attempt else False

    return success_response(data)


@quizzes_bp.route('', methods=['POST'])
@role_required(['faculty', 'admin'])
def create_quiz():
    user = get_current_user_object()
    data = request.get_json() or {}

    course_id = data.get('course_id')
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    duration_minutes = int(data.get('duration_minutes', 30))
    questions_data = data.get('questions', [])

    if not course_id or not title:
        return error_response("Course ID and title are required", 400)

    course = Course.query.get(course_id)
    if not course:
        return error_response("Course not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
        return error_response("You can only create quizzes for your own courses", 403)

    if duration_minutes <= 0:
        return error_response("Duration must be a positive integer in minutes", 400)

    try:
        # Calculate max marks based on questions
        total_marks = sum(float(q.get('marks', 1.0)) for q in questions_data) if questions_data else float(data.get('max_marks', 20.0))

        quiz = Quiz(
            course_id=course.id,
            title=title,
            description=description,
            duration_minutes=duration_minutes,
            max_marks=total_marks,
            created_by=user.id
        )
        db.session.add(quiz)
        db.session.flush()

        # Add questions and options
        for q_item in questions_data:
            q_text = q_item.get('question_text', '').strip()
            q_marks = float(q_item.get('marks', 1.0))
            if not q_text:
                continue

            question = Question(
                quiz_id=quiz.id,
                question_text=q_text,
                marks=q_marks
            )
            db.session.add(question)
            db.session.flush()

            for opt_item in q_item.get('options', []):
                opt_text = opt_item.get('option_text', '').strip()
                is_correct = bool(opt_item.get('is_correct', False))
                if not opt_text:
                    continue

                option = Option(
                    question_id=question.id,
                    option_text=opt_text,
                    is_correct=is_correct
                )
                db.session.add(option)

        # Notify enrolled students
        enrolled_students = Enrollment.query.filter_by(course_id=course.id, status='active').all()
        for enr in enrolled_students:
            if enr.student:
                notif = Notification(
                    user_id=enr.student.user_id,
                    title="New Quiz Available",
                    message=f'New quiz "{title}" has been published in {course.course_code}.',
                    type="quiz"
                )
                db.session.add(notif)

        db.session.commit()
        return success_response(quiz.to_dict(include_questions=True), "Quiz created successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to create quiz: {str(e)}", 500)


@quizzes_bp.route('/<int:quiz_id>', methods=['PUT'])
@role_required(['faculty', 'admin'])
def update_quiz(quiz_id: int):
    user = get_current_user_object()
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return error_response("Quiz not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or quiz.course.faculty_id != user.faculty_profile.id):
        return error_response("You can only modify quizzes in your own courses", 403)

    data = request.get_json() or {}
    if 'title' in data and data['title'].strip():
        quiz.title = data['title'].strip()
    if 'description' in data:
        quiz.description = data['description']
    if 'duration_minutes' in data:
        quiz.duration_minutes = int(data['duration_minutes'])

    try:
        db.session.commit()
        return success_response(quiz.to_dict(include_questions=True), "Quiz updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update quiz: {str(e)}", 500)


@quizzes_bp.route('/<int:quiz_id>', methods=['DELETE'])
@role_required(['faculty', 'admin'])
def delete_quiz(quiz_id: int):
    user = get_current_user_object()
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return error_response("Quiz not found", 404)

    if user.role == 'faculty' and (not user.faculty_profile or quiz.course.faculty_id != user.faculty_profile.id):
        return error_response("You can only delete quizzes in your own courses", 403)

    try:
        db.session.delete(quiz)
        db.session.commit()
        return success_response(None, "Quiz deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete quiz: {str(e)}", 500)


@quizzes_bp.route('/<int:quiz_id>/start', methods=['POST'])
@role_required(['student'])
def start_quiz(quiz_id: int):
    user = get_current_user_object()
    if not user.student_profile:
        return error_response("Student profile not found", 400)

    try:
        attempt, is_completed = start_or_get_quiz_attempt(quiz_id=quiz_id, student_id=user.student_profile.id)
        if is_completed:
            return error_response("You have already completed this quiz", 400)
        return success_response(attempt.to_dict(), "Quiz attempt started")
    except ValueError as ve:
        return error_response(str(ve), 404)
    except Exception as e:
        return error_response(f"Failed to start quiz attempt: {str(e)}", 500)


@quizzes_bp.route('/<int:quiz_id>/submit', methods=['POST'])
@role_required(['student'])
def submit_quiz(quiz_id: int):
    user = get_current_user_object()
    if not user.student_profile:
        return error_response("Student profile not found", 400)

    data = request.get_json()
    if isinstance(data, list):
        answers = data
    elif isinstance(data, dict):
        answers = data.get('answers', [])
    else:
        answers = []

    try:
        result = submit_quiz_transaction(
            quiz_id=quiz_id,
            student_id=user.student_profile.id,
            answers_payload=answers
        )
        return success_response(result, "Quiz evaluated and submitted successfully")
    except ValueError as ve:
        return error_response(str(ve), 400)
    except Exception as e:
        return error_response(f"Quiz submission failed: {str(e)}", 500)


@quizzes_bp.route('/<int:quiz_id>/results', methods=['GET'])
@jwt_required()
def get_quiz_results(quiz_id: int):
    user = get_current_user_object()
    quiz = Quiz.query.get(quiz_id)
    if not quiz:
        return error_response("Quiz not found", 404)

    if user.role == 'student':
        if not user.student_profile:
            return error_response("Student profile not found", 400)
        attempt = QuizAttempt.query.filter_by(quiz_id=quiz.id, student_id=user.student_profile.id).first()
        if not attempt:
            return error_response("No attempt found for this quiz", 404)
        return success_response(attempt.to_dict(include_answers=True))

    elif user.role in ['faculty', 'admin']:
        attempts = QuizAttempt.query.filter_by(quiz_id=quiz.id).order_by(QuizAttempt.score.desc()).all()
        return success_response([att.to_dict(include_answers=True) for att in attempts])
