import React, { useEffect, useState, useRef } from "react";
import "./AgentNavbar.css";

const AgentNavbar = ({ toggleSidebar, sidebarOpen }) => {
  const [agentData, setAgentData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unseenCount, setUnseenCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setAgentData(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    } else {
      setAgentData({
        name: "Agent User",
        email: "agent@clinic.com",
        role: "Agent"
      });
    }
  }, []);

  useEffect(() => {
    const mockNotifications = [
      {
        id: "1",
        type: "lead",
        message: "New lead assigned to you",
        created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
      {
        id: "2",
        type: "deal",
        message: "Deal update: Follow-up required",
        created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      },
      {
        id: "3",
        type: "property",
        message: "Property scheduled for viewing",
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
    ];

    setNotifications(mockNotifications);
    setUnseenCount(mockNotifications.length);
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

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
    switch(type) {
      case "lead": return "ðŸ‘¤";
      case "deal": return "ðŸ’°";
      case "property": return "ðŸ ";
      default: return "ðŸ“©";
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <header className="navbar agent-navbar">
      {/* Mobile Menu Toggle Button */}
      <button
        className={`mobile-menu-toggle ${sidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div className="navbar-container">
        <div className="search-section">
          {/* Search is intentionally empty as in admin navbar */}
        </div>

        <div className="right-section">
          <div
            className="notification-icon"
            ref={notificationRef}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <img
              src={"/assets/notification.svg"}
              alt="Notifications"
              className="bell-icon"
              onError={(e) => {
                const target = e.target;
                target.style.display = "none";
                const fallback = document.createElement("div");
                fallback.className = "bell-fallback";
                fallback.innerHTML = "ðŸ””";
                target.parentNode?.appendChild(fallback);
              }}
            />
            {unseenCount > 0 && (
              <span className="notification-badge">
                {unseenCount > 9 ? "9+" : unseenCount}
              </span>
            )}

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      className="mark-all-seen-btn"
                      onClick={handleMarkAllAsSeen}
                      title="Mark all as seen"
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
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="notification-icon-emoji">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="notification-content">
                          <p className="notification-message">
                            {notification.message}
                          </p>
                          <span className="notification-time">
                            â± {formatRelativeTime(notification.created_at)}
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
            <div className="admin-text">
              
            </div>

            <div className="admin-avatar">
              {agentData?.name?.charAt(0) || "A"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AgentNavbar;
