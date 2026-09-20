"""
Geospatial Urban Heat Risk Intelligent System - Flask Backend Entry Point
Mounts all REST blueprints, enables CORS, provides health checks, and starts server.
"""

import os
import sys
from flask import Flask, jsonify
from flask_cors import CORS

# Add root directory to sys.path for internal imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.routes.api import api_bp


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(api_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "healthy",
            "system": "Geospatial Urban Heat Risk Intelligent System",
            "version": "1.0.0",
            "stack": {
                "framework": "Flask Python",
                "ml_layer": "Scikit-Learn + XGBoost",
                "xai": "SHAP",
                "hvi_engine": "PCA Domain Decomposition",
                "spatial_db": "PostgreSQL/PostGIS (Ready)",
                "earth_engine": "Landsat 8/9 Zonal Extractor"
            }
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server processing error", "details": str(e)}), 500

    return app


app = create_app()

if __name__ == '__main__':
    port = int(os.getenv('FLASK_PORT', 5000))
    print(f"Starting Geospatial Urban Heat Risk Flask API server on port {port}...")
    app.run(host='0.0.0.0', port=port, debug=False)
