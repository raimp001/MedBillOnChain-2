document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('invoice-form')) {
        handleInvoiceCreation();
    } else if (document.getElementById('invoice-list')) {
        handleInvoiceList();
    } else if (document.querySelector('.invoice-container')) {
        handleIndividualInvoice();
    } else {
        console.log('Current page does not require specific invoice JavaScript functionality');
    }
});

function handleInvoiceCreation() {
    const addServiceButton = document.getElementById('add-service');
    const servicesList = document.getElementById('services-list');
    const totalSpan = document.getElementById('total');
    const invoiceForm = document.getElementById('invoice-form');

    if (addServiceButton && servicesList && totalSpan && invoiceForm) {
        addServiceButton.addEventListener('click', addService);
        invoiceForm.addEventListener('submit', generateInvoice);
        // Add an initial service row
        addService();
    } else {
        console.error('One or more required elements not found for invoice creation');
    }
}

function handleInvoiceList() {
    const invoiceList = document.getElementById('invoice-list');
    if (invoiceList) {
        // Add any invoice list specific functionality here
    } else {
        console.error('Invoice list element not found');
    }
}

function handleIndividualInvoice() {
    console.log('Individual invoice view detected');
    // Add specific functionality for individual invoice view
    const payButton = document.querySelector('.pay-button');
    if (payButton) {
        payButton.addEventListener('click', handlePayment);
    }
    const cryptoPayButton = document.querySelector('.crypto-pay-button');
    if (cryptoPayButton) {
        cryptoPayButton.addEventListener('click', handleCryptoPayment);
    }
}

function handlePayment(event) {
    // Prevent the default form submission
    event.preventDefault();
    // Get the form and submit it programmatically
    const form = event.target.closest('form');
    if (form) {
        form.submit();
    }
}

function handleCryptoPayment(event) {
    // Prevent the default button click
    event.preventDefault();
    // Get the invoice ID from the data attribute
    const invoiceId = event.target.getAttribute('data-invoice-id');
    if (invoiceId) {
        initiateCryptoPayment(invoiceId);
    }
}

function addService() {
    const servicesList = document.getElementById('services-list');
    if (!servicesList) {
        console.error('Services list not found');
        return;
    }
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><input type="text" name="service" required></td>
        <td><input type="text" name="icd" required></td>
        <td><input type="number" name="cost" step="0.01" required onchange="updateTotal()"></td>
    `;
    servicesList.appendChild(newRow);
    updateTotal();
}

function generateInvoice(event) {
    event.preventDefault();
    const invoiceForm = document.getElementById('invoice-form');
    if (!invoiceForm) {
        console.error('Invoice form not found');
        return;
    }
    const formData = new FormData(invoiceForm);
    const invoiceData = {
        patientName: formData.get('patient-name'),
        patientEmail: formData.get('patient-email'),
        patientAddress: formData.get('patient-address'),
        services: [],
        total: parseFloat(document.getElementById('total').textContent || '0'),
        additionalNotes: formData.get('additional-notes')
    };

    const services = formData.getAll('service');
    const icds = formData.getAll('icd');
    const costs = formData.getAll('cost');

    for (let i = 0; i < services.length; i++) {
        invoiceData.services.push({
            service: services[i],
            icd: icds[i],
            cost: parseFloat(costs[i])
        });
    }

    fetch('/create_invoice', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Success:', data);
        alert('Invoice generated successfully!');
        window.location.href = `/invoice/${data.invoice_id}`;
    })
    .catch((error) => {
        console.error('Error:', error);
        alert('Failed to generate invoice. Please try again. Error: ' + error.message);
    });
}

// Make updateTotal function globally available
window.updateTotal = function() {
    const totalSpan = document.getElementById('total');
    if (!totalSpan) {
        console.error('Total span not found');
        return;
    }
    const costs = Array.from(document.getElementsByName('cost')).map(input => parseFloat(input.value) || 0);
    const total = costs.reduce((sum, cost) => sum + cost, 0);
    totalSpan.textContent = total.toFixed(2);
}

// Add error event listener to catch and log any unhandled errors
window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
});

// Add unhandled promise rejection listener
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});

// Functions for crypto payment (these were in the invoice.html template, moved here for better organization)
function initiateCryptoPayment(invoiceId) {
    fetch(`/crypto_payment/${invoiceId}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('payment-address').textContent = data.payment_address;
            document.getElementById('payment-amount').textContent = data.payment_amount;
            document.getElementById('payment-currency').textContent = data.payment_currency;
            document.getElementById('crypto-payment-info').style.display = 'block';
            alert('Crypto payment initiated. Please send the payment to the provided address.');
        } else {
            alert('Error initiating crypto payment: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while initiating the crypto payment.');
    });
}

function checkCryptoPayment(invoiceId) {
    fetch(`/check_crypto_payment/${invoiceId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Payment status: ' + data.status);
            if (data.status === 'completed') {
                location.reload();
            }
        } else {
            alert('Error checking payment status: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while checking the payment status.');
    });
}
