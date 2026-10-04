from datetime import datetime
from . import db

class Quiz(db.Model):
    __tablename__ = 'quizzes'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration_minutes = db.Column(db.Integer, default=30, nullable=False)
    max_marks = db.Column(db.Numeric(5, 2), default=20.00, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course = db.relationship('Course', back_populates='quizzes')
    creator = db.relationship('User')
    questions = db.relationship('Question', back_populates='quiz', cascade='all, delete-orphan', lazy='joined')
    attempts = db.relationship('QuizAttempt', back_populates='quiz', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, include_questions: bool = False, is_student_view: bool = False) -> dict:
        data = {
            'id': self.id,
            'course_id': self.course_id,
            'course_code': self.course.course_code if self.course else None,
            'course_name': self.course.course_name if self.course else None,
            'title': self.title,
            'description': self.description,
            'duration_minutes': self.duration_minutes,
            'max_marks': float(self.max_marks) if self.max_marks is not None else 20.0,
            'created_by': self.created_by,
            'creator_name': self.creator.full_name if self.creator else None,
            'questions_count': len(self.questions) if self.questions else 0,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        if include_questions:
            data['questions'] = [
                q.to_dict(hide_correct=is_student_view) for q in self.questions
            ]
        return data


class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False, index=True)
    question_text = db.Column(db.Text, nullable=False)
    marks = db.Column(db.Numeric(5, 2), default=1.00, nullable=False)

    # Relationships
    quiz = db.relationship('Quiz', back_populates='questions')
    options = db.relationship('Option', back_populates='question', cascade='all, delete-orphan', lazy='joined')
    answers = db.relationship('Answer', back_populates='question', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, hide_correct: bool = False) -> dict:
        return {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'question_text': self.question_text,
            'marks': float(self.marks) if self.marks is not None else 1.0,
            'options': [opt.to_dict(hide_correct=hide_correct) for opt in self.options]
        }


class Option(db.Model):
    __tablename__ = 'options'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False, index=True)
    option_text = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False, nullable=False)

    # Relationships
    question = db.relationship('Question', back_populates='options')

    def to_dict(self, hide_correct: bool = False) -> dict:
        data = {
            'id': self.id,
            'question_id': self.question_id,
            'option_text': self.option_text,
        }
        if not hide_correct:
            data['is_correct'] = self.is_correct
        return data


class QuizAttempt(db.Model):
    __tablename__ = 'quiz_attempts'
    __table_args__ = (
        db.UniqueConstraint('quiz_id', 'student_id', name='uq_quiz_attempts_quiz_student'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id', ondelete='CASCADE'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='RESTRICT'), nullable=False, index=True)
    started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    submitted_at = db.Column(db.DateTime, nullable=True)
    score = db.Column(db.Numeric(5, 2), nullable=True)

    # Relationships
    quiz = db.relationship('Quiz', back_populates='attempts')
    student = db.relationship('Student', back_populates='quiz_attempts')
    answers = db.relationship('Answer', back_populates='attempt', cascade='all, delete-orphan', lazy='joined')

    def to_dict(self, include_answers: bool = False) -> dict:
        data = {
            'id': self.id,
            'quiz_id': self.quiz_id,
            'quiz_title': self.quiz.title if self.quiz else None,
            'max_marks': float(self.quiz.max_marks) if self.quiz and self.quiz.max_marks is not None else 20.0,
            'duration_minutes': self.quiz.duration_minutes if self.quiz else 30,
            'course_code': self.quiz.course.course_code if self.quiz and self.quiz.course else None,
            'course_name': self.quiz.course.course_name if self.quiz and self.quiz.course else None,
            'student_id': self.student_id,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'student_number': self.student.student_number if self.student else None,
            'started_at': self.started_at.isoformat() if self.started_at else None,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'score': float(self.score) if self.score is not None else None,
            'status': 'completed' if self.submitted_at else 'in_progress'
        }
        if include_answers:
            data['answers'] = [ans.to_dict() for ans in self.answers]
        return data


class Answer(db.Model):
    __tablename__ = 'answers'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    attempt_id = db.Column(db.Integer, db.ForeignKey('quiz_attempts.id', ondelete='CASCADE'), nullable=False, index=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id', ondelete='CASCADE'), nullable=False, index=True)
    selected_option_id = db.Column(db.Integer, db.ForeignKey('options.id', ondelete='SET NULL'), nullable=True, index=True)

    # Relationships
    attempt = db.relationship('QuizAttempt', back_populates='answers')
    question = db.relationship('Question', back_populates='answers')
    selected_option = db.relationship('Option')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'attempt_id': self.attempt_id,
            'question_id': self.question_id,
            'question_text': self.question.question_text if self.question else None,
            'selected_option_id': self.selected_option_id,
            'selected_option_text': self.selected_option.option_text if self.selected_option else None,
            'is_correct': self.selected_option.is_correct if self.selected_option else False,
            'marks_awarded': float(self.question.marks) if (self.selected_option and self.selected_option.is_correct and self.question) else 0.0
        }
