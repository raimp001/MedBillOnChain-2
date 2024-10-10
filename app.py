import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
import logging

class Base(DeclarativeBase):
    pass

db = SQLAlchemy(model_class=Base)

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get("FLASK_SECRET_KEY") or "a secret key"
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get("DATABASE_URL")
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        "pool_recycle": 300,
        "pool_pre_ping": True,
    }

    db.init_app(app)

    with app.app_context():
        import models
        db.create_all()

        from routes import main as main_blueprint
        app.register_blueprint(main_blueprint)

    logging.basicConfig(level=logging.DEBUG)
    logging.debug("App created and configured")

    return app
