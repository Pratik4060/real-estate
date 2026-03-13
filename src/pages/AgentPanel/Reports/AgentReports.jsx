import React, { useState, useEffect } from "react";
import { getAssetPath } from "../../../utils/assetPath";
import "./AgentReports.css";

// Import SVGs from public directory
const calendarIcon = getAssetPath("calendar.svg");
const dropdownIcon = getAssetPath("dropdown.svg");
const downloadIcon = getAssetPath("download.svg");

const AgentReports = () => {
  // Common filter state for all cards
  const [selectedDate, setSelectedDate] = useState("Last 6 Months");
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  // State for tooltips
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  // State for dynamic data
  const [rentPercentage, setRentPercentage] = useState(0);
  const [buyPercentage, setBuyPercentage] = useState(0);
  const [monthlyData, setMonthlyData] = useState([]);
  const [totalLeadsCount, setTotalLeadsCount] = useState(0);
  const [filteredLeadsCount, setFilteredLeadsCount] = useState(0);

  const dateOptions = ["Last 6 Months", "Last 3 Months", "This Month", "Last Month"];

  // Y-axis labels (major grid lines)
  const yAxisLabels = ["100", "75", "50", "25", "0"];
  
  // Grid line positions - major lines at 0,25,50,75,100 AND middle lines at 12.5, 37.5, 62.5
  const gridLinePositions = [100, 87.5, 75, 62.5, 50, 37.5, 25, 12.5, 0];

  // Load data from localStorage and calculate reports
  useEffect(() => {
    loadReportData();
    
    // Add event listener for localStorage changes
    const handleStorageChange = () => {
      loadReportData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

  // Filter leads based on date range
  const filterLeadsByDate = (leads, dateRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return leads.filter(lead => {
      let leadDate = null;
      
      if (lead.followUp) {
        leadDate = parseDate(lead.followUp);
      } else if (lead.createdAt) {
        leadDate = new Date(lead.createdAt);
      }
      
      if (!leadDate) return true; // Include leads without date

      switch(dateRange) {
        case "Today":
          return leadDate.toDateString() === today.toDateString();
        
        case "Yesterday":
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return leadDate.toDateString() === yesterday.toDateString();
        
        case "Last 3 Months":
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          return leadDate >= threeMonthsAgo;
        
        case "Last 6 Months":
          const sixMonthsAgo = new Date(today);
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return leadDate >= sixMonthsAgo;
        
        case "This Month":
          return leadDate.getMonth() === today.getMonth() && 
                 leadDate.getFullYear() === today.getFullYear();
        
        case "Last Month":
          const lastMonth = new Date(today);
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          return leadDate.getMonth() === lastMonth.getMonth() && 
                 leadDate.getFullYear() === lastMonth.getFullYear();
        
        default:
          return true;
      }
    });
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

  const loadReportData = () => {
    setLoading(true);
    try {
      // Get leads data from admin panel (leadsData) only
      const adminLeads = JSON.parse(localStorage.getItem("leadsData")) || [];
      
      // Filter leads based on selected date range
      const filteredLeads = filterLeadsByDate(adminLeads, selectedDate);
      
      setTotalLeadsCount(adminLeads.length);
      setFilteredLeadsCount(filteredLeads.length);

      // Calculate Rent vs Buy distribution using filtered leads
      calculateRentBuyDistribution(filteredLeads);

      // Calculate monthly conversion data based on selected date range
      calculateMonthlyData(adminLeads, selectedDate);

    } catch (error) {
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRentBuyDistribution = (leads) => {
    if (leads.length === 0) {
      setRentPercentage(0);
      setBuyPercentage(0);
      return;
    }

    const rentLeads = leads.filter(lead => 
      lead.requirement && lead.requirement.toLowerCase() === "rent"
    ).length;
    
    const buyLeads = leads.filter(lead => 
      lead.requirement && (lead.requirement.toLowerCase() === "buy" || 
                          lead.requirement.toLowerCase() === "lease" ||
                          lead.requirement.toLowerCase() === "commercial")
    ).length;

    const total = rentLeads + buyLeads;
    
    if (total > 0) {
      const rentPercent = Math.round((rentLeads / total) * 100);
      const buyPercent = 100 - rentPercent;
      
      setRentPercentage(rentPercent);
      setBuyPercentage(buyPercent);
    } else {
      setRentPercentage(0);
      setBuyPercentage(0);
    }
  };

  const calculateMonthlyData = (leads, dateRange) => {
    // Get months based on selected date range
    const months = [];
    const currentDate = new Date();
    
    // Determine number of months based on date range
    let monthsCount = 6; // Default for Last 6 Months
    if (dateRange === "Last 3 Months") monthsCount = 3;
    else if (dateRange === "This Month" || dateRange === "Last Month") monthsCount = 1;
    
    // Generate month names
    for (let i = monthsCount - 1; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      
      months.push({
        month: monthName,
        fullDate: date,
        monthYear: `${monthName} ${date.getFullYear()}`
      });
    }

    // Handle "Last Month" specifically
    if (dateRange === "Last Month") {
      months.length = 0; // Clear array
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(currentDate.getMonth() - 1);
      months.push({
        month: lastMonth.toLocaleString('default', { month: 'short' }),
        fullDate: lastMonth,
        monthYear: `${lastMonth.toLocaleString('default', { month: 'short' })} ${lastMonth.getFullYear()}`
      });
    }

    // Calculate leads per month
    const monthlyStats = months.map(monthInfo => {
      const monthStart = new Date(monthInfo.fullDate.getFullYear(), monthInfo.fullDate.getMonth(), 1);
      const monthEnd = new Date(monthInfo.fullDate.getFullYear(), monthInfo.fullDate.getMonth() + 1, 0);

      const leadsInMonth = leads.filter(lead => {
        let leadDate = null;
        
        if (lead.followUp) {
          leadDate = parseDate(lead.followUp);
        } else if (lead.createdAt) {
          leadDate = new Date(lead.createdAt);
        }
        
        if (!leadDate) return false;
        return leadDate >= monthStart && leadDate <= monthEnd;
      });

      const convertedLeads = leadsInMonth.filter(lead => 
        lead.status?.toLowerCase() === "verified" || 
        lead.status?.toLowerCase() === "closed"
      ).length;

      return {
        month: monthInfo.month,
        totalLeads: leadsInMonth.length,
        converted: convertedLeads
      };
    });

    setMonthlyData(monthlyStats);
  };

  // Find the maximum value for scaling
  const maxValue = Math.max(
    100,
    ...monthlyData.map(d => d.totalLeads),
    ...monthlyData.map(d => d.converted)
  );

  // Tooltip handlers
  const handleBarHover = (event, month, type, value) => {
    const rect = event.target.getBoundingClientRect();
    const containerRect = event.currentTarget.closest('.chart-area').getBoundingClientRect();
    
    setTooltipPosition({
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - 10 - containerRect.top
    });
    
    setHoveredBar({
      month,
      type,
      value,
      color: type === 'total' ? '#0ACA57' : '#0251ED'
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

  // Download report as JSON
  const handleDownload = (reportType) => {
    const data = {
      reportType,
      dateRange: selectedDate,
      generatedAt: new Date().toISOString(),
      rentBuyDistribution: {
        rent: rentPercentage,
        buy: buyPercentage
      },
      monthlyData: monthlyData,
      totalLeads: totalLeadsCount,
      filteredLeads: filteredLeadsCount
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType.toLowerCase().replace(/\s+/g, '-')}-${selectedDate.toLowerCase().replace(/\s+/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---------- PIE FUNCTIONS ----------
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const describeArc = (x, y, radius, startAngle, endAngle) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z",
    ].join(" ");
  };

  const buyAngle = buyPercentage > 0 ? (buyPercentage / 100) * 360 : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="reports">
        <div className="reports-header">
          <div>
            <h1 className="reports-title">Reports</h1>
            <p className="reports-subtitle">Loading reports data...</p>
          </div>
        </div>
        <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      {/* Header Section */}
      <div className="reports-header">
        <div>
          <h1 className="reports-title">Reports</h1>
          <p className="reports-subtitle">View business insights and performance metrics</p>
        </div>
        <div className="total-leads-badge" style={{ 
          background: '#f0f9ff', 
          padding: '8px 16px', 
          borderRadius: '20px',
          color: '#0251ED',
          fontWeight: '500'
        }}>
          Total Leads: {totalLeadsCount}
        </div>
      </div>

      {/* Common Filter Section */}
      <div className="common-filter-section">
        <div className="filter-container">
          <button
            className="filter-btnn"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
          >
            <img src="/assets/calendar-icon.svg" alt="calendar" className="calendar-icon" />
            <span className="filter-text">{selectedDate}</span>
            <img src="/assets/dropdown-icon.svg" alt="dropdown" className="dropdown-arrow" />
          </button>

          {showDateDropdown && (
            <div className="filter-dropdown-reports">
              {dateOptions.map((option) => (
                <div
                  key={option}
                  className={`filter-option ${selectedDate === option ? "selected" : ""}`}
                  onClick={() => handleDateChange(option)}
                >
                  {option}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rent vs Buy Distribution Card */}
      <div className="rent-buy-card">
        <div className="card-header">
          <h2 className="card-title">Rent vs Buy Distribution ({selectedDate})</h2>
          <button className="download-icon-btn" onClick={() => handleDownload('Rent-vs-Buy')}>
            <img src="/assets/download-icon.svg" alt="download" className="download-icon" />
          </button>
        </div>

        <div className="rent-buy-content">
          {filteredLeadsCount === 0 ? (
            <div className="no-data-message" style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
              No leads data available for {selectedDate}
            </div>
          ) : (
            <div className="pie-wrapper" style={{ position: 'relative', height: '300px' }}>
              <svg viewBox="0 0 300 300" className="circle-svg" style={{ width: '100%', height: '100%' }}>
                {/* Background circle for better visualization */}
                <circle cx="150" cy="150" r="100" fill="#f5f5f5" opacity="0.3" />
                
                {/* BUY - Blue (#39BBEF) */}
                {buyPercentage > 0 && (
                  <path
                    d={describeArc(150, 150, 100, 0, buyAngle)}
                    fill="#39BBEF"
                  />
                )}

                {/* RENT - Green (#1BF3CC) */}
                {rentPercentage > 0 && (
                  <path
                    d={describeArc(150, 150, 100, buyAngle, 360)}
                    fill="#1BF3CC"
                  />
                )}

                {/* Rent Connector Line and Label */}
                {rentPercentage > 0 && (
                  <>
                    <line
                      x1="210"
                      y1="70"
                      x2="260"
                      y2="40"
                      stroke="#1BF3CC"
                      strokeWidth="2"
                    />
                    <text x="265" y="35" fontSize="12" fill="#1BF3CC" fontWeight="500">Rent</text>
                  </>
                )}

                {/* Buy Connector Line and Label */}
                {buyPercentage > 0 && (
                  <>
                    <line
                      x1="110"
                      y1="240"
                      x2="60"
                      y2="270"
                      stroke="#39BBEF"
                      strokeWidth="2"
                    />
                    <text x="30" y="280" fontSize="12" fill="#39BBEF" fontWeight="500">Buy</text>
                  </>
                )}
              </svg>

              {/* Percentage Labels */}
              <div className="rent-label" style={{ 
                position: 'absolute', 
                top: '60px', 
                right: '30px', 
                color: '#1BF3CC', 
                fontWeight: '600',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.9)',
                padding: '4px 8px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Rent: {rentPercentage}%
              </div>

              <div className="buy-label" style={{ 
                position: 'absolute', 
                bottom: '60px', 
                left: '30px', 
                color: '#39BBEF', 
                fontWeight: '600',
                fontSize: '16px',
                background: 'rgba(255,255,255,0.9)',
                padding: '4px 8px',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                Buy: {buyPercentage}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Conversion Rate Card */}
      <div className="conversion-card">
        <div className="card-header">
          <h2 className="card-title">Lead Conversion Rate ({selectedDate})</h2>
          <button className="download-icon-btn" onClick={() => handleDownload('Conversion-Rate')}>
            <img src="/assets/download-icon.svg" alt="download" className="download-icon" />
          </button>
        </div>

        {monthlyData.length === 0 || monthlyData.every(d => d.totalLeads === 0) ? (
          <div className="no-data-message" style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            No lead conversion data available for {selectedDate}
          </div>
        ) : (
          <>
            <div className="conversion-content">
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
                    const isMajorLine = [0, 25, 50, 75, 100].includes(position);
                    return (
                      <div 
                        key={index} 
                        className={`grid-line ${isMajorLine ? 'major-dotted-line' : 'middle-dotted-line'}`}
                        style={{ bottom: `${(position / 100) * 100}%` }}
                      ></div>
                    );
                  })}
                </div>

                {/* Bars Container */}
                <div className="bars-container">
                  {monthlyData.map((data, index) => (
                    <div key={index} className="month-bar-group">
                      <div className="bars-wrapper">
                        {data.totalLeads > 0 && (
                          <div 
                            className="bar total-leads-bar" 
                            style={{ height: `${(data.totalLeads / maxValue) * 100}%` }}
                            onMouseEnter={(e) => handleBarHover(e, data.month, 'total', data.totalLeads)}
                            onMouseMove={(e) => handleBarHover(e, data.month, 'total', data.totalLeads)}
                            onMouseLeave={handleBarLeave}
                          ></div>
                        )}
                        {data.converted > 0 && (
                          <div 
                            className="bar converted-bar" 
                            style={{ height: `${(data.converted / maxValue) * 100}%` }}
                            onMouseEnter={(e) => handleBarHover(e, data.month, 'converted', data.converted)}
                            onMouseMove={(e) => handleBarHover(e, data.month, 'converted', data.converted)}
                            onMouseLeave={handleBarLeave}
                          ></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Month Labels - Below the chart */}
                <div className="month-labels-container">
                  {monthlyData.map((data, index) => (
                    <span key={index} className="month-label">{data.month}</span>
                  ))}
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
                      <div className="tooltip-month">{hoveredBar.month}</div>
                      <div className="tooltip-value">
                        {hoveredBar.type === 'total' ? 'Total leads: ' : 'Converted: '}
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
                <span className="legend-dot total-leads-dot"></span>
                <span className="legend-text">Total leads</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot converted-dot"></span>
                <span className="legend-text">Converted</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AgentReports;