import os
from flask import jsonify, request, render_template, redirect, url_for, send_from_directory
from app import app, db
from models import BillingRecord
from sqlalchemy import func
import requests
from datetime import datetime, timedelta
from dotenv import load_dotenv
from coinbase_commerce.client import Client
from coinbase_commerce.webhook import Webhook
from coinbase_commerce.error import SignatureVerificationError, WebhookInvalidPayload
from web3 import Web3

load_dotenv()

@app.route('/')
def index():
    return render_template('react_app.html')

@app.route('/static/react-app/dist/<path:filename>')
def serve_static(filename):
    return send_from_directory(os.path.join(app.root_path, 'react-app', 'dist'), filename)

# Keep the existing routes...

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

@app.route('/api/base_payment', methods=['POST'])
def base_payment():
    data = request.json
    amount = data['amount']
    
    # Connect to Base (Goerli testnet for now)
    w3 = Web3(Web3.HTTPProvider('https://goerli.base.org'))
    
    # Check if connected
    if not w3.isConnected():
        return jsonify({'error': 'Unable to connect to Base network'}), 500
    
    # TODO: Implement actual payment logic here
    # This would involve creating and signing a transaction
    # For now, we'll just return a success message
    
    return jsonify({'message': f'Payment of {amount} processed on Base (simulated)'}), 200

# Keep the rest of the routes as they are...
