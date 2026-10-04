from datetime import datetime, date
from . import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_code = db.Column(db.String(30), unique=True, nullable=False, index=True)
    course_name = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    syllabus = db.Column(db.Text, nullable=True)
    credits = db.Column(db.Integer, default=3, nullable=False)
    semester = db.Column(db.Integer, default=1, nullable=False)
    department = db.Column(db.String(100), nullable=False, index=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    faculty = db.relationship('Faculty', back_populates='courses')
    enrollments = db.relationship('Enrollment', back_populates='course', cascade='all, delete-orphan', lazy='dynamic')
    materials = db.relationship('CourseMaterial', back_populates='course', cascade='all, delete-orphan', lazy='dynamic')
    assignments = db.relationship('Assignment', back_populates='course', cascade='all, delete-orphan', lazy='dynamic')
    quizzes = db.relationship('Quiz', back_populates='course', cascade='all, delete-orphan', lazy='dynamic')
    attendance_records = db.relationship('Attendance', back_populates='course', cascade='all, delete-orphan', lazy='dynamic')
    announcements = db.relationship('Announcement', back_populates='course', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self, include_faculty: bool = True, include_counts: bool = False) -> dict:
        data = {
            'id': self.id,
            'course_code': self.course_code,
            'course_name': self.course_name,
            'description': self.description,
            'syllabus': self.syllabus,
            'credits': self.credits,
            'semester': self.semester,
            'department': self.department,
            'faculty_id': self.faculty_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_faculty and self.faculty:
            data['faculty'] = self.faculty.to_dict()
        if include_counts:
            data['enrolled_students_count'] = self.enrollments.filter_by(status='active').count()
            data['assignments_count'] = self.assignments.count()
            data['quizzes_count'] = self.quizzes.count()
            data['materials_count'] = self.materials.count()
        return data


class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    __table_args__ = (
        db.UniqueConstraint('student_id', 'course_id', name='uq_enrollments_student_course'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id', ondelete='RESTRICT'), nullable=False, index=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='RESTRICT'), nullable=False, index=True)
    enrollment_date = db.Column(db.Date, default=date.today, nullable=False)
    status = db.Column(db.Enum('active', 'completed', 'dropped', name='enrollment_status'), default='active', nullable=False, index=True)

    # Relationships
    student = db.relationship('Student', back_populates='enrollments')
    course = db.relationship('Course', back_populates='enrollments')

    def to_dict(self, include_details: bool = True) -> dict:
        data = {
            'id': self.id,
            'student_id': self.student_id,
            'course_id': self.course_id,
            'enrollment_date': self.enrollment_date.isoformat() if self.enrollment_date else None,
            'status': self.status
        }
        if include_details:
            if self.student:
                data['student'] = self.student.to_dict()
            if self.course:
                data['course'] = self.course.to_dict(include_faculty=True)
        return data


class CourseMaterial(db.Model):
    __tablename__ = 'course_materials'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    file_url = db.Column(db.String(500), nullable=False)
    material_type = db.Column(db.String(50), default='document', nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='RESTRICT'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    course = db.relationship('Course', back_populates='materials')
    uploader = db.relationship('User')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'course_id': self.course_id,
            'title': self.title,
            'description': self.description,
            'file_url': self.file_url,
            'material_type': self.material_type,
            'uploaded_by': self.uploaded_by,
            'uploader_name': self.uploader.full_name if self.uploader else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
