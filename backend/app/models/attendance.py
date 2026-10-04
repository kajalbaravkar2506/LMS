from datetime import datetime, date
from . import db

class Attendance(db.Model):
    __tablename__ = 'attendance'
    __table_args__ = (
        db.UniqueConstraint('course_id', 'student_id', 'date', name='uq_attendance_course_student_date'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='RESTRICT'), nullable=False, index=True)
    date = db.Column(db.Date, default=date.today, nullable=False, index=True)
    status = db.Column(db.Enum('present', 'absent', name='attendance_status'), default='present', nullable=False)
    marked_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course = db.relationship('Course', back_populates='attendance_records')
    student = db.relationship('Student', back_populates='attendance_records')
    marker = db.relationship('User')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'course_id': self.course_id,
            'course_code': self.course.course_code if self.course else None,
            'course_name': self.course.course_name if self.course else None,
            'student_id': self.student_id,
            'student_number': self.student.student_number if self.student else None,
            'student_name': self.student.user.full_name if self.student and self.student.user else None,
            'date': self.date.isoformat() if self.date else None,
            'status': self.status,
            'marked_by': self.marked_by,
            'marker_name': self.marker.full_name if self.marker else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
