// components/common/Layout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from '../Sidebar/Sidebar';
import Navbar from '../Navbar/Navbar';
import "./Layout.css";

const Layout = ({ children }) => {
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
      if (!token) {
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
      <div className="layout-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className={`main-wrapper ${sidebarOpen ? "sidebar-open" : ""}`}>
        <Navbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="main-content" onClick={closeSidebar}>
          {children}
        </main>
      </div>
      
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
    </div>
  );
};

export default Layout;