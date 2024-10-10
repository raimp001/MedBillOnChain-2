document.addEventListener('DOMContentLoaded', function() {
    fetchInvoices();
});

function fetchInvoices() {
    // In a real application, this would be an API call
    // For this example, we'll use mock data
    const mockInvoices = [
        { id: 1, patient: "John Doe", amount: 150.00, status: "Pending" },
        { id: 2, patient: "Jane Smith", amount: 225.00, status: "Paid" },
    ];

    const invoiceList = document.getElementById('invoice-list');
    invoiceList.innerHTML = '';

    mockInvoices.forEach(invoice => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${invoice.id}</td>
            <td>${invoice.patient}</td>
            <td>$${invoice.amount.toFixed(2)}</td>
            <td>${invoice.status}</td>
            <td><button onclick="viewInvoice(${invoice.id})">View</button></td>
        `;
        invoiceList.appendChild(row);
    });
}

function viewInvoice(invoiceId) {
    window.location.href = `/invoice/${invoiceId}`;
}
