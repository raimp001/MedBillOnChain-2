from flask import Blueprint, render_template, request, redirect, url_for
from flask_login import login_required, current_user
from models import Invoice, Service
from app import db

billing = Blueprint('billing', __name__)

@billing.route('/create_invoice', methods=['GET', 'POST'])
@login_required
def create_invoice():
    if request.method == 'POST':
        patient_id = request.form.get('patient_id')
        provider_id = request.form.get('provider_id')
        amount = request.form.get('amount')
        services = request.form.getlist('services')
        
        new_invoice = Invoice(patient_id=patient_id, provider_id=provider_id, amount=amount, status='Pending')
        db.session.add(new_invoice)
        db.session.commit()

        for service in services:
            service_data = service.split(',')
            new_service = Service(invoice_id=new_invoice.id, description=service_data[0], icd_code=service_data[1], cost=service_data[2])
            db.session.add(new_service)
        
        db.session.commit()

        return redirect(url_for('main.invoice', invoice_id=new_invoice.id))

    return render_template('create_invoice.html')

@billing.route('/pay_invoice/<int:invoice_id>', methods=['POST'])
@login_required
def pay_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    # Process payment logic here
    invoice.status = 'Paid'
    db.session.commit()
    return redirect(url_for('main.invoice', invoice_id=invoice_id))
