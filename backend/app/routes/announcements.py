from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from app.models import db, Announcement, Course, Enrollment, Notification
from app.middleware.auth_middleware import role_required, get_current_user_object
from app.utils.response import success_response, error_response

announcements_bp = Blueprint('announcements', __name__, url_prefix='/api/announcements')

@announcements_bp.route('', methods=['GET'])
@jwt_required()
def get_announcements():
    user = get_current_user_object()
    course_id = request.args.get('course_id')

    query = Announcement.query

    if course_id:
        query = query.filter(
            (Announcement.course_id == int(course_id)) | 
            (Announcement.course_id.is_(None))
        )
    elif user.role == 'student' and user.student_profile:
        enrolled_ids = [e.course_id for e in Enrollment.query.filter_by(student_id=user.student_profile.id, status='active').all()]
        query = query.filter(
            (Announcement.course_id.in_(enrolled_ids)) | 
            (Announcement.course_id.is_(None))
        )
    elif user.role == 'faculty' and user.faculty_profile:
        taught_ids = [c.id for c in Course.query.filter_by(faculty_id=user.faculty_profile.id).all()]
        query = query.filter(
            (Announcement.course_id.in_(taught_ids)) | 
            (Announcement.course_id.is_(None))
        )

    announcements = query.order_by(Announcement.created_at.desc()).all()
    return success_response([a.to_dict() for a in announcements])


@announcements_bp.route('', methods=['POST'])
@role_required(['faculty', 'admin'])
def create_announcement():
    user = get_current_user_object()
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    content = data.get('content', '').strip()
    course_id = data.get('course_id') # None or integer

    if not title or not content:
        return error_response("Title and content are required", 400)

    if user.role == 'faculty' and not course_id:
        return error_response("Faculty members must specify a course for announcements", 400)

    if course_id:
        course = Course.query.get(course_id)
        if not course:
            return error_response("Specified course not found", 404)
        if user.role == 'faculty' and (not user.faculty_profile or course.faculty_id != user.faculty_profile.id):
            return error_response("You can only post announcements for your own courses", 403)

    try:
        announcement = Announcement(
            course_id=int(course_id) if course_id else None,
            title=title,
            content=content,
            created_by=user.id
        )
        db.session.add(announcement)
        db.session.flush()

        # Send notifications to relevant students
        if course_id:
            enrolled = Enrollment.query.filter_by(course_id=int(course_id), status='active').all()
            for enr in enrolled:
                if enr.student:
                    db.session.add(Notification(
                        user_id=enr.student.user_id,
                        title=f"Course Announcement: {title}",
                        message=content[:120] + ('...' if len(content) > 120 else ''),
                        type="announcement"
                    ))

        db.session.commit()
        return success_response(announcement.to_dict(), "Announcement published successfully", 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to post announcement: {str(e)}", 500)


@announcements_bp.route('/<int:announcement_id>', methods=['PUT'])
@role_required(['faculty', 'admin'])
def update_announcement(announcement_id: int):
    user = get_current_user_object()
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return error_response("Announcement not found", 404)

    if user.role != 'admin' and announcement.created_by != user.id:
        return error_response("You can only edit announcements created by yourself", 403)

    data = request.get_json() or {}
    if 'title' in data and data['title'].strip():
        announcement.title = data['title'].strip()
    if 'content' in data and data['content'].strip():
        announcement.content = data['content'].strip()

    try:
        db.session.commit()
        return success_response(announcement.to_dict(), "Announcement updated successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update announcement: {str(e)}", 500)


@announcements_bp.route('/<int:announcement_id>', methods=['DELETE'])
@role_required(['faculty', 'admin'])
def delete_announcement(announcement_id: int):
    user = get_current_user_object()
    announcement = Announcement.query.get(announcement_id)
    if not announcement:
        return error_response("Announcement not found", 404)

    if user.role != 'admin' and announcement.created_by != user.id:
        return error_response("You can only delete announcements created by yourself", 403)

    try:
        db.session.delete(announcement)
        db.session.commit()
        return success_response(None, "Announcement deleted successfully")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to delete announcement: {str(e)}", 500)
