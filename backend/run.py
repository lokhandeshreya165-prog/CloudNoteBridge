"""Entry point for running CloudNoteBridge Flask development server."""
import os
from app import create_app
from app.services.storage_service import get_app_storage_service

app = create_app()

if __name__ == "__main__":
    host = os.getenv("FLASK_RUN_HOST", "127.0.0.1")
    port = int(os.getenv("FLASK_RUN_PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

    storage_name = get_app_storage_service(app).get_storage_provider_name()
    print(f"[*] CloudNoteBridge backend starting on http://{host}:{port}")
    print(f"[*] Active storage provider: {storage_name}")
    app.run(host=host, port=port, debug=debug)
