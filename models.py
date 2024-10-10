from app import db

class Invoice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    patient_name = db.Column(db.String(100), nullable=False)
    patient_email = db.Column(db.String(120), nullable=False)
    patient_address = db.Column(db.String(200))
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    services = db.relationship('Service', backref='invoice', lazy=True)

class Service(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    invoice_id = db.Column(db.Integer, db.ForeignKey('invoice.id'), nullable=False)
    description = db.Column(db.String(200), nullable=False)
    icd_code = db.Column(db.String(10), nullable=False)
    cost = db.Column(db.Float, nullable=False)
