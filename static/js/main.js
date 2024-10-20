document.addEventListener('DOMContentLoaded', () => {
    const billingForm = document.getElementById('billing-form');
    const recordsList = document.getElementById('records-list');

    // Load billing records
    loadBillingRecords();

    // Add new billing record
    if (billingForm) {
        billingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(billingForm);
            const record = {
                patient_name: formData.get('patient_name'),
                medical_record_number: formData.get('medical_record_number'),
                service_description: formData.get('service_description'),
                amount: parseFloat(formData.get('amount'))
            };

            try {
                const response = await fetch('/api/billing_records', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(record)
                });

                if (response.ok) {
                    billingForm.reset();
                    loadBillingRecords();
                } else {
                    console.error('Failed to add record');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    async function loadBillingRecords() {
        try {
            const response = await fetch('/api/billing_records');
            const records = await response.json();
            displayRecords(records);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function displayRecords(records) {
        if (recordsList) {
            recordsList.innerHTML = '';
            records.forEach(record => {
                const li = document.createElement('li');
                li.className = 'mb-4 p-4 bg-white rounded-lg shadow-md transition duration-300 hover:shadow-lg';
                li.innerHTML = `
                    <div class="flex justify-between items-center mb-2">
                        <h3 class="text-lg font-semibold text-indigo-700">${record.patient_name}</h3>
                        <span class="text-sm text-gray-500">${record.date}</span>
                    </div>
                    <p class="mb-2"><strong class="text-gray-700">Medical Record Number:</strong> ${record.medical_record_number}</p>
                    <p class="mb-2"><strong class="text-gray-700">Service:</strong> ${record.service_description}</p>
                    <p class="mb-4"><strong class="text-gray-700">Amount:</strong> $${record.amount.toFixed(2)}</p>
                    <div class="flex justify-end space-x-2">
                        <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300" onclick="editRecord(${record.id})">Edit</button>
                        <button class="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300" onclick="deleteRecord(${record.id})">Delete</button>
                        ${!record.paid ? `<button class="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md transition duration-300" onclick="initiatePayment(${record.id}, ${record.amount})">Pay with Crypto</button>` : '<span class="text-green-600 font-semibold">Paid</span>'}
                    </div>
                `;
                recordsList.appendChild(li);
            });
        }
    }

    window.editRecord = async (id) => {
        if (!billingForm) return;
        const response = await fetch(`/api/billing_records/${id}`);
        const record = await response.json();
        
        document.getElementById('patient_name').value = record.patient_name;
        document.getElementById('medical_record_number').value = record.medical_record_number;
        document.getElementById('service_description').value = record.service_description;
        document.getElementById('amount').value = record.amount;
        
        billingForm.onsubmit = async (e) => {
            e.preventDefault();
            const formData = new FormData(billingForm);
            const updatedRecord = {
                patient_name: formData.get('patient_name'),
                medical_record_number: formData.get('medical_record_number'),
                service_description: formData.get('service_description'),
                amount: parseFloat(formData.get('amount'))
            };

            try {
                const response = await fetch(`/api/billing_records/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedRecord)
                });

                if (response.ok) {
                    billingForm.reset();
                    loadBillingRecords();
                    billingForm.onsubmit = null; // Reset form submit handler
                } else {
                    console.error('Failed to update record');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
    };

    window.deleteRecord = async (id) => {
        if (confirm('Are you sure you want to delete this record?')) {
            try {
                const response = await fetch(`/api/billing_records/${id}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    loadBillingRecords();
                } else {
                    console.error('Failed to delete record');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

    window.initiatePayment = async (recordId, amount) => {
        try {
            const response = await fetch(`/api/create_cdp_session/${recordId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ amount: amount })
            });

            if (response.ok) {
                const { chargeId, hostedUrl } = await response.json();
                // Open the Coinbase Commerce hosted checkout page
                window.open(hostedUrl, '_blank');
                
                // You may want to implement a way to check the payment status periodically
                // and update the UI accordingly. For now, we'll just reload the records
                // after a short delay.
                setTimeout(() => {
                    loadBillingRecords();
                }, 5000);
            } else {
                console.error('Failed to create payment session');
                alert('Failed to initiate payment. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while initiating the payment. Please try again.');
        }
    };
});
