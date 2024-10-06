import React, { useState, useEffect } from 'react';

export default function MedicalBillingComponent() {
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [cryptoCurrency, setCryptoCurrency] = useState("btc");
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", cost: "", icd10: "" });

  const total = services.reduce((sum, service) => sum + service.cost, 0);

  useEffect(() => {
    // Fetch services from Flask backend
    fetch('/api/billing_records')
      .then(response => response.json())
      .then(data => setServices(data))
      .catch(error => console.error('Error fetching services:', error));
  }, []);

  const addService = () => {
    if (newService.name && newService.cost && newService.icd10) {
      fetch('/api/billing_records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_name: "Test Patient", // You might want to add a field for this
          medical_record_number: "MRN123", // You might want to add a field for this
          service_description: newService.name,
          amount: parseFloat(newService.cost),
          // You might want to add the ICD10 code to your backend model
        }),
      })
        .then(response => response.json())
        .then(data => {
          setServices([...services, data]);
          setNewService({ name: "", cost: "", icd10: "" });
        })
        .catch(error => console.error('Error adding service:', error));
    }
  };

  const initiatePayment = () => {
    fetch(`/api/create_cdp_session/${services[0].id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ amount: total }),
    })
      .then(response => response.json())
      .then(data => {
        window.open(data.hostedUrl, '_blank');
      })
      .catch(error => console.error('Error initiating payment:', error));
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="bg-blue-500 text-white p-4">
        <h2 className="text-2xl">Bill Summary</h2>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Services</h3>
              <button onClick={addService} className="bg-blue-500 text-white px-4 py-2 rounded">Add Service</button>
            </div>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.id} className="flex justify-between text-gray-700">
                  <span>{service.service_description}</span>
                  <span>${service.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t flex justify-between font-semibold text-gray-800">
              <span>Total Due:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Payment Method</h3>
            <div>
              <label>
                <input
                  type="radio"
                  value="credit_card"
                  checked={paymentMethod === "credit_card"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Credit Card
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="bank_transfer"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Bank Transfer
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  value="crypto"
                  checked={paymentMethod === "crypto"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                Cryptocurrency
              </label>
            </div>
          </div>
          {paymentMethod === "crypto" && (
            <div>
              <label htmlFor="crypto_select">Select Cryptocurrency</label>
              <select
                id="crypto_select"
                value={cryptoCurrency}
                onChange={(e) => setCryptoCurrency(e.target.value)}
              >
                <option value="btc">Bitcoin (BTC)</option>
                <option value="eth">Ethereum (ETH)</option>
                <option value="usdt">Tether (USDT)</option>
              </select>
            </div>
          )}
        </div>
      </div>
      <div className="bg-gray-50 p-4">
        <button
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          onClick={initiatePayment}
        >
          Pay ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
