import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAssetPath } from "../../../utils/assetPath";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      if (email === "admin@clinic.com" && password === "admin123") {
        // Admin login
        localStorage.setItem("isAuthenticated", "true");
        
        const userData = {
          email: email,
          name: "Admin User",
          role: "admin"
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Set token expiry (24 hours)
        const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiryTime.toString());
        localStorage.setItem("token", "mock-token-" + Date.now());

        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else if (email === "Agent@clinic.com" && password === "Agent123") {
        // Agent login
        localStorage.setItem("isAuthenticated", "true");
        
        const userData = {
          email: email,
          name: "Agent User",
          role: "agent"
        };
        localStorage.setItem("userData", JSON.stringify(userData));
        
        // Set token expiry (24 hours)
        const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;
        localStorage.setItem("tokenExpiry", expiryTime.toString());
        localStorage.setItem("token", "mock-token-" + Date.now());

        navigate("/agent/dashboard", { replace: true });
      } else {
        setError("Invalid email or password");
        setIsLoading(false);
      }
    }, 1000);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-frame">
        <div className="logo-wrapper">
          <img
            src={getAssetPath("Logo.svg")}
            alt="Estate Flow CRM"
            className="login-logo"
          />
        </div>

        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Manage your properties smarter</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <img src={getAssetPath("email-icon.svg")} alt="Email" className="input-icon" />
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@clinic.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <img

                src={getAssetPath("password-icon.svg")}
                alt="Password"
                className="input-icon"
              />
              <input
                type={showPassword ? "text" : "password"}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
              />
              <img
                src={showPassword ? getAssetPath("eye-off-icon.svg") : getAssetPath("eye-icon.svg")}
                alt={showPassword ? "Hide password" : "Show password"}
                className="eye-icon"
                onClick={togglePasswordVisibility}
              />
            </div>
          </div>

          {error && (
            <div className=" login-error-message">
              {error}
            </div>
          )}

          <button type="submit" className="signin-button" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
