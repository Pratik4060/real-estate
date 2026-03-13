import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAssetPath } from "../../utils/assetPath";
import "./AgentSidebar.css";

const AgentSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // Clear local storage
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");
      
      // Navigate to login
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      navigate("/login");
    }
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/agent/dashboard",
      icon: "/assets/dashboard.svg",
    },
    {
      name: "Leads",
      path: "/agent/leads",
      icon: "/assets/leads.svg",
    },
    {
      name: "Reports",
      path: "/agent/reports",
      icon: "/assets/Reports.svg",
    },
    {
      name: "Site Visits",
      path: "/agent/site-visits",
      icon: "/assets/Site Visits.svg",
    },
    {
      name: "Log Out",
      path: "/login",
      icon: "/assets/logout.svg",
      isLogout: true,
    },
  ];

  return (
    <aside className={`agent-sidebar ${isOpen ? "open" : ""}`}>
      <div className="agent-sidebar-outer">
        <div className="agent-logo-section">
          <NavLink 
            to="/agent/dashboard" 
            className="agent-logo-container" 
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
              onClose();
            }}
          >
            <img
              src="/assets/Logo.svg"
              alt="Estate Flow CRM"
              className="agent-sidebar-logo"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </NavLink>
        </div>

        <div className="agent-sidebar-inner">
          <nav className="agent-nav-menu">
            {menuItems.map((item) => {
              if (item.isLogout) {
                return (
                  <div
                    key={item.path}
                    className="agent-nav-item"
                    onClick={(e) => {
                      handleLogout(e);
                      onClose();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="agent-nav-icon-wrapper">
                      <img
                        src="/assets/logout.svg"
                        alt={item.name}
                        className="agent-nav-icon"
                        onError={(e) => {
                          const target = e.target;
                          target.style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.className = "agent-nav-icon-fallback";
                          fallback.textContent = item.name.charAt(0);
                          target.parentNode?.appendChild(fallback);
                        }}
                      />
                    </div>
                    <span className="agent-nav-label">{item.name}</span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `agent-nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                    onClose();
                  }}
                >
                  <div className="agent-nav-icon-wrapper">
                    <img
                      src="/assets/placeholder-icon.svg"
                      alt={item.name}
                      className="agent-nav-icon"
                      onError={(e) => {
                        const target = e.target;
                        target.style.display = "none";
                        const fallback = document.createElement("div");
                        fallback.className = "agent-nav-icon-fallback";
                        fallback.textContent = item.name.charAt(0);
                        target.parentNode?.appendChild(fallback);
                      }}
                    />
                  </div>
                  <span className="agent-nav-label">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AgentSidebar;

