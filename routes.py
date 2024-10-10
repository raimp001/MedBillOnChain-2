from flask import Blueprint, render_template
from flask_login import login_required, current_user
import logging

main = Blueprint('main', __name__)

@main.route('/')
def index():
    logging.debug(f"Index route accessed by user: {current_user.username if current_user.is_authenticated else 'Anonymous'}")
    return render_template('dashboard.html')

@main.route('/profile')
@login_required
def profile():
    logging.debug(f"Profile route accessed by user: {current_user.username}")
    return render_template('profile.html')

@main.route('/invoice/<int:invoice_id>')
@login_required
def invoice(invoice_id):
    logging.debug(f"Invoice route accessed by user: {current_user.username} for invoice_id: {invoice_id}")
    # Fetch invoice data from database
    return render_template('invoice.html', invoice_id=invoice_id)

@main.route('/dashboard')
@login_required
def dashboard():
    logging.debug(f"Dashboard route accessed by user: {current_user.username}")
    # Fetch dashboard data from database
    return render_template('dashboard.html')

@main.route('/test')
def test():
    logging.debug("Test route accessed")
    return "Test route working correctly"
