from flask import Blueprint, render_template, request, redirect, url_for
from models import Invoice, Service
from app import db
import logging

main = Blueprint('main', __name__)

@main.route('/')
def index():
    logging.debug("Index route accessed")
    return render_template('dashboard.html')

@main.route('/profile')
def profile():
    logging.debug("Profile route accessed")
    return render_template('profile.html')

@main.route('/invoice/<int:invoice_id>')
def invoice(invoice_id):
    logging.debug(f"Invoice route accessed for invoice_id: {invoice_id}")
    # Fetch invoice data from database
    invoice = Invoice.query.get_or_404(invoice_id)
    return render_template('invoice.html', invoice=invoice)

@main.route('/dashboard')
def dashboard():
    logging.debug("Dashboard route accessed")
    # Fetch all invoices for the dashboard
    invoices = Invoice.query.all()
    return render_template('dashboard.html', invoices=invoices)

@main.route('/create_invoice', methods=['GET', 'POST'])
def create_invoice():
    if request.method == 'POST':
        # Extract form data
        patient_name = request.form.get('patient-name')
        patient_email = request.form.get('patient-email')
        patient_address = request.form.get('patient-address')
        services = request.form.getlist('service')
        icd_codes = request.form.getlist('icd')
        costs = request.form.getlist('cost')
        
        # Create new invoice
        new_invoice = Invoice(patient_name=patient_name, patient_email=patient_email, patient_address=patient_address, status='Pending')
        db.session.add(new_invoice)
        db.session.flush()  # This will assign an ID to new_invoice
        
        # Add services to the invoice
        total_amount = 0
        for service, icd, cost in zip(services, icd_codes, costs):
            new_service = Service(invoice_id=new_invoice.id, description=service, icd_code=icd, cost=float(cost))
            db.session.add(new_service)
            total_amount += float(cost)
        
        new_invoice.amount = total_amount
        db.session.commit()
        
        return redirect(url_for('main.invoice', invoice_id=new_invoice.id))
    
    return render_template('create_invoice.html')

@main.route('/pay_invoice/<int:invoice_id>', methods=['POST'])
def pay_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    # Process payment logic here (to be implemented with Coinbase OnchainKit)
    invoice.status = 'Paid'
    db.session.commit()
    return redirect(url_for('main.invoice', invoice_id=invoice_id))
