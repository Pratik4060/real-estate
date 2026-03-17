import  { useState, useEffect } from "react";
import { getAssetPath } from "../../utils/assetPath";
import "./Dashboard.css";

// Import SVGs from public directory
const totalLeadsIcon = getAssetPath("Total Leads.svg");
const conformedLeadsIcon = getAssetPath("Conformed Leads.svg");
const dealsClosedIcon = getAssetPath("Deals Closed.svg");
const dropLeadsIcon = getAssetPath("Drop leads.svg");
const calendarIcon = getAssetPath("calendar.svg");
const dropdownIcon = getAssetPath("dropdown.svg");
const downloadIcon = getAssetPath("download.svg");

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState("Last Week");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState([]);
  const [agentData, setAgentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maxValue, setMaxValue] = useState(100);

  // Data states
  const [leadsData, setLeadsData] = useState([]);
  const [agentsData, setAgentsData] = useState([]);
  const [visitsData, setVisitsData] = useState([]);

  const dateOptions = ["Today", "Yesterday", "Last Week", "This Month", "Custom"];


  useEffect(() => {
    loadAllData();
    
    const handleStorageChange = () => {
      loadAllData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  const loadAllData = () => {
    setLoading(true);
    
    try {
      // Load leads data
      const storedLeads = localStorage.getItem('leadsData');
      let leads = [];
      if (storedLeads) {
        leads = JSON.parse(storedLeads);
        console.log("Loaded leads:", leads); // Debug log
      }
      setLeadsData(leads);

      // Load agents data
      const storedAgents = localStorage.getItem('agentsData');
      let agents = [];
      if (storedAgents) {
        agents = JSON.parse(storedAgents);
        console.log("Loaded agents:", agents); // Debug log
      }
      setAgentsData(agents);

      // Load site visits data
      const storedVisits = localStorage.getItem('siteVisitsData');
      let visits = [];
      if (storedVisits) {
        visits = JSON.parse(storedVisits);
      }
      setVisitsData(visits);

      // Calculate dashboard stats based on all data
      calculateDashboardStats(leads, agents, visits);
      
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      // Fallback to default data on error
      setStats(getDefaultStats());
      setAgentData(getDefaultAgentData());
      setMaxValue(10);
    } finally {
      setLoading(false);
    }
  };

  // Get default stats
  const getDefaultStats = () => {
    return [
      {
        title: "Total Leads",
        value: "0",
        trend: "0%",
        icon: totalLeadsIcon,
        iconBg: "blue"
      },
      {
        title: "Confirmed Leads",
        value: "0",
        trend: "0%",
        icon: conformedLeadsIcon,
        iconBg: "green"
      },
      {
        title: "Deals Closed",
        value: "0",
        trend: "0%",
        icon: dealsClosedIcon,
        iconBg: "purple"
      },
      {
        title: "Drop leads",
        value: "0",
        trend: "0%",
        icon: dropLeadsIcon,
        iconBg: "red"
      },
    ];
  };

  // Get default agent data
  const getDefaultAgentData = () => {
    return [
      { name: "Amit Patil", leads: 0, converted: 0 },
      { name: "Rohan Kulkarni", leads: 0, converted: 0 },
      { name: "Riya Patil", leads: 0, converted: 0 },
      { name: "Neha Shetty", leads: 0, converted: 0 },
      { name: "Priya Deshmukh", leads: 0, converted: 0 }
    ];
  };

  // Calculate dashboard statistics based on selected date range
  const calculateDashboardStats = (leads, agents, visits) => {
    // Filter leads based on selected date
    const filteredLeads = filterByDate(leads, selectedDate);
    
    console.log("Filtered leads for", selectedDate, ":", filteredLeads); // Debug log
    
    // Calculate stats
    const totalLeadsCount = filteredLeads.length;
    
    // Conformed leads (status: Verified) - exactly as in your Leads component
    const conformedLeadsCount = filteredLeads.filter(lead => 
      lead.status === 'Verified'
    ).length;
    
    // Deals Closed (status: Closed)
    const dealsClosedCount = filteredLeads.filter(lead => 
      lead.status === 'Closed'
    ).length;
    
    // Dropped leads (status: Cancelled)
    const droppedLeadsCount = filteredLeads.filter(lead => 
      lead.status === 'Cancelled'
    ).length;

    console.log("Stats calculated:", {
      total: totalLeadsCount,
      conformed: conformedLeadsCount,
      deals: dealsClosedCount,
      dropped: droppedLeadsCount
    });

    // Calculate trends (compare with previous period)
    const previousLeads = filterByDate(leads, getPreviousPeriod(selectedDate));
    const previousTotal = previousLeads.length;
    const previousConformed = previousLeads.filter(lead => 
      lead.status === 'Verified'
    ).length;
    const previousDeals = previousLeads.filter(lead => 
      lead.status === 'Closed'
    ).length;
    const previousDropped = previousLeads.filter(lead => 
      lead.status === 'Cancelled'
    ).length;

    // Calculate percentages
    const totalTrend = calculateTrend(previousTotal, totalLeadsCount);
    const conformedTrend = calculateTrend(previousConformed, conformedLeadsCount);
    const dealsTrend = calculateTrend(previousDeals, dealsClosedCount);
    const droppedTrend = calculateTrend(previousDropped, droppedLeadsCount);

    // Update stats
    const updatedStats = [
      {
        title: "Total Leads",
        value: totalLeadsCount.toLocaleString(),
        trend: totalTrend,
        icon: totalLeadsIcon,
        iconBg: "blue"
      },
      {
        title: "Confirmed Leads",
        value: conformedLeadsCount.toLocaleString(),
        trend: conformedTrend,
        icon: conformedLeadsIcon,
        iconBg: "green"
      },
      {
        title: "Deals Closed",
        value: dealsClosedCount.toLocaleString(),
        trend: dealsTrend,
        icon: dealsClosedIcon,
        iconBg: "purple"
      },
      {
        title: "Drop leads",
        value: droppedLeadsCount.toLocaleString(),
        trend: droppedTrend,
        icon: dropLeadsIcon,
        iconBg: "red"
      },
    ];
    
    setStats(updatedStats);

    // Calculate agent performance data
    calculateAgentPerformance(agents, filteredLeads);
  };

  // Filter data by date range
  const filterByDate = (data, dateRange) => {
    if (!data || data.length === 0) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return data.filter(item => {
      // Get date from followUp field
      let itemDate = null;
      
      if (item.followUp) {
        itemDate = parseDate(item.followUp);
      }
      
      if (!itemDate) return true; // Include items without dates

      switch(dateRange) {
        case "Today":
          return itemDate.toDateString() === today.toDateString();
        
        case "Yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return itemDate.toDateString() === yesterday.toDateString();
        
        case "Last Week":
          const oneWeekAgo = new Date(today);
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return itemDate >= oneWeekAgo && itemDate <= today;
        
        case "This Month":
          return itemDate.getMonth() === today.getMonth() && 
                 itemDate.getFullYear() === today.getFullYear();
        
        case "Custom":
          return true;
        
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
        return "Previous Week";
      case "This Month":
        return "Last Month";
      default:
        return "Previous Period";
    }
  };

  // Calculate trend percentage
  const calculateTrend = (previous, current) => {
    if (previous === 0 && current === 0) return "0%";
    if (previous === 0) return "+100%";
    if (current === 0) return "-100%";
    
    const change = ((current - previous) / previous) * 100;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${Math.round(change)}%`;
  };

  // Parse date string in DD/MM/YYYY format
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day);
      }
    } catch (e) {
      console.error("Error parsing date:", dateStr, e);
      return null;
    }
    return null;
  };

  // Calculate agent performance data
  const calculateAgentPerformance = (agents, filteredLeads) => {
    if (!agents || agents.length === 0) {
      setAgentData(getDefaultAgentData());
      setMaxValue(10);
      return;
    }

    // Get agent performance
    const agentPerformance = agents.map(agent => {
      // Count leads assigned to this agent
      const agentLeads = filteredLeads.filter(lead => 
        lead.agent && lead.agent.toLowerCase() === agent.name.toLowerCase()
      );
      
      // Count converted leads (status: Verified)
      const convertedLeads = agentLeads.filter(lead => 
        lead.status === 'Verified'
      );

      return {
        name: agent.name,
        leads: agentLeads.length,
        converted: convertedLeads.length
      };
    });

    // Filter out agents with no leads and sort by leads count
    const agentsWithLeads = agentPerformance.filter(agent => agent.leads > 0);
    
    if (agentsWithLeads.length > 0) {
      // Sort by leads count (descending) and take top 5
      const topAgents = agentsWithLeads
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5);

      setAgentData(topAgents);
      
      // Calculate max value for chart scaling
      const maxLeads = Math.max(...topAgents.map(agent => agent.leads), 1);
      const maxConverted = Math.max(...topAgents.map(agent => agent.converted), 1);
      const calculatedMax = Math.max(maxLeads, maxConverted, 5);
      
      // Round up to nearest 5 for cleaner y-axis
      const roundedMax = Math.ceil(calculatedMax / 5) * 5;
      setMaxValue(100);
    } else {
      // If no agents have leads, show first 5 agents with zeros
      const firstFiveAgents = agents.slice(0, 5).map(agent => ({
        name: agent.name,
        leads: 0,
        converted: 0
      }));
      setAgentData(firstFiveAgents.length > 0 ? firstFiveAgents : getDefaultAgentData());
      setMaxValue(10);
    }
  };

  // Y-axis labels - dynamically calculated based on maxValue
const yAxisLabels = ["100", "75", "50", "25", "0"];  
  // Grid line positions - major lines at 0,25%,50%,75%,100% and middle lines
  const gridLinePositions = [100, 87.5, 75, 62.5, 50, 37.5, 25, 12.5, 0];

  // Tooltip handlers
  const handleBarHover = (event, agent, type, value) => {
    const rect = event.target.getBoundingClientRect();
    const containerRect = event.currentTarget.closest('.chart-area').getBoundingClientRect();
    
    setTooltipPosition({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - 10 - containerRect.top
    });
    
    setHoveredBar({
      agent,
      type,
      value,
      color: type === 'leads' ? '#0ACA57' : '#0251ED'
    });
  };

  const handleBarLeave = () => {
    setHoveredBar(null);
  };

  // Handle date change
  const handleDateChange = (option) => {
    setSelectedDate(option);
    setShowDateDropdown(false);
  };

  // Download report
  const handleDownload = () => {
    const data = {
      reportDate: selectedDate,
      generatedAt: new Date().toISOString(),
      stats: stats,
      agentPerformance: agentData,
      summary: {
        totalLeads: leadsData.length,
        totalAgents: agentsData.length,
        totalVisits: visitsData.length
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${selectedDate.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div>
          <h1 className="welcome-title">Dashboard</h1>
          <p className="welcome-subtitle">Welcome Back, Admin User!</p>
        </div>
        <div className="date-filter-container">
          <button
            className="date-filter"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            <img src={calendarIcon} alt="calendar" className="calendar-icon" />
            <span className="date-filter-text">{selectedDate}</span>
            <img src={dropdownIcon} alt="dropdown" className="dropdown-arrow" />
          </button>

          {showDateDropdown && (
            <div className="date-dropdown">
              {dateOptions.map((option) => (
                <button
                  key={option}
                  className={`date-option ${selectedDate === option ? "selected" : ""}`}
                  onClick={() => handleDateChange(option)}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-content">
              <p className="stat-label">{stat.title}</p>
              <h2 className="stat-value">{stat.value}</h2>
              <p className={`stat-trend ${stat.trend.startsWith('+') ? 'positive' : stat.trend.startsWith('-') ? 'negative' : ''}`}>

                {stat.trend.startsWith('+') && (
                  <img 
                  src={getAssetPath("Arrow 2.svg")}
                  />
    
                )}
                  {stat.trend.startsWith('-') && (
    <img
      src={getAssetPath("down-arrow.svg")}
      alt="down"
      className="trend-icon"
    />
  )}
  <span className="trend-value">{stat.trend}</span>

              </p>
            </div>
            <div className={`stat-icon ${stat.iconBg}`}>
              <img src={stat.icon} alt={stat.title} className="stat-icon-img" />
            </div>
          </div>
        ))}
      </div>

      {/* Agent Performance Section */}
      <div className="agent-performance">
        <div className="agent-performance-header">
          <h2 className="section-title">Agent Performance</h2>
          <button 
            className="download-icon-btn"
            onClick={handleDownload}
            title="Download Report"
          >
            <img src={downloadIcon} alt="download" className="download-icon" />
          </button>
        </div>

        <div className="performance-wrapper">
          {/* Y-Axis */}
          <div className="y-axis">
            {yAxisLabels.map((label, index) => (
              <span key={index} className="y-axis-label">{label}</span>
            ))}
          </div>

          {/* Chart Area */}
          <div className="chart-area">
            {/* Grid Lines - Major and middle lines */}
            <div className="grid-lines">
              {gridLinePositions.map((position, index) => {
                // Check if it's a major line (0, 25, 50, 75, 100)
                const isMajorLine = [0, 25, 50, 75, 100].includes(position);
                return (
                  <div 
                    key={index}
                    className={`grid-line ${isMajorLine ? 'major-dotted-line' : 'middle-dotted-line'}`}
                    style={{ bottom: `${position}%` }}
                  ></div>
                );
              })}
            </div>

            {/* Bars */}
            <div className="bars-container">
              {agentData.map((agent, index) => (
                <div key={index} className="agent-bar-group">
                  <div className="bars-wrapper">
                    <div 
                      className="bar leads-bar" 
                      style={{ height: `${(agent.leads / maxValue) * 100}%` }}
                      onMouseEnter={(e) => handleBarHover(e, agent.name, 'leads', agent.leads)}
                      onMouseMove={(e) => handleBarHover(e, agent.name, 'leads', agent.leads)}
                      onMouseLeave={handleBarLeave}
                      title={`${agent.name} - Leads: ${agent.leads}`}
                    ></div>
                    <div 
                      className="bar converted-bar" 
                      style={{ height: `${(agent.converted / maxValue) * 100}%` }}
                      onMouseEnter={(e) => handleBarHover(e, agent.name, 'converted', agent.converted)}
                      onMouseMove={(e) => handleBarHover(e, agent.name, 'converted', agent.converted)}
                      onMouseLeave={handleBarLeave}
                      title={`${agent.name} - Converted: ${agent.converted}`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Agent Labels - Below the chart */}
            <div className="agent-labels-container">
              {agentData.map((agent, index) => {
                // Truncate long names for display
                const displayName = agent.name
                return (
                  <span key={index} className="agent-label" >
                    {agent.name}
                  </span>
                );
              })}
            </div>

            {/* Tooltip */}
            {hoveredBar && (
              <div 
                className="bar-tooltip"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y}px`,
                  backgroundColor: hoveredBar.color,
                }}
              >
                <div className="tooltip-content">
                  <div className="tooltip-agent">{hoveredBar.agent}</div>
                  <div className="tooltip-value">
                    {hoveredBar.type === 'leads' ? 'Leads: ' : 'Converted (Verified): '}
                    <strong>{hoveredBar.value}</strong>
                  </div>
                </div>
                <div className="tooltip-arrow" style={{ borderTopColor: hoveredBar.color }}></div>
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="legend">
          <div className="legend-item">
            <span className="legend-dot leads-dot"></span>
            <span className="legend-text">Leads</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot converted-dot"></span>
            <span className="legend-text">Converted (Verified)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;