import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AgentSidebar from "./AgentSidebar";
import AgentNavbar from "./AgentNavbar";
import "./AgentLayout.css";

const AgentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  const [isVerifying, setIsVerifying] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("userData");
      
      if (!token) {
        navigate('/login');
        return;
      }

      // Check if user is an agent
      try {
        const user = JSON.parse(userData);
        if (user.role !== "agent") {
          navigate('/login');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/login');
        return;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsVerifying(false);
      } catch (error) {
        console.error('Token verification failed:', error);
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="agent-layout-loading">
        <div className="agent-loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="agent-layout">
      <AgentSidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className={`agent-main-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
        <AgentNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="agent-main-content" onClick={closeSidebar}>
          {children}
        </main>
      </div>
      
      {isMobile && sidebarOpen && (
        <div className="agent-sidebar-overlay" onClick={closeSidebar} />
      )}
    </div>
  );
};

export default AgentLayout;
