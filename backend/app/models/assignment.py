from datetime import datetime
from . import db

class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    due_date = db.Column(db.DateTime, nullable=False, index=True)
    max_marks = db.Column(db.Numeric(5, 2), default=100.00, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    course = db.relationship('Course', back_populates='assignments')
    creator = db.relationship('User')
    submissions = db.relationship('Submission', back_populates='assignment', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, include_submissions_count: bool = False) -> dict:
        data = {
            'id': self.id,
            'course_id': self.course_id,
            'course_code': self.course.course_code if self.course else None,
            'course_name': self.course.course_name if self.course else None,
            'title': self.title,
            'description': self.description,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'max_marks': float(self.max_marks) if self.max_marks is not None else 100.0,
            'created_by': self.created_by,
            'creator_name': self.creator.full_name if self.creator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_submissions_count:
            data['total_submissions'] = self.submissions.count()
            data['graded_submissions'] = self.submissions.filter_by(status='graded').count()
        return data


class Submission(db.Model):
    __tablename__ = 'submissions'
    __table_args__ = (
        db.UniqueConstraint('assignment_id', 'student_id', name='uq_submissions_assignment_student'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    assignment_id = db.Column(db.Integer, db.ForeignKey('assignments.id', ondelete='CASCADE'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='RESTRICT'), nullable=False, index=True)
    file_url = db.Column(db.String(500), nullable=True)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    marks = db.Column(db.Numeric(5, 2), nullable=True)
    feedback = db.Column(db.Text, nullable=True)
    status = db.Column(db.Enum('submitted', 'late', 'graded', name='submission_status'), default='submitted', nullable=False, index=True)
    graded_at = db.Column(db.DateTime, nullable=True)

    # Relationships
    assignment = db.relationship('Assignment', back_populates='submissions')
    student = db.relationship('Student', back_populates='submissions')

    def to_dict(self, include_student: bool = True) -> dict:
        data = {
            'id': self.id,
            'assignment_id': self.assignment_id,
            'assignment_title': self.assignment.title if self.assignment else None,
            'max_marks': float(self.assignment.max_marks) if self.assignment and self.assignment.max_marks is not None else 100.0,
            'course_code': self.assignment.course.course_code if self.assignment and self.assignment.course else None,
            'course_name': self.assignment.course.course_name if self.assignment and self.assignment.course else None,
            'student_id': self.student_id,
            'file_url': self.file_url,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'marks': float(self.marks) if self.marks is not None else None,
            'feedback': self.feedback,
            'status': self.status,
            'graded_at': self.graded_at.isoformat() if self.graded_at else None,
        }
        if include_student and self.student:
            data['student'] = self.student.to_dict()
        return data
