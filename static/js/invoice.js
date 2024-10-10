document.addEventListener('DOMContentLoaded', function() {
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
        console.error('One or more required elements are missing from the DOM');
    }

    function addService() {
        if (!servicesList) {
            console.error('Services list element not found');
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
            total: parseFloat(totalSpan ? totalSpan.textContent : '0'),
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
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            alert('Invoice generated successfully!');
            window.location.href = `/invoice/${data.invoice_id}`;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Failed to generate invoice. Please try again.');
        });
    }
});

// Make updateTotal function globally available
window.updateTotal = function() {
    const totalSpan = document.getElementById('total');
    if (!totalSpan) {
        console.error('Total span element not found');
        return;
    }
    const costs = Array.from(document.getElementsByName('cost')).map(input => parseFloat(input.value) || 0);
    const total = costs.reduce((sum, cost) => sum + cost, 0);
    totalSpan.textContent = total.toFixed(2);
}
