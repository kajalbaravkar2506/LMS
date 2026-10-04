import os
from app import create_app

app = create_app(os.getenv('FLASK_ENV', 'development'))

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f"[EduVerse LMS] Backend Server running at http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False)
