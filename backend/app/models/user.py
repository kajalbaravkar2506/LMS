import bcrypt
from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('student', 'faculty', 'admin', name='user_roles'), nullable=False, index=True)
    phone = db.Column(db.String(20), nullable=True)
    profile_image = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    student_profile = db.relationship('Student', back_populates='user', uselist=False, cascade='all, delete-orphan')
    faculty_profile = db.relationship('Faculty', back_populates='user', uselist=False, cascade='all, delete-orphan')
    notifications = db.relationship('Notification', back_populates='user', cascade='all, delete-orphan', lazy='dynamic')
    announcements_created = db.relationship('Announcement', back_populates='creator', lazy='dynamic')

    def set_password(self, password: str):
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        if not self.password_hash:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))
        except Exception:
            return False

    def to_dict(self, include_profile: bool = True) -> dict:
        data = {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'profile_image': self.profile_image,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_profile:
            if self.role == 'student' and self.student_profile:
                data['student_profile'] = self.student_profile.to_dict()
            elif self.role == 'faculty' and self.faculty_profile:
                data['faculty_profile'] = self.faculty_profile.to_dict()
        return data


class Student(db.Model):
    __tablename__ = 'students'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    student_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    department = db.Column(db.String(100), nullable=True, index=True)
    year = db.Column(db.Integer, default=1, nullable=False)
    semester = db.Column(db.Integer, default=1, nullable=False)

    # Relationships
    user = db.relationship('User', back_populates='student_profile')
    enrollments = db.relationship('Enrollment', back_populates='student', cascade='all, delete-orphan', lazy='dynamic')
    submissions = db.relationship('Submission', back_populates='student', cascade='all, delete-orphan', lazy='dynamic')
    quiz_attempts = db.relationship('QuizAttempt', back_populates='student', cascade='all, delete-orphan', lazy='dynamic')
    attendance_records = db.relationship('Attendance', back_populates='student', cascade='all, delete-orphan', lazy='dynamic')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'student_number': self.student_number,
            'department': self.department,
            'year': self.year,
            'semester': self.semester,
            'full_name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'profile_image': self.user.profile_image if self.user else None,
            'is_active': self.user.is_active if self.user else True
        }


class Faculty(db.Model):
    __tablename__ = 'faculty'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    faculty_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    department = db.Column(db.String(100), nullable=True, index=True)
    designation = db.Column(db.String(100), nullable=True)

    # Relationships
    user = db.relationship('User', back_populates='faculty_profile')
    courses = db.relationship('Course', back_populates='faculty', lazy='dynamic')

    def to_dict(self) -> dict:
        return {
            'id': self.id,
            'user_id': self.user_id,
            'faculty_number': self.faculty_number,
            'department': self.department,
            'designation': self.designation,
            'full_name': self.user.full_name if self.user else None,
            'email': self.user.email if self.user else None,
            'phone': self.user.phone if self.user else None,
            'profile_image': self.user.profile_image if self.user else None,
            'is_active': self.user.is_active if self.user else True
        }
