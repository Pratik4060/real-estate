import React from "react";
import "./ViewLeadModal.css";

const ViewLeadModal = ({ lead, onClose }) => {
  if (!lead) return null;

  return (
    <div className="view-lead-overlay">
      <div className="view-lead-modal">
        <div className="view-lead-header">
          <h2>View Details</h2>
          <button className="view-lead-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="view-lead-body">
          <h3>Details</h3>
          <div className="view-lead-row">
            <div className="view-lead-group">
              <label>Name</label>
              <input value={lead.name || ""} disabled />
            </div>
            <div className="view-lead-group">
              <label>Phone</label>
              <input value={lead.phone || ""} disabled />
            </div>
            <div className="view-lead-group">
              <label>Email Address</label>
              <input value={lead.email || ""} disabled />
            </div>
          </div>

          <div className="view-lead-row">
            <div className="view-lead-group">
              <label>Requirement</label>
              <input value={lead.requirement || ""} disabled />
            </div>
            <div className="view-lead-group">
              <label>Budget</label>
              <input value={lead.budget || ""} disabled />
            </div>
            <div className="view-lead-group">
              <label>Location</label>
              <input value={lead.location || ""} disabled />
            </div>
          </div>

          {/* Show additional fields if available from admin data */}
          {lead.agent && (
            <div className="view-lead-row">
              <div className="view-lead-group">
                <label>Assigned Agent</label>
                <input value={lead.agent} disabled />
              </div>
              {lead.followUp && (
                <div className="view-lead-group">
                  <label>Follow-up Date</label>
                  <input value={lead.followUp} disabled />
                </div>
              )}
            </div>
          )}

          <h3 style={{ marginTop: "20px" }}>Lead Types</h3>
          <div className="view-lead-group">
            <label>Lead Type</label>
            <input value={lead.leadType || ""} disabled />
          </div>

          {/* Show verification status if available */}
          {lead.verification && (
            <>
              <h3 style={{ marginTop: "20px" }}>Verification Status</h3>
              <div className="view-lead-row">
                <div className="view-lead-group">
                  <label>Mobile Verified</label>
                  <input value={lead.verification.mobileVerified ? "Yes" : "No"} disabled />
                </div>
                <div className="view-lead-group">
                  <label>Lead Verified</label>
                  <input value={lead.verification.leadVerified ? "Yes" : "No"} disabled />
                </div>
                <div className="view-lead-group">
                  <label>Email Valid</label>
                  <input value={lead.verification.emailValid ? "Yes" : "No"} disabled />
                </div>
              </div>
            </>
          )}

          {/* Show internal notes if available */}
          {lead.internalNotes && (
            <>
              <h3 style={{ marginTop: "20px" }}>Internal Notes</h3>
              <div className="view-lead-group">
                <textarea 
                  value={lead.internalNotes} 
                  disabled 
                  rows="3"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d0d5dd', fontFamily: 'Poppins' }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLeadModal;