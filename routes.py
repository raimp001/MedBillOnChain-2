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
    return render_template('react_app.html')

# Keep the rest of the routes as they are...

# Make sure the API routes return JSON data for the React frontend to consume

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

# Keep the rest of the routes as they are...
