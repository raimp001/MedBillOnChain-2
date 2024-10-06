from flask import jsonify, request, render_template, redirect, url_for
from app import app, db
from models import BillingRecord
from sqlalchemy import func
from coinbase_commerce.client import Client
from coinbase_commerce.error import SignatureVerificationError, WebhookInvalidPayload
from coinbase_commerce.webhook import Webhook
import os

coinbase_commerce_api_key = os.environ.get('COINBASE_COMMERCE_API_KEY')
coinbase_client = Client(api_key=coinbase_commerce_api_key)

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

@app.route('/analytics')
def analytics():
    total_records = BillingRecord.query.count()
    total_amount = db.session.query(func.sum(BillingRecord.amount)).scalar() or 0
    avg_amount = db.session.query(func.avg(BillingRecord.amount)).scalar() or 0
    
    paid_records = BillingRecord.query.filter_by(paid=True).count()
    crypto_payments = db.session.query(func.sum(BillingRecord.amount)).filter_by(paid=True).scalar() or 0
    
    # Get data for the chart
    amount_ranges = [0, 100, 500, 1000, 5000, float('inf')]
    labels = ['$0-$100', '$100-$500', '$500-$1000', '$1000-$5000', '$5000+']
    data = []
    
    for i in range(len(amount_ranges) - 1):
        count = BillingRecord.query.filter(BillingRecord.amount >= amount_ranges[i], 
                                           BillingRecord.amount < amount_ranges[i+1]).count()
        data.append(count)

    return render_template('analytics.html', 
                           total_records=total_records,
                           total_amount=total_amount,
                           avg_amount=avg_amount,
                           paid_records=paid_records,
                           crypto_payments=crypto_payments,
                           chart_labels=labels,
                           chart_data=data)

@app.route('/create_charge/<int:record_id>')
def create_charge(record_id):
    record = BillingRecord.query.get_or_404(record_id)
    
    charge_data = {
        'name': f'Medical Bill - {record.patient_name}',
        'description': record.service_description,
        'local_price': {
            'amount': str(record.amount),
            'currency': 'USD'
        },
        'pricing_type': 'fixed_price',
        'metadata': {
            'record_id': record.id
        }
    }
    
    charge = coinbase_client.charge.create(**charge_data)
    
    return redirect(charge.hosted_url)

@app.route('/coinbase_webhook', methods=['POST'])
def coinbase_webhook():
    webhook_secret = os.environ.get('COINBASE_COMMERCE_WEBHOOK_SECRET')
    
    request_data = request.data.decode('utf-8')
    request_sig = request.headers.get('X-CC-Webhook-Signature', None)

    try:
        event = Webhook.construct_event(request_data, request_sig, webhook_secret)

        if event['type'] == 'charge:confirmed':
            record_id = event['data']['metadata']['record_id']
            record = BillingRecord.query.get(record_id)
            if record:
                record.paid = True
                db.session.commit()

        return jsonify({'success': True}), 200
    except (SignatureVerificationError, WebhookInvalidPayload) as e:
        return jsonify({'success': False, 'message': str(e)}), 400
