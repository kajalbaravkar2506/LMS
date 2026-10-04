from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from app.models.user import User
from app.utils.response import error_response

def role_required(allowed_roles):
    """
    Decorator to enforce JWT authentication and check if current user has an allowed role.
    allowed_roles can be a string ('admin') or list of strings (['faculty', 'admin']).
    """
    if isinstance(allowed_roles, str):
        allowed_roles = [allowed_roles]

    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception as e:
                return error_response(f"Authentication required: {str(e)}", 401)
            
            claims = get_jwt()
            user_role = claims.get('role')

            if not user_role or user_role not in allowed_roles:
                return error_response("Forbidden: You do not have permission to access this resource", 403)
            
            return fn(*args, **kwargs)
        return wrapper
    return decorator

def admin_required():
    return role_required(['admin'])

def faculty_required():
    return role_required(['faculty'])

def student_required():
    return role_required(['student'])

def get_current_user_object():
    """
    Retrieves the User model instance corresponding to the current JWT identity.
    """
    identity = get_jwt_identity()
    if not identity:
        return None
    try:
        user_id = int(identity)
        return User.query.get(user_id)
    except Exception:
        return None
