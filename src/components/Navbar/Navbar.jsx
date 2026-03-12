import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAssetPath } from "../../utils/assetPath";
import "./Navbar.css";

const Navbar = ({ toggleSidebar, sidebarOpen }) => {
const [adminData, setAdminData] = useState(null);
const [notifications, setNotifications] = useState([]);
const [unseenCount, setUnseenCount] = useState(0);
const [showNotifications, setShowNotifications] = useState(false);
const notificationRef = useRef(null);
const navigate = useNavigate();

useEffect(() => {
const userData = localStorage.getItem("userData");

```
if (userData) {
  try {
    setAdminData(JSON.parse(userData));
  } catch (error) {
    console.error("Error parsing user data:", error);
  }
} else {
  setAdminData({
    name: "Admin User",
    email: "admin@estateflow.com",
    role: "Administrator",
  });
}
```

}, []);

useEffect(() => {
const mockNotifications = [
{
id: "1",
type: "lead",
message: "New lead added: John Doe",
created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
},
{
id: "2",
type: "deal",
message: "Deal Closed: Luxury Villa",
created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
},
{
id: "3",
type: "property",
message: "New property listed: Downtown Apartment",
created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
},
];

```
setNotifications(mockNotifications);
setUnseenCount(mockNotifications.length);
```

}, []);

useEffect(() => {
const handleClickOutside = (event) => {
if (
notificationRef.current &&
!notificationRef.current.contains(event.target)
) {
setShowNotifications(false);
}
};

```
if (showNotifications) {
  document.addEventListener("mousedown", handleClickOutside);
}

return () => {
  document.removeEventListener("mousedown", handleClickOutside);
};
```

}, [showNotifications]);

const handleNotificationClick = (notificationId) => {
setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
setUnseenCount((prev) => Math.max(0, prev - 1));
};

const handleMarkAllAsSeen = () => {
setNotifications([]);
setUnseenCount(0);
};

const getNotificationIcon = (type) => {
switch (type) {
case "lead":
return "👤";
case "deal":
return "💰";
case "property":
return "🏠";
default:
return "📩";
}
};

const formatRelativeTime = (dateString) => {
const date = new Date(dateString);
const now = new Date();
const diffInSeconds = Math.floor((now - date) / 1000);

if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
if (diffInSeconds < 3600)
  return `${Math.floor(diffInSeconds / 60)} minutes ago`;
if (diffInSeconds < 86400)
  return `${Math.floor(diffInSeconds / 3600)} hours ago`;

return `${Math.floor(diffInSeconds / 86400)} days ago`;

};

return ( <header className="navbar admin-navbar">
{/* Mobile Menu Toggle */}
<button
className={`mobile-menu-toggle ${sidebarOpen ? "active" : ""}`}
onClick={toggleSidebar}
aria-label="Toggle menu"
> <span></span> <span></span> <span></span> </button>

  <div className="navbar-container">
    <div className="search-section"></div>

    <div className="right-section">
      <div
        className="notification-icon"
        ref={notificationRef}
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <img
          src={getAssetPath("notification.svg")}
          alt="Notifications"
          className="bell-icon"
          onError={(e) => {
            const target = e.target;
            target.style.display = "none";

            const fallback = document.createElement("div");
            fallback.className = "bell-fallback";
            fallback.innerHTML = "🔔";

            target.parentNode?.appendChild(fallback);
          }}
        />

        {unseenCount > 0 && (
          <span className="notification-badge">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}

        {showNotifications && (
          <div className="notifications-dropdown">
            <div className="notifications-header">
              <h3>Notifications</h3>

              {notifications.length > 0 && (
                <button
                  className="mark-all-seen-btn"
                  onClick={handleMarkAllAsSeen}
                >
                  Mark all as seen
                </button>
              )}
            </div>

            <div className="notifications-list">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="notification-item"
                    onClick={() =>
                      handleNotificationClick(notification.id)
                    }
                  >
                    <div className="notification-icon-emoji">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="notification-content">
                      <p className="notification-message">
                        {notification.message}
                      </p>

                      <span className="notification-time">
                        ⏱ {formatRelativeTime(notification.created_at)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="notification-empty">
                  <p>No new notifications</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="admin-profile">
        <div className="admin-text"></div>

        <div className="admin-avatar">
          {adminData?.name?.charAt(0) || "A"}
        </div>
      </div>
    </div>
  </div>
</header>

);
};

export default Navbar;
