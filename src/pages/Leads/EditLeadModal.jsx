import React, { useState, useEffect } from "react";
import "./EditLeadModal.css";

const EditLeadModal = ({
  showModal,
  setShowModal,
  modalMode,
  currentLead,
  handleSubmit,
  statusOptions,
  requirementOptions
}) => {

  const [formData, setFormData] = useState({});
  const [verification, setVerification] = useState({
    mobileVerified: false,
    leadVerified: false,
    emailValid: false
  });

  // Load data when modal opens
  useEffect(() => {
    if (modalMode === "edit" && currentLead) {
      setFormData(currentLead);
      setVerification(
        currentLead.verification || {
          mobileVerified: false,
          leadVerified: false,
          emailValid: false
        }
      );
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        requirement: "Buy",
        budget: "",
        location: "",
        agent: "",
        followUp: "",
        status: "New"
      });
    }
  }, [modalMode, currentLead]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerificationChange = (field) => {
    setVerification((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData, verification);
  };

  if (!showModal) return null;

  return (
    <div className="edit-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="edit-modal" onClick={(e) => e.stopPropagation()}>

        <div className="edit-modal-header">
          <h2>{modalMode === "add" ? "Add New Lead" : "Edit Lead"}</h2>
          <button className="edit-modal-close" onClick={() => setShowModal(false)}>×</button>
        </div>

        <form onSubmit={onSubmit}>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label>Lead Name</label>
              <input name="name" value={formData.name || ""} onChange={handleInputChange} />
            </div>

            <div className="edit-form-group">
              <label>Phone</label>
              <input name="phone" value={formData.phone || ""} onChange={handleInputChange} />
            </div>
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label>Location</label>
              <input name="location" value={formData.location || ""} onChange={handleInputChange} />
            </div>

            <div className="edit-form-group">
              <label>{modalMode === "add" ? "Email ID" : "Budget"}</label>
              <input
                name={modalMode === "add" ? "email" : "budget"}
                value={modalMode === "add" ? formData.email || "" : formData.budget || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label>Agent Name</label>
              <input name="agent" value={formData.agent || ""} onChange={handleInputChange} />
            </div>

            <div className="edit-form-group">
              <label>Follow-up Date</label>
              <input type="date" name="followUp" value={formData.followUp || ""} onChange={handleInputChange} />
            </div>
          </div>

          <div className="edit-form-row">
            <div className="edit-form-group">
              <label>Requirement Type</label>
              <select name="requirement" value={formData.requirement || ""} onChange={handleInputChange}>
                {requirementOptions.map((opt) => (
                  <option key={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div className="edit-form-group">
              <label>Lead Status</label>
              <select name="status" value={formData.status || ""} onChange={handleInputChange}>
                {statusOptions
                  .filter((s) => s !== "All Status")
                  .map((opt) => (
                    <option key={opt}>{opt}</option>
                  ))}
              </select>
            </div>
          </div>

          {modalMode === "edit" && (
            <div className="edit-verification">
              <p>Contact Verification</p>

              <div className="edit-toggle-row">
                {["mobileVerified", "leadVerified", "emailValid"].map((key) => (
                  <label key={key}>
                    {key}
                    <input
                      type="checkbox"
                      checked={verification[key]}
                      onChange={() => handleVerificationChange(key)}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="edit-modal-footer">
            <button type="button" onClick={() => setShowModal(false)}>
              Cancel
            </button>

            <button type="submit">
              {modalMode === "add" ? "Add Leads" : "Edit Lead"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditLeadModal;