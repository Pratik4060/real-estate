import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAssetPath } from '../../utils/assetPath';
import './LeadDetails.css';

const LeadDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [internalNotes, setInternalNotes] = useState('');
  const [leadQuality, setLeadQuality] = useState('Lead Quality');
  const [verification, setVerification] = useState({
    mobileVerified: false,
    leadVerified: false,
    emailValid: false
  });


  useEffect(() => {
    loadLeadData();
  }, [id]);

  const loadLeadData = () => {
    setLoading(true);
    try {
      const storedLeads = localStorage.getItem('leadsData');
      if (storedLeads) {
        const leads = JSON.parse(storedLeads);
        const foundLead = leads.find(l => l.id === parseInt(id));
        if (foundLead) {
          setLead(foundLead);
          setInternalNotes(foundLead.internalNotes || '');
          setLeadQuality(foundLead.leadQuality || 'Lead Quality');
          setVerification(foundLead.verification || {
            mobileVerified: false,
            leadVerified: false,
            emailValid: false
          });
        }
      }
    } catch (error) {
      console.error('Error loading lead data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/leads');
  };

  const handleSaveVerification = () => {
    try {
      const storedLeads = localStorage.getItem('leadsData');
      if (storedLeads && lead) {
        const leads = JSON.parse(storedLeads);
        const updatedLeads = leads.map(l => {
          if (l.id === lead.id) {
            return {
              ...l,
              internalNotes: internalNotes,
              leadQuality: leadQuality,
              verification: verification
            };
          }
          return l;
        });
        localStorage.setItem('leadsData', JSON.stringify(updatedLeads));
        alert('Verification saved successfully!');
      }
    } catch (error) {
      console.error('Error saving verification:', error);
      alert('Error saving verification. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!lead) {
    return (
      <div className="lead-details-container">
        <div className="error-message">
          <h2>Lead not found</h2>
          <button className="back-btn" onClick={handleGoBack}>Back to Leads</button>
        </div>
      </div>
    );
  }

  return (
    <div className="lead-details-container">
      {/* Header */}
      <div className="lead-details-header">
        <div className="breadcrumb">
          <span className="breadcrumb-link" onClick={handleGoBack}>Leads</span>
          <span className="breadcrumb-separator">{'>'}</span>
          <span className="breadcrumb-current">Lead Details</span>
        </div>
        <h1 className="page-subtitle">Complete lead information and verification</h1>
      </div>

      {/* Main Content Card */}
      <div className="details-card">
        {/* Contact Details Section */}
        <div className="details-section">
          <h2 className="section-title">Contact Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Name</span>
              <div className="detail-value-box">{lead.name}</div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Phone</span>
              <div className="detail-value-box">{lead.phone}</div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <div className="detail-value-box">{lead.email}</div>
            </div>
          </div>
        </div>

        {/* Requirement Details Section */}
        <div className="details-section">
          <h2 className="section-title">Requirement Details</h2>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Budget</span>
              <div className="detail-value-box budget-value">{lead.budget}</div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Requirement Type</span>
              <div className="detail-value-box">{lead.requirement}</div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Preferred Location</span>
              <div className="detail-value-box">{lead.location}</div>
            </div>
            <div className="detail-item">
              <span className="detail-label">Assigned Agent Name</span>
              <div className="detail-value-box">{lead.agent}</div>
            </div>
          </div>
        </div>

        {/* Lead Verification Section */}
        {/* Lead Verification Section */}
        <div className="details-section">
          <h2 className="section-title">Lead Verification</h2>

          <div className="verification-panel">

            <div className="verification-row">
              <span className="verification-label">Contact Verification</span>

              <div className="verification-status-group">

                <div className="verification-chip">
                  <span className="chip-title">Mobile Verified</span>
                  <span className={`chip-value ${verification.mobileVerified ? "yes" : "no"}`}>
                    {verification.mobileVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="verification-chip">
                  <span className="chip-title">Lead Verified</span>
                  <span className={`chip-value ${verification.leadVerified ? "yes" : "no"}`}>
                    {verification.leadVerified ? "Yes" : "No"}
                  </span>
                </div>

                <div className="verification-chip">
                  <span className="chip-title">Email Valid</span>
                  <span className={`chip-value ${verification.emailValid ? "yes" : "no"}`}>
                    {verification.emailValid ? "Yes" : "No"}
                  </span>
                </div>

              </div>
            </div>

            <div className="verification-row">
              <span className="verification-label">Lead Status</span>

              <div className="detail-value-box status-box">
                {lead.status}
              </div>
            </div>

          </div>
        </div>

        {/* Internal Notes Section */}
        <div className="details-section">
          <h2 className="section-title">Internal Notes (Admin Only)</h2>
          <div className="notes-container">
            <textarea
              className="notes-textarea"
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="Add internal notes here..."
            />
            <div className="lead-quality-container">
              <span className="lead-quality-label"></span>
              <select
                className="lead-quality-select"
                value={leadQuality}
                onChange={(e) => setLeadQuality(e.target.value)}
              >
                <option value="Lead Quality">Lead Quality</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Cold">Cold</option>
              </select>
              <span className="lead-quality-label"></span>
              <select
                className="lead-quality-select"
                value={leadQuality}
                onChange={(e) => setLeadQuality(e.target.value)}
              >
                <option value="Lead Quality">Lead Status</option>
                <option value="Hot">High</option>
                <option value="Warm">Medium</option>
                <option value="Cold">Low</option>
              </select>

            </div>
          </div>
        </div>

        {/* Save Verification Button */}
        <div className="save-verification-container">
          <button className="save-verification-btn" onClick={handleSaveVerification}>
            Save Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;