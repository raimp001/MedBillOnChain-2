from flask import Blueprint, render_template
from flask_login import login_required, current_user

main = Blueprint('main', __name__)

@main.route('/')
@login_required
def index():
    return render_template('dashboard.html')

@main.route('/profile')
@login_required
def profile():
    return render_template('profile.html')

@main.route('/invoice/<int:invoice_id>')
@login_required
def invoice(invoice_id):
    # Fetch invoice data from database
    return render_template('invoice.html', invoice_id=invoice_id)

@main.route('/dashboard')
@login_required
def dashboard():
    # Fetch dashboard data from database
    return render_template('dashboard.html')
