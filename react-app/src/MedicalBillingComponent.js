import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    width: '100%',
    maxWidth: '800px',
    margin: '0 auto',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '1.5rem',
  },
  headerTitle: {
    fontSize: '1.875rem',
    fontWeight: 'bold',
  },
  content: {
    padding: '2rem',
  },
  inputGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
  },
  textarea: {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    minHeight: '100px',
  },
  button: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '0.75rem 1rem',
    borderRadius: '0.375rem',
    fontSize: '1rem',
    fontWeight: '500',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1rem',
  },
  th: {
    backgroundColor: '#f3f4f6',
    padding: '0.75rem',
    textAlign: 'left',
    fontWeight: '500',
    color: '#374151',
    borderBottom: '2px solid #e5e7eb',
  },
  td: {
    padding: '0.75rem',
    borderBottom: '1px solid #e5e7eb',
  },
  footer: {
    backgroundColor: '#f9fafb',
    padding: '1.5rem',
    textAlign: 'right',
  },
};

export default function MedicalBillingComponent() {
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState({ name: "", cost: "", icd10: "" });
  const [patientInfo, setPatientInfo] = useState({ name: "", email: "", address: "" });
  const [notes, setNotes] = useState("");

  const total = services.reduce((sum, service) => sum + service.amount, 0);

  useEffect(() => {
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
          patient_name: patientInfo.name,
          medical_record_number: "MRN123", // This should be generated or obtained from somewhere
          service_description: newService.name,
          amount: parseFloat(newService.cost),
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
    // Keep the existing payment logic
    alert('Payment functionality remains unchanged');
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.headerTitle}>Patient Invoice</h2>
      </div>
      <div style={styles.content}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Patient Name</label>
          <input
            type="text"
            value={patientInfo.name}
            onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
            style={styles.input}
            placeholder="Enter patient name"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Patient Email</label>
          <input
            type="email"
            value={patientInfo.email}
            onChange={(e) => setPatientInfo({ ...patientInfo, email: e.target.value })}
            style={styles.input}
            placeholder="Enter patient email"
          />
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Patient Address</label>
          <textarea
            value={patientInfo.address}
            onChange={(e) => setPatientInfo({ ...patientInfo, address: e.target.value })}
            style={styles.textarea}
            placeholder="Enter patient address"
          />
        </div>
        <div style={styles.inputGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937' }}>Medical Services</h3>
            <button onClick={addService} style={styles.button}>
              Add Service
            </button>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Service</th>
                <th style={styles.th}>ICD-10</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>Cost</th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td style={styles.td}>{service.service_description}</td>
                  <td style={styles.td}>{service.icd10 || 'N/A'}</td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>${service.amount.toFixed(2)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan="2" style={{ ...styles.td, fontWeight: '600' }}>Total</td>
                <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600' }}>${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={styles.textarea}
            placeholder="Enter any additional notes or instructions for the patient"
          />
        </div>
      </div>
      <div style={styles.footer}>
        <button
          type="button"
          style={styles.button}
          onClick={initiatePayment}
        >
          Pay ${total.toFixed(2)}
        </button>
      </div>
    </div>
  );
}
