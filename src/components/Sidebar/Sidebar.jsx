import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAssetPath } from "../../utils/assetPath";
import "./Sidebar.css";

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
const navigate = useNavigate();

const handleLogout = async (e) => {
e.preventDefault();
try {
localStorage.removeItem("isAuthenticated");
localStorage.removeItem("userData");
localStorage.removeItem("token");


  navigate("/login");
} catch (error) {
  console.error("Logout error:", error);
  navigate("/login");
}


};

const menuItems = [
{
name: "Dashboard",
path: "/dashboard",
icon: getAssetPath("dashboard.svg"),
},
{
name: "Leads",
path: "/leads",
icon: getAssetPath("Leads.svg"),
},
{
name: "Agents",
path: "/agents",
icon: getAssetPath("Agent.svg"),
},
{
name: "Reports",
path: "/reports",
icon: getAssetPath("Reports.svg"),
},
{
name: "Site Visits",
path: "/site-visits",
icon: getAssetPath("Site Visits.svg"),
},
{
name: "Log Out",
path: "/login",
icon: getAssetPath("logout.svg"),
isLogout: true,
},
];

return (
<aside className={`sidebar ${isOpen ? "open" : ""}`}> <div className="sidebar-outer"> <div className="logo-section">
<NavLink
to="/dashboard"
className="logo-container"
onClick={() => {
window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
onClose();
}}
>
<img
src={getAssetPath("Logo.svg")}
alt="Estate Flow CRM"
className="sidebar-logo"
onError={(e) => {
console.error("Logo failed to load");
const target = e.target;
target.style.display = "none";
}}
/> </NavLink> </div>


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
                  <img
                    src={item.icon}
                    alt={item.name}
                    className="nav-icon"
                    onError={(e) => {
                      const target = e.target;
                      target.style.display = "none";
                      const fallback = document.createElement("div");
                      fallback.className = "nav-icon-fallback";
                      fallback.textContent = item.name.charAt(0);
                      target.parentNode?.appendChild(fallback);
                    }}
                  />
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
                <img
                  src={item.icon}
                  alt={item.name}
                  className="nav-icon"
                  onError={(e) => {
                    const target = e.target;
                    target.style.display = "none";
                    const fallback = document.createElement("div");
                    fallback.className = "nav-icon-fallback";
                    fallback.textContent = item.name.charAt(0);
                    target.parentNode?.appendChild(fallback);
                  }}
                />
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

export default Sidebar;
