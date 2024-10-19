
from flask import Blueprint, render_template, request, redirect, url_for, jsonify, current_app, flash
from models import Invoice, Service
from app import db
import logging

main = Blueprint('main', __name__)

@main.route('/')
def index():
    logging.debug("Index route accessed")
    return redirect(url_for('main.invoices_list'))

@main.route('/invoices')
def invoices_list():
    invoices = Invoice.query.all()
    return render_template('invoices_list.html', invoices=invoices)

@main.route('/invoice/<int:invoice_id>')
def invoice(invoice_id):
    logging.debug(f"Invoice route accessed for invoice_id: {invoice_id}")
    invoice = Invoice.query.get_or_404(invoice_id)
    return render_template('invoice.html', invoice=invoice)

@main.route('/create_invoice', methods=['GET', 'POST'])
def create_invoice():
    if request.method == 'POST':
        try:
            data = request.json
            # Validate required fields
            required_fields = ['patientName', 'patientEmail', 'patientAddress', 'services', 'total']
            for field in required_fields:
                if field not in data:
                    raise ValueError(f"Missing required field: {field}")

            new_invoice = Invoice(
                patient_name=data['patientName'],
                patient_email=data['patientEmail'],
                patient_address=data['patientAddress'],
                amount=float(data['total']),
                status='Pending',
                additional_notes=data.get('additionalNotes', '')
            )
            db.session.add(new_invoice)
            db.session.flush()

            for service in data['services']:
                new_service = Service(
                    invoice_id=new_invoice.id,
                    description=service['service'],
                    icd_code=service['icd'],
                    cost=float(service['cost'])
                )
                db.session.add(new_service)

            db.session.commit()
            current_app.logger.info(f"Invoice created successfully: {new_invoice.id}")
            flash('Invoice created successfully', 'success')
            return jsonify({'success': True, 'invoice_id': new_invoice.id}), 201
        except Exception as e:
            db.session.rollback()
            current_app.logger.error(f"Error creating invoice: {str(e)}")
            flash('Error creating invoice. Please try again.', 'error')
            return jsonify({'error': str(e)}), 400

    return render_template('create_invoice.html')

@main.route('/pay_invoice/<int:invoice_id>', methods=['POST'])
def pay_invoice(invoice_id):
    invoice = Invoice.query.get_or_404(invoice_id)
    invoice.status = 'Paid'
    db.session.commit()
    flash('Invoice paid successfully', 'success')
    return redirect(url_for('main.invoice', invoice_id=invoice_id))

@main.route('/api/invoices', methods=['GET'])
def get_invoices():
    invoices = Invoice.query.all()
    return jsonify([{
        'id': invoice.id,
        'patient_name': invoice.patient_name,
        'amount': invoice.amount,
        'status': invoice.status
    } for invoice in invoices])
