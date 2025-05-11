import React, { useState } from 'react';
import api from '../../hooks/api'

const Report = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPdf = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload = {
        form:"4",
        exams: {
            exam_1 : {
                alias : "MID TERM",
                name : "mid_term_1_form_4_2025",
                outof : "34"
            },
            exam_2 : {
                alias : "END TERM",
                name : "end_term_1_form_4_2025",
                outof : "34"
            }
        },
        formula:"average",
        yearValue : 2025
    }
      
      const response = await api.post('/pdfr/pdfr', payload, {
        responseType: 'blob'
      });
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
    } catch (err) {
      console.error('Error fetching PDF:', err);
      setError('Failed to load PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>PDF Report Generator</h1>
      
      <button 
        onClick={fetchPdf}
        disabled={loading}
        style={{
          padding: '10px 20px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px'
        }}
      >
        {loading ? 'Generating PDF...' : 'Generate PDF Report'}
      </button>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          {error}
        </div>
      )}
      
      {pdfUrl && (
        <div>
          <h2>Generated PDF:</h2>
          <iframe 
            src={pdfUrl}
            title="PDF Report"
            width="100%"
            height="600px"
            style={{ border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
      )}
    </div>
  );
}

export default Report;
