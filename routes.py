from flask import jsonify, request, render_template
from app import app, db
from models import BillingRecord

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/billing_records', methods=['GET', 'POST'])
def billing_records():
    if request.method == 'POST':
        data = request.json
        new_record = BillingRecord(
            patient_name=data['patient_name'],
            medical_record_number=data['medical_record_number'],
            service_description=data['service_description'],
            amount=data['amount']
        )
        db.session.add(new_record)
        db.session.commit()
        return jsonify(new_record.to_dict()), 201
    else:
        records = BillingRecord.query.all()
        return jsonify([record.to_dict() for record in records])

@app.route('/api/billing_records/<int:record_id>', methods=['GET', 'PUT', 'DELETE'])
def billing_record(record_id):
    record = BillingRecord.query.get_or_404(record_id)
    
    if request.method == 'GET':
        return jsonify(record.to_dict())
    
    elif request.method == 'PUT':
        data = request.json
        record.patient_name = data['patient_name']
        record.medical_record_number = data['medical_record_number']
        record.service_description = data['service_description']
        record.amount = data['amount']
        db.session.commit()
        return jsonify(record.to_dict())
    
    elif request.method == 'DELETE':
        db.session.delete(record)
        db.session.commit()
        return '', 204

@app.route('/invoice/<int:record_id>')
def invoice(record_id):
    record = BillingRecord.query.get_or_404(record_id)
    return render_template('invoice.html', record=record)
