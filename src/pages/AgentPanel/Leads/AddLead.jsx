import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddLead.css";

const AddLead = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    requirements: "",
    budget: "",
    location: "",
    leadType: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Get existing leads from admin storage
    const storedAdminLeads = JSON.parse(localStorage.getItem("leadsData")) || [];
    
    // Get existing leads from agent storage
    const storedAgentLeads = JSON.parse(localStorage.getItem("agentLeadsData")) || [];

    // Create new lead with admin format
    const newAdminLead = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      requirement: formData.requirements,
      budget: formData.budget,
      location: formData.location,
      leadQuality: formData.leadType || "Lead Quality",
      status: "New",
      agent: "Current Agent",
      followUp: "",
      internalNotes: "",
      verification: {
        mobileVerified: false,
        leadVerified: false,
        emailValid: false
      }
    };

    // Create new lead with agent format
    const newAgentLead = {
      id: Date.now().toString(),
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      requirement: formData.requirements,
      budget: formData.budget,
      location: formData.location,
      leadType: formData.leadType,
      status: "New",
    };

    // Update both storages
    const updatedAdminLeads = [...storedAdminLeads, newAdminLead];
    const updatedAgentLeads = [...storedAgentLeads, newAgentLead];

    localStorage.setItem("leadsData", JSON.stringify(updatedAdminLeads));
    localStorage.setItem("agentLeadsData", JSON.stringify(updatedAgentLeads));

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('localStorageUpdated'));

    navigate("/agent/leads");
  };

  return (
    <div className="add-lead-container">
      <div className="add-lead-header">
        <h2 className="breadcrumb">
          <span className="breadcrumb-light" onClick={() => navigate("/agent/leads")}>Lead</span>
          <span className="breadcrumb-arrow">›</span>
          <span className="breadcrumb-active">Add Leads</span>
        </h2>      
      </div>
      <form className="add-lead-form" onSubmit={handleSubmit}>
        <h3 className="section-title">Details</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter Lead Name"
              required
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="tel"
              placeholder="Enter Phone Number"
              required
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="Enter Email"
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Requirement</label>
            <select
              required
              onChange={(e) =>
                setFormData({ ...formData, requirements: e.target.value })
              }
            >
              <option value="">Select Requirement</option>
              <option>Buy</option>
              <option>Rent</option>
            </select>
          </div>

          <div className="form-group">
            <label>Budget</label>
            <input
              type="text"
              placeholder="Budget"
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="Location"
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>
        </div>

        <h3 className="section-title">Lead Types & Status</h3>

        <div className="form-row">
          <div className="form-group">
            <label>Lead Types</label>
            <select
              onChange={(e) =>
                setFormData({ ...formData, leadType: e.target.value })
              }
            >
              <option value="">Lead Types</option>
              <option>Hot</option>
              <option>Warm</option>
              <option>Cold</option>
            </select>
          </div>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => navigate("/agent/leads")}>
            Cancel
          </button>
          <button type="submit">Add Leads</button>
        </div>
      </form>    
    </div>
  );
};

export default AddLead;