import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/common/Layout";
import Login from "./pages/Auth/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Leads from "./pages/Leads/Leads";
import LeadDetails from "./pages/Leads/LeadDetails";
import Agents from "./pages/Agents/Agents";
import Reports from "./pages/Reports/Reports";
import SiteVisits from "./pages/SiteVisits/SiteVisits";

// Agent Panel Imports
import AgentLayout from "./components/AgentLayout/AgentLayout";
import AgentDashboard from "./pages/AgentPanel/Dashboard/AgentDashboard";
import AgentLeads from "./pages/AgentPanel/Leads/AgentLeads";
import AgentSiteVisits from "./pages/AgentPanel/SiteVisits/AgentSiteVisits";
import AgentReports from "./pages/AgentPanel/Reports/AgentReports";
import AddLead from "./pages/AgentPanel/Leads/AddLead";

// Protected Route component - for admin
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");
  const userData = localStorage.getItem("userData");

  if (expiry && new Date().getTime() > parseInt(expiry)) {
    // Token expired, clear storage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    return <Navigate to="/login" />;
  }

  // Check if user is admin (not agent)
  if (userData) {
    const user = JSON.parse(userData);
    if (user.role === "agent") {
      return <Navigate to="/agent/dashboard" />;
    }
  }

  return isAuthenticated && token ? children : <Navigate to="/login" />;
};

// Protected Route component - for agent
const AgentProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");
  const userData = localStorage.getItem("userData");

  if (expiry && new Date().getTime() > parseInt(expiry)) {
    // Token expired, clear storage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    return <Navigate to="/login" />;
  }

  // Check if user is agent
  if (userData) {
    const user = JSON.parse(userData);
    if (user.role !== "agent") {
      return <Navigate to="/" />;
    }
  }

  return isAuthenticated && token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router >
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <Layout>
                  <Leads />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeadDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agents"
            element={
              <ProtectedRoute>
                <Layout>
                  <Agents />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Layout>
                  <Reports />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/site-visits"
            element={
              <ProtectedRoute>
                <Layout>
                  <SiteVisits />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Agent Routes */}
          <Route
            path="/agent/dashboard"
            element={
              <AgentProtectedRoute>
                <AgentLayout>
                  <AgentDashboard />
                </AgentLayout>
              </AgentProtectedRoute>
            }
          />
          <Route
            path="/agent/leads"
            element={
              <AgentProtectedRoute>
                <AgentLayout>
                  <AgentLeads />
                </AgentLayout>
              </AgentProtectedRoute>
            }
          />

          <Route
            path="/agent/add-lead"
            element={
              <AgentProtectedRoute>
                <AgentLayout>
                  <AddLead />
                </AgentLayout>
              </AgentProtectedRoute>
            }
          />
          <Route
            path="/agent/site-visits"
            element={
              <AgentProtectedRoute>
                <AgentLayout>
                  <AgentSiteVisits />
                </AgentLayout>
              </AgentProtectedRoute>
            }
          />
          <Route
            path="/agent/reports"
            element={
              <AgentProtectedRoute>
                <AgentLayout>
                  <AgentReports />
                </AgentLayout>
              </AgentProtectedRoute>
            }
          />

          {/* Catch all route - redirect to dashboard if authenticated, otherwise to login */}
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
