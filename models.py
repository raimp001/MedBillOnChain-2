from app import db
from datetime import datetime

class BillingRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    service_description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'service_description': self.service_description,
            'amount': self.amount,
            'date': self.date.strftime('%Y-%m-%d %H:%M:%S')
        }
