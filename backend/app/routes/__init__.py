"""Blueprints package and route registration."""
from flask import Flask
from app.routes.auth import auth_bp
from app.routes.notes import notes_bp
from app.routes.downloads import downloads_bp
from app.routes.profile import profile_bp
from app.routes.admin import admin_bp
from app.routes.health import health_bp, main_bp


def register_routes(app: Flask) -> None:
    """Register all modular blueprints onto the Flask application."""
    app.register_blueprint(main_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(notes_bp)
    app.register_blueprint(downloads_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(health_bp)
