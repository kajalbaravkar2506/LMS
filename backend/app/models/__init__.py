from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .user import User, Student, Faculty
from .course import Course, CourseMaterial, Enrollment
from .assignment import Assignment, Submission
from .quiz import Quiz, Question, Option, QuizAttempt, Answer
from .attendance import Attendance
from .announcement import Announcement, Notification

__all__ = [
    'db',
    'User',
    'Student',
    'Faculty',
    'Course',
    'CourseMaterial',
    'Enrollment',
    'Assignment',
    'Submission',
    'Quiz',
    'Question',
    'Option',
    'QuizAttempt',
    'Answer',
    'Attendance',
    'Announcement',
    'Notification'
]
