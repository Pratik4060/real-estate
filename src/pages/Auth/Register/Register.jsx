import React from 'react';
import './Register.css';

const Register = () => {
  return (
    <div className="register-container">
      <div className="register-box">
        <h2>Register for Estate Flow CRM</h2>
        <form>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Enter your full name" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Enter your password" />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" placeholder="Confirm your password" />
          </div>
          <button type="submit" className="register-btn">Register</button>
        </form>
        <p className="login-link">
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
