from app import db
from datetime import datetime

class BillingRecord(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    medical_record_number = db.Column(db.String(50), nullable=False)
    service_description = db.Column(db.String(200), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    paid = db.Column(db.Boolean, default=False)
    payment_currency = db.Column(db.String(10), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'patient_name': self.patient_name,
            'medical_record_number': self.medical_record_number,
            'service_description': self.service_description,
            'amount': self.amount,
            'date': self.date.strftime('%Y-%m-%d %H:%M:%S'),
            'paid': self.paid,
            'payment_currency': self.payment_currency
        }
