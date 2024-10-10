document.addEventListener('DOMContentLoaded', function() {
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        const addServiceButton = document.getElementById('add-service');
        const servicesList = document.getElementById('services-list');
        const totalInput = document.getElementById('total');

        if (addServiceButton && servicesList && totalInput) {
            addServiceButton.addEventListener('click', addService);
            invoiceForm.addEventListener('submit', generateInvoice);
        }

        function addService() {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td><input type="text" name="service" required></td>
                <td><input type="text" name="icd" required></td>
                <td><input type="number" name="cost" step="0.01" required onchange="updateTotal()"></td>
                <td><button type="button" onclick="removeService(this)">Remove</button></td>
            `;
            servicesList.appendChild(newRow);
            updateTotal();
        }

        window.removeService = function(button) {
            const row = button.closest('tr');
            if (row && row.parentNode) {
                row.parentNode.removeChild(row);
                updateTotal();
            }
        }

        window.updateTotal = function() {
            const costs = Array.from(document.getElementsByName('cost')).map(input => parseFloat(input.value) || 0);
            const total = costs.reduce((sum, cost) => sum + cost, 0);
            totalInput.value = total.toFixed(2);
        }

        function generateInvoice(event) {
            event.preventDefault();
            // Here you would typically send the form data to the server
            // For this example, we'll just log it to the console
            console.log('Invoice generated', {
                patientName: document.getElementById('patient-name')?.value,
                patientEmail: document.getElementById('patient-email')?.value,
                patientAddress: document.getElementById('patient-address')?.value,
                services: Array.from(servicesList.children).map(row => ({
                    service: row.querySelector('[name="service"]')?.value,
                    icd: row.querySelector('[name="icd"]')?.value,
                    cost: row.querySelector('[name="cost"]')?.value
                })),
                total: totalInput.value,
                additionalNotes: document.getElementById('additional-notes')?.value
            });
            alert('Invoice generated successfully!');
        }
    }
});
