import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddAgent.css";

const AddAgent = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    specialization: "",
    experience: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // remove error while typing
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Validation
  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z ]+$/.test(formData.name)) {
      newErrors.name = "Only letters allowed";
    }

    if (!formData.phone) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Enter valid 10-digit phone";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email";
    }

    if (!formData.password) {
      newErrors.password = "Password required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters";
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.experience) {
      newErrors.experience = "Experience required";
    }

    if (!formData.specialization) {
      newErrors.specialization = "Select specialization";
    }

    if (!formData.address) {
      newErrors.address = "Address required";
    }

    if (!formData.city) {
      newErrors.city = "City required";
    }

    if (!formData.state) {
      newErrors.state = "State required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    const storedAgents = localStorage.getItem("agentsData");
    let agents = storedAgents ? JSON.parse(storedAgents) : [];

    const newAgent = {
      id: agents.length > 0 ? Math.max(...agents.map((a) => a.id)) + 1 : 1,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: formData.address,
      specialization: formData.specialization,
      experience: parseInt(formData.experience),
    };

    const updatedAgents = [...agents, newAgent];
    localStorage.setItem("agentsData", JSON.stringify(updatedAgents));

    navigate("/agents");
  };

  return (
    <div className="aa-container">
      {/* Header */}
      <div className="aa-header">
        <h2>
          <span
            className="aa-breadcrumb-link"
            onClick={() => navigate("/agents")}
          >
            Agent Management
          </span>
          <span> › </span>
          Add Agent
        </h2>
        <p>Add agent and their access</p>
      </div>

      {/* Form */}
      <div className="aa-card">
        <form onSubmit={handleSubmit}>
          
          {/* Contact */}
          <h4 className="aa-section-title">Contact Details</h4>
          <div className="aa-row aa-row-3">
            <Field label="Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} placeholder="Riya Patil"/>
            <Field label="Phone" name="phone" value={formData.phone} onChange={handleChange} error={errors.phone}   placeholder="+91 98765 43210"
/>
            <Field label="Email" name="email" value={formData.email} onChange={handleChange} error={errors.email} placeholder="riya.patil@example.com"/>
          </div>

          {/* Password */}
          <h4 className="aa-section-title">Create ID & Password</h4>
          <div className="aa-row aa-row-2">
            <Field label="Password" name="password" type="password" value={formData.password} onChange={handleChange} error={errors.password}   placeholder="Enter password"
 />
            <Field label="Confirm Password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} placeholder="Confirm password"/>
          </div>

          {/* Professional */}
          <h4 className="aa-section-title">Professional Details</h4>
          <div className="aa-row aa-row-2">
            <Field label="Experience" name="experience" value={formData.experience} onChange={handleChange} error={errors.experience} placeholder="0" />
            
            <div className="aa-field">
              <label>Specialization</label>
              <select
                className={`aa-input ${errors.specialization ? "aa-error-input" : ""}`}
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>Residential Sales</option>
                <option>Commercial Sales</option>
                <option>Rental Sales</option>
                <option>Luxury Properties</option>
              </select>
              {errors.specialization && <span className="aa-error">{errors.specialization}</span>}
            </div>
          </div>

          {/* Address */}
          <h4 className="aa-section-title">Address Information</h4>
          <div className="aa-row aa-row-3">
            <Field label="Address" name="address" value={formData.address} onChange={handleChange} error={errors.address}   placeholder="Blue apartment baner pune"
 />
            <Field label="City" name="city" value={formData.city} onChange={handleChange} error={errors.city}  placeholder= "Pune" />
            <Field label="State" name="state" value={formData.state} onChange={handleChange} error={errors.state} placeholder="Maharashtra"/>
          </div>

          {/* Buttons */}
          <div className="aa-actions">
            <button type="button" className="aa-cancel" onClick={() => navigate("/agents")}>
              Cancel
            </button>
            <button type="submit" className="aa-submit">
              Create Account
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Reusable Field Component
const Field = ({ label, name, value, onChange, error, type = "text", placeholder }) => (
  <div className="aa-field">
    <label>{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}   // ✅ added
      className={`aa-input ${error ? "aa-error-input" : ""}`}
    />
    {error && <span className="aa-error">{error}</span>}
  </div>
);

export default AddAgent;