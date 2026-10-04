import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

def allowed_file(filename: str) -> bool:
    if '.' not in filename:
        return False
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in current_app.config['ALLOWED_EXTENSIONS']

def save_uploaded_file(file_obj, subfolder='misc') -> str:
    """
    Saves an uploaded file to the configured uploads folder and returns its relative web URL.
    """
    if not file_obj or not file_obj.filename:
        raise ValueError("No file provided")
    
    if not allowed_file(file_obj.filename):
        raise ValueError(f"File extension not allowed. Supported: {', '.join(current_app.config['ALLOWED_EXTENSIONS'])}")

    original_filename = secure_filename(file_obj.filename)
    unique_prefix = uuid.uuid4().hex[:8]
    saved_filename = f"{unique_prefix}_{original_filename}"

    target_dir = os.path.join(current_app.config['UPLOAD_FOLDER'], subfolder)
    os.makedirs(target_dir, exist_ok=True)

    file_path = os.path.join(target_dir, saved_filename)
    file_obj.save(file_path)

    # Return relative URL accessible via API
    return f"/uploads/{subfolder}/{saved_filename}"
