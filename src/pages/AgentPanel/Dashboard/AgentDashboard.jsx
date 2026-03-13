import React, { useState, useEffect } from "react";
import "./AgentDashboard.css";

// Import SVGs from public directory (same as admin Dashboard)

const AgentDashboard = () => {
  const [selectedDate, setSelectedDate] = useState("Last Week");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for dynamic data
  const [stats, setStats] = useState([
    {
      title: "Total Deals",
      value: "0",
      trend: "+0%",
      icon: "/assets/Deals Closed.svg",
      iconBg: "blue",
    },
    {
      title: "Assigned Leads",
      value: "0",
      trend: "+0%",
      icon: "/assets/Total Leads.svg",
      iconBg: "green",
    },
    {
      title: "Upcoming Visits",
      value: "0",
      trend: "+0%",
      icon: "/assets/Conformed Leads.svg",
      iconBg: "purple",
    },
    {
      title: "Follow-ups",
      value: "0",
      trend: "+0%",
      icon: "/assets/followups.svg",
      iconBg: "green",
    },
  ]);

  const [recentLeads, setRecentLeads] = useState([]);
  const [upcomingVisits, setUpcomingVisits] = useState([]);

  const dateOptions = [
    "Today",
    "Yesterday",
    "Last Week",
    "This Month",
    "Custom",
  ];

  // Load data from localStorage on component mount
  useEffect(() => {
    loadDashboardData();
    
    // Add event listener for localStorage changes
    const handleStorageChange = () => {
      loadDashboardData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const loadDashboardData = () => {
    setLoading(true);
    try {
      // Get leads data from admin panel
      const storedLeads = localStorage.getItem("leadsData");
      let leads = [];
      if (storedLeads) {
        leads = JSON.parse(storedLeads);
      }

      // Get site visits data
      const storedVisits = localStorage.getItem("siteVisitsData");
      let visits = [];
      if (storedVisits) {
        visits = JSON.parse(storedVisits);
      }

      // Calculate statistics based on selected date range
      calculateStats(leads, visits);
      
      // Get recent leads (last 3)
      setRecentLeads(getRecentLeads(leads));
      
      // Get upcoming site visits (next 3)
      setUpcomingVisits(getUpcomingVisits(visits));

    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics based on date range
  const calculateStats = (leads, visits) => {
    // Filter leads based on selected date
    // const filteredLeads = filterByDate(leads, selectedDate);
    // const filteredVisits = filterByDate(visits, selectedDate);

    // Calculate total deals (Closed leads)
    const totalDeals = leads.filter(lead => 
      lead.status === "Closed" || lead.status === "Verified"
    ).length;

    // Calculate assigned leads (total leads)
    const assignedLeads = leads.length;

    // Calculate upcoming visits
    const upcomingVisits = visits.filter(visit => 
      visit.status === "Scheduled"
    ).length;

    // Calculate follow-ups (leads with follow-up date)
    const followups = leads.filter(lead => 
      lead.followUp && lead.followUp !== ""
    ).length;

    // Calculate trends (compare with previous period)
    const previousPeriodLeads = filterByDate(leads, getPreviousPeriod(selectedDate));
    const previousDeals = previousPeriodLeads.filter(lead => 
      lead.status === "Closed" || lead.status === "Verified"
    ).length;

    const dealsTrend = calculateTrend(totalDeals, previousDeals);
    const leadsTrend = calculateTrend(assignedLeads, previousPeriodLeads.length);
    const visitsTrend = calculateTrend(upcomingVisits, filterByDate(visits, getPreviousPeriod(selectedDate)).length);
    const followupsTrend = calculateTrend(followups, previousPeriodLeads.filter(lead => lead.followUp).length);

    setStats([
      {
        title: "Total Deals",
        value: totalDeals.toString(),
        trend: dealsTrend,
        icon: "/assets/Deals Closed.svg",
        iconBg: "blue",
      },
      {
        title: "Assigned Leads",
        value: assignedLeads.toString(),
        trend: leadsTrend,
        icon: "/assets/Total Leads.svg",
        iconBg: "green",
      },
      {
        title: "Upcoming Visits",
        value: upcomingVisits.toString(),
        trend: visitsTrend,
        icon: "/assets/Conformed Leads.svg",
        iconBg: "purple",
      },
      {
        title: "Follow-ups",
        value: followups.toString(),
        trend: followupsTrend,
        icon: "/assets/followups.svg",
        iconBg: "green",
      },
    ]);
  };

  // Filter data by date range
  const filterByDate = (data, dateRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return data.filter(item => {
      let itemDate = null;
      
      // Try to get date from different fields
      if (item.followUp) {
        itemDate = parseDate(item.followUp);
      } else if (item.visitDate) {
        itemDate = parseDate(item.visitDate);
      } else if (item.createdAt) {
        itemDate = new Date(item.createdAt);
      }
      
      if (!itemDate) return true;

      switch(dateRange) {
        case "Today":
          return itemDate.toDateString() === today.toDateString();
        
        case "Yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return itemDate.toDateString() === yesterday.toDateString();
        
        case "Last Week":
          const lastWeek = new Date(today);
          lastWeek.setDate(lastWeek.getDate() - 7);
          return itemDate >= lastWeek;
        
        case "This Month":
          return itemDate.getMonth() === today.getMonth() && 
                 itemDate.getFullYear() === today.getFullYear();
        
        default:
          return true;
      }
    });
  };

  // Get previous period for trend calculation
  const getPreviousPeriod = (dateRange) => {
    switch(dateRange) {
      case "Today":
        return "Yesterday";
      case "Yesterday":
        return "Today";
      case "Last Week":
        return "Last Week"; // Would need more sophisticated calculation
      case "This Month":
        return "Last Month";
      default:
        return "Last Week";
    }
  };

  // Calculate trend percentage
  const calculateTrend = (current, previous) => {
    if (previous === 0) return "+100%";
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change)}%`;
  };

  // Parse date string in DD/MM/YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  };

  // Get recent leads (last 3)
  const getRecentLeads = (leads) => {
    return leads.slice(-3).reverse().map(lead => ({
      id: lead.id,
      name: lead.name,
      location: lead.location || "Location not specified",
      budget: lead.budget || "₹ 0",
      requirement: lead.requirement || "Buy",
      status: lead.status || "New",
      phone: lead.phone || "N/A",
    }));
  };

  // Get upcoming site visits (next 3 scheduled)
  const getUpcomingVisits = (visits) => {
    // const today = new Date();
    const scheduledVisits = visits
      .filter(visit => visit.status === "Scheduled")
      .sort((a, b) => {
        const dateA = parseDate(a.visitDate);
        const dateB = parseDate(b.visitDate);
        if (!dateA || !dateB) return 0;
        return dateA - dateB;
      })
      .slice(0, 3)
      .map(visit => ({
        id: visit.id,
        clientName: visit.clientName,
        propertyName: visit.propertyName,
        visitDate: visit.visitDate,
        visitTime: visit.visitTime,
      }));

    return scheduledVisits;
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setShowDateDropdown(false);
  };


  // Get tag class based on requirement and status
  const getRequirementClass = (requirement) => {
    if (!requirement) return "buy";
    return requirement.toLowerCase() === "rent" ? "rent" : "buy";
  };

  const getStatusClass = (status) => {
    if (!status) return "new";
    switch(status.toLowerCase()) {
      case "verified":
      case "completed":
        return "verified";
      case "contacted":
        return "contacted";
      default:
        return "new";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="agent-dashboard-container">
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="agent-dashboard-container">
      <div className="agent-dashboard-header">
        <div className="agent-dashboard-title-group">
          <h1 className="agent-dashboard-title">Dashboard</h1>
          <p className="agent-dashboard-subtitle">Welcome back, Agent!</p>
        </div>
        <div className="agent-dashboard-controls">
          <div className="agent-date-picker-wrapper">
            <button
              className="agent-date-dropdown-btn"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
            >
              <img src="/assets/calendar.svg" alt="Calendar" className="agent-calendar-icon" />
              {selectedDate}
              <img
                src="/assets/dropdown.svg"
                alt="Dropdown"
                className="agent-dropdown-icon"
              />
            </button>
            {showDateDropdown && (
              <div className="agent-date-dropdown-menu">
                {dateOptions.map((option) => (
                  <button
                    key={option}
                    className={`agent-date-option ${selectedDate === option ? "active" : ""}`}
                    onClick={() => handleDateChange(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        
        </div>
      </div>

      <div className="agent-stats-grid">
  {stats.map((stat, index) => (
    <div key={index} className="agent-stat-card">

      <div className="agent-stat-content">
        <p className="agent-stat-label">{stat.title}</p>

        <h2 className="agent-stat-value">{stat.value}</h2>

        <p
          className={`agent-stat-trend ${
            stat.trend.startsWith("+") ? "positive" : "negative"
          }`}
        >
          {stat.trend}
        </p>
      </div>

      <div className={`agent-stat-icon-wrapper ${stat.iconBg}`}>
        <img
          src={stat.icon}
          alt={stat.title}
          className="agent-stat-icon"
        />
      </div>

    </div>
  ))}
</div>

      <div className="agent-dashboard-split-content">
        {/* Recent Leads Section */}
        <div className="agent-recent-leads">
          <h2 className="agent-section-title">Recent Leads</h2>
          <div className="agent-leads-list">
            {recentLeads.length > 0 ? (
              recentLeads.map((lead) => (
                <div key={lead.id} className="agent-lead-card">
                  <div className="agent-lead-card-header">
                    <div>
                      <h3 className="agent-lead-name">{lead.name}</h3>
                      <p className="agent-lead-location">{lead.location}</p>
                    </div>
                    <div className="agent-lead-price-wrapper">
                      <span className="agent-lead-price">{lead.budget}</span>
                    </div>
                  </div>
                  <div className="agent-lead-card-footer">
                    <div className="agent-lead-tags">
                      <span className={`agent-lead-tag ${getRequirementClass(lead.requirement)}`}>
                        {lead.requirement}
                      </span>
                      <span className={`agent-lead-tag ${getStatusClass(lead.status)}`}>
                        {lead.status}
                      </span>
                    </div>
                    <div className="agent-lead-phone">{lead.phone}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">No recent leads found</div>
            )}
          </div>
        </div>

        {/* Upcoming Site Visits Section */}
        <div className="agent-upcoming-visits">
          <h2 className="agent-section-title">Upcoming Site Visits</h2>
          <div className="agent-visits-list">
            {upcomingVisits.length > 0 ? (
              upcomingVisits.map((visit) => (
                <div key={visit.id} className="agent-visit-card">
                  <div className="agent-visit-row">
                    <h3 className="agent-visit-name">{visit.clientName}</h3>
                    <div className="agent-visit-date">{visit.visitDate}</div>
                  </div>
                  <div className="agent-visit-row">
                    <p className="agent-visit-property">{visit.propertyName}</p>
                    <div className="agent-visit-time">{visit.visitTime}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data-message">No upcoming site visits</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;