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
                li.className = 'mb-4 p-4 bg-white rounded shadow';
                li.innerHTML = `
                    <p><strong>Patient:</strong> ${record.patient_name}</p>
                    <p><strong>Medical Record Number:</strong> ${record.medical_record_number}</p>
                    <p><strong>Service:</strong> ${record.service_description}</p>
                    <p><strong>Amount:</strong> $${record.amount.toFixed(2)}</p>
                    <p><strong>Date:</strong> ${record.date}</p>
                    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2" onclick="editRecord(${record.id})">Edit</button>
                    <button class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2" onclick="deleteRecord(${record.id})">Delete</button>
                    <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onclick="initiatePayment(${record.id}, ${record.amount})">Pay with Crypto</button>
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
                const { sessionId } = await response.json();
                // Implement Coinbase CDP payment flow here
                console.log('Payment initiated with session ID:', sessionId);
                alert('Payment initiated. Please complete the process in the Coinbase window.');
            } else {
                console.error('Failed to create CDP session');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
});
