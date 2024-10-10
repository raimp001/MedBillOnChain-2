from flask import Blueprint, request, jsonify
from coinbase_onchain_kit import CoinbaseOnchainKit

crypto = Blueprint('crypto', __name__)

onchain_kit = CoinbaseOnchainKit(network="testnet")

@crypto.route('/create_payment', methods=['POST'])
def create_payment():
    amount = request.json['amount']
    currency = request.json['currency']
    
    payment = onchain_kit.create_payment(amount, currency)
    return jsonify(payment)

@crypto.route('/check_payment/<payment_id>', methods=['GET'])
def check_payment(payment_id):
    status = onchain_kit.check_payment_status(payment_id)
    return jsonify({"status": status})
