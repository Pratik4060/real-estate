import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAssetPath } from "../../utils/assetPath";
import "./AgentSidebar.css";

const AgentSidebar = ({ isOpen = false, onClose = () => {} }) => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      localStorage.removeItem("token");
      localStorage.removeItem("tokenExpiry");

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
      icon: "/assets/dashboard.svg"
    },
    {
      name: "Leads",
      path: "/agent/leads",
      icon: "/assets/Leads.svg",
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
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="sidebar-outer">
        <div className="agent-sidebar-logo">
          <NavLink
            to="/agent/dashboard"
            className="logo-container"
            onClick={() => {
              window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
              onClose();
            }}
          >
            <img
              src="/assets/Logo.svg"
              alt="Estate Flow CRM"
              className="sidebar-logo"
            />
          </NavLink>
        </div>

        <div className="sidebar-inner">
          <nav className="nav-menu">
            {menuItems.map((item) => {
              if (item.isLogout) {
                return (
                  <div
                    key={item.path}
                    className="nav-item"
                    onClick={(e) => {
                      handleLogout(e);
                      onClose();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="nav-icon-wrapper">
                      <img src={item.icon} alt={item.name} className="nav-icon" />
                    </div>
                    <span className="nav-label">{item.name}</span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item ${isActive ? "active" : ""}`
                  }
                  onClick={() => {
                    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
                    onClose();
                  }}
                >
                  <div className="nav-icon-wrapper">
                    <img src={item.icon} alt={item.name} className="nav-icon" />
                  </div>

                  <span className="nav-label">{item.name}</span>
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