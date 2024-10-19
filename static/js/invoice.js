document.addEventListener('DOMContentLoaded', function() {
    // Function to handle invoice creation
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
        }
    }

    // Function to handle invoice list
    function handleInvoiceList() {
        const invoiceList = document.getElementById('invoice-list');
        if (invoiceList) {
            // Add any invoice list specific functionality here
        }
    }

    // Determine which page we're on and run the appropriate function
    if (document.getElementById('invoice-form')) {
        handleInvoiceCreation();
    } else if (document.getElementById('invoice-list')) {
        handleInvoiceList();
    }

    function addService() {
        const servicesList = document.getElementById('services-list');
        if (!servicesList) return;
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
        if (!invoiceForm) return;
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
                throw new Error('Network response was not ok');
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
});

// Make updateTotal function globally available
window.updateTotal = function() {
    const totalSpan = document.getElementById('total');
    if (!totalSpan) return;
    const costs = Array.from(document.getElementsByName('cost')).map(input => parseFloat(input.value) || 0);
    const total = costs.reduce((sum, cost) => sum + cost, 0);
    totalSpan.textContent = total.toFixed(2);
}

// Add error event listener to catch and log any unhandled errors
window.addEventListener('error', function(event) {
    console.error('Unhandled error:', event.error);
});
