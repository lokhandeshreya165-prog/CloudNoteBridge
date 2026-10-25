"""WSGI entry point for CloudNoteBridge in production environments (Gunicorn, uWSGI)."""
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run()
