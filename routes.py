import os
from flask import jsonify, request, render_template, redirect, url_for
from app import app, db
from models import BillingRecord
from sqlalchemy import func
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from coinbase_commerce.client import Client
from coinbase_commerce.webhook import Webhook
from coinbase_commerce.error import SignatureVerificationError, WebhookInvalidPayload

load_dotenv()

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
    
    amount_ranges = [0, 100, 500, 1000, 5000, float('inf')]
    labels = ['$0-$100', '$100-$500', '$500-$1000', '$1000-$5000', '$5000+']
    data = []
    
    for i in range(len(amount_ranges) - 1):
        count = BillingRecord.query.filter(BillingRecord.amount >= amount_ranges[i], 
                                           BillingRecord.amount < amount_ranges[i+1]).count()
        data.append(count)

    crypto_data = {
        'USDC': db.session.query(func.count(BillingRecord.id)).filter_by(paid=True, payment_currency='USDC').scalar() or 0,
        'ETH': db.session.query(func.count(BillingRecord.id)).filter_by(paid=True, payment_currency='ETH').scalar() or 0,
        'BTC': db.session.query(func.count(BillingRecord.id)).filter_by(paid=True, payment_currency='BTC').scalar() or 0,
        'DOGE': db.session.query(func.count(BillingRecord.id)).filter_by(paid=True, payment_currency='DOGE').scalar() or 0
    }

    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    billing_trend = db.session.query(
        func.date(BillingRecord.date).label('date'),
        func.sum(BillingRecord.amount).label('total_amount')
    ).filter(BillingRecord.date >= thirty_days_ago).group_by(func.date(BillingRecord.date)).order_by(func.date(BillingRecord.date)).all()

    billing_trend_labels = [record.date.strftime('%Y-%m-%d') for record in billing_trend]
    billing_trend_data = [float(record.total_amount) for record in billing_trend]

    top_5_bills = BillingRecord.query.order_by(BillingRecord.amount.desc()).limit(5).all()

    return render_template('analytics.html', 
                           total_records=total_records,
                           total_amount=total_amount,
                           avg_amount=avg_amount,
                           paid_records=paid_records,
                           crypto_payments=crypto_payments,
                           chart_labels=labels,
                           chart_data=data,
                           crypto_data=crypto_data,
                           billing_trend_labels=billing_trend_labels,
                           billing_trend_data=billing_trend_data,
                           top_5_bills=top_5_bills)

@app.route('/api/create_cdp_session/<int:record_id>', methods=['POST'])
def create_cdp_session(record_id):
    record = BillingRecord.query.get_or_404(record_id)
    
    client = Client(api_key=os.environ.get('COINBASE_CDP_API_KEY'))
    
    charge = client.charge.create(
        name=f'Medical Bill Payment - Record #{record.id}',
        description=f'Payment for medical services: {record.service_description}',
        pricing_type='fixed_price',
        local_price={
            'amount': str(record.amount),
            'currency': 'USD'
        },
        metadata={
            'record_id': record.id
        }
    )
    
    return jsonify({'chargeId': charge.id, 'hostedUrl': charge.hosted_url}), 200

@app.route('/cdp_webhook', methods=['POST'])
def cdp_webhook():
    webhook_secret = os.environ.get('COINBASE_COMMERCE_WEBHOOK_SECRET')
    
    try:
        event = Webhook.construct_event(
            request.data, request.headers.get('X-CC-Webhook-Signature', ''), webhook_secret
        )
    except (SignatureVerificationError, WebhookInvalidPayload) as e:
        app.logger.error(f"Webhook error: {str(e)}")
        return '', 400

    if event['type'] == 'charge:confirmed':
        charge = event['data']
        record_id = charge['metadata']['record_id']
        payment_currency = charge['payments'][0]['value']['crypto']['currency']
        
        record = BillingRecord.query.get(record_id)
        if record:
            record.paid = True
            record.payment_currency = payment_currency
            db.session.commit()
    
    return '', 200
