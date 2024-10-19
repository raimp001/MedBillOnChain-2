# Mock implementation of CoinbaseOnchainKit
class CoinbaseOnchainKit:
    def __init__(self, network="testnet"):
        self.network = network

    def create_payment(self, amount, currency):
        # Mock payment creation
        return {
            'id': 'mock_payment_id',
            'address': '0x1234567890abcdef',
            'amount': amount,
            'currency': currency
        }

    def check_payment_status(self, payment_id):
        # Mock payment status check
        return 'completed'

onchain_kit = CoinbaseOnchainKit(network="testnet")
