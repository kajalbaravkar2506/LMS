from flask import Blueprint
from flask_jwt_extended import jwt_required
from app.models import db, Notification
from app.middleware.auth_middleware import get_current_user_object
from app.utils.response import success_response, error_response

notifications_bp = Blueprint('notifications', __name__, url_prefix='/api/notifications')

@notifications_bp.route('', methods=['GET'])
@jwt_required()
def get_notifications():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)

    notifs = Notification.query.filter_by(user_id=user.id).order_by(Notification.created_at.desc()).limit(50).all()
    unread_count = Notification.query.filter_by(user_id=user.id, is_read=False).count()

    return success_response({
        'notifications': [n.to_dict() for n in notifs],
        'unread_count': unread_count
    })


@notifications_bp.route('/<int:notification_id>/read', methods=['PUT'])
@jwt_required()
def mark_notification_read(notification_id: int):
    user = get_current_user_object()
    notif = Notification.query.filter_by(id=notification_id, user_id=user.id).first()
    if not notif:
        return error_response("Notification not found", 404)

    try:
        notif.is_read = True
        db.session.commit()
        return success_response(notif.to_dict(), "Notification marked as read")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update notification: {str(e)}", 500)


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    user = get_current_user_object()
    if not user:
        return error_response("User not found", 404)

    try:
        Notification.query.filter_by(user_id=user.id, is_read=False).update({'is_read': True})
        db.session.commit()
        return success_response(None, "All notifications marked as read")
    except Exception as e:
        db.session.rollback()
        return error_response(f"Failed to update notifications: {str(e)}", 500)
