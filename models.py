from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256))

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    patient_email = db.Column(db.String(120), nullable=False)
    patient_address = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    additional_notes = db.Column(db.Text)
    services = db.relationship('Service', backref='invoice', lazy=True)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    paid = db.Column(db.Boolean, default=False)
    payment_currency = db.Column(db.String(10), nullable=True)

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    icd_code = db.Column(db.String(10), nullable=False)
    cost = db.Column(db.Float, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'icd_code': self.icd_code,
            'cost': self.cost
        }
