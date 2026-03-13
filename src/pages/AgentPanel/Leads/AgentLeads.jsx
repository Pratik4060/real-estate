import React, { useState, useEffect } from "react";
import "./AgentLeads.css";
import { useNavigate } from "react-router-dom";
import ViewLeadModal from "./ViewLeadModal";

const AgentLeads = () => {
  const navigate = useNavigate();
  const [viewLead, setViewLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [loading, setLoading] = useState(true);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");

  const itemsPerPage = 10;
  const [leadsData, setLeadsData] = useState([]);

  // Status filter options
  const statusOptions = ['All Status', 'New', 'Closed', 'Verified', 'Cancelled'];

  // Load leads from admin panel data in localStorage
  useEffect(() => {
    loadLeadsFromAdmin();
    
    // Add event listener for localStorage changes
    const handleStorageChange = () => {
      loadLeadsFromAdmin();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdated', handleStorageChange);
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const loadLeadsFromAdmin = () => {
    setLoading(true);
    try {
      // Get leads data from admin panel (stored as "leadsData" in localStorage)
      const storedLeads = localStorage.getItem("leadsData");
      
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        // Map admin leads to agent lead format
        const agentLeads = parsedLeads.map((lead) => ({
          id: lead.id,
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          requirement: lead.requirement,
          budget: lead.budget,
          location: lead.location,
          leadType: lead.leadQuality || "Lead Quality",
          status: lead.status,
          // Include additional fields for view modal
          agent: lead.agent,
          followUp: lead.followUp,
          internalNotes: lead.internalNotes,
          verification: lead.verification
        }));
        setLeadsData(agentLeads);
      } else {
        // If no admin data, show empty array
        setLeadsData([]);
      }
    } catch (error) {
      console.error("Error loading leads from admin:", error);
      setLeadsData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalLeads = leadsData.length;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);

  /* FILTER LEADS */
  const filteredLeads = leadsData.filter((lead) => {
    const matchesSearch = searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.agent && lead.agent.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = 
      statusFilter === 'All Status' || 
      lead.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  /* SORT LEADS */
  const sortedLeads = [...filteredLeads].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  /* PAGINATION */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirst, indexOfLast);

  /* PAGE NUMBERS */
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = windowWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          '...',
          currentPage - 1,
          currentPage,
          currentPage + 1,
          '...',
          totalPages
        );
      }
    }
    return pages;
  };

  /* SELECT ALL */
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentLeads.map((lead) => lead.id));
    }
    setSelectAll(!selectAll);
  };

  /* SELECT ROW */
  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((row) => row !== id));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, id]);
      if (selectedRows.length + 1 === currentLeads.length) {
        setSelectAll(true);
      }
    }
  };

  /* DELETE MULTIPLE - Only from agent view, not from admin */
  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    
    // This only removes from agent view, not from admin data
    const updated = leadsData.filter(
      (lead) => !selectedRows.includes(lead.id)
    );
    setLeadsData(updated);
    setSelectedRows([]);
    setSelectAll(false);
    
    // Adjust current page if necessary
    const newTotalPages = Math.ceil(updated.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  /* DELETE SINGLE - Only from agent view, not from admin */
  const handleDeleteRow = (id) => {
    // This only removes from agent view, not from admin data
    const updated = leadsData.filter((lead) => lead.id !== id);
    setLeadsData(updated);
    
    // Adjust current page if necessary
    const newTotalPages = Math.ceil(updated.length / itemsPerPage);
    if (currentPage > newTotalPages && newTotalPages > 0) {
      setCurrentPage(newTotalPages);
    }
  };

  /* HANDLE SORT */
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  /* HANDLE STATUS FILTER */
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  /* STATUS COLOR */
  const getStatusColor = (status) => {
    switch (status) {
      case "Verified":
        return "#0ACA57";
      case "Closed":
        return "#2563EB";
      case "New":
        return "#EA8E00";
      case "Cancelled":
        return "#FC4141";
      default:
        return "#374151";
    }
  };

  /* VIEW LEAD */
  const handleViewLead = (lead) => {
    setViewLead(lead);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="leads-container agent-leads-page">
        <div className="leads-content">
          <div className="loading-container">
            <p>Loading leads...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leads-container agent-leads-page">
      <div className="leads-content">
        {/* Header */}
        <div className="leads-header">
          <div className="leads-header-left">
            <h1 className="leads-title">Leads</h1>
            <p className="leads-subtitle">Manage and track all leads </p>
          </div>
          <button
            className="add-leads-btn"
            onClick={() => navigate("/agent/add-lead")}
          >
            <span className="plus-icon">+</span>
            Add Leads
          </button>
        </div>

        {/* CARD */}
        <div className="leads-card">
          {/* SEARCH AND FILTER */}
          <div className="leads-filters">
            <div className="search-container">
              <img src="/assets/search.svg" alt="Search" className="search-icon" />
              <input
                type="text"
                placeholder="Search lead by name, phone, email..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-group">
              <div className="filter-dropdown">
                <button 
                  className="filter-btn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <div className="filter-btn-content">

                    <img src="/assets/filter-icon.svg" alt="Filter" className="filter-icon" />
                    <span>{statusFilter}</span>
                  </div>
                  <img 
                    src="/assets/dropdown.svg"
                    alt="Dropdown" 
                    className={`dropdown-arrow ${showFilterDropdown ? 'open' : ''}`}
                  />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown-menu">
                    {statusOptions.map((option) => (
                      <div
                        key={option}
                        className={`filter-option ${statusFilter === option ? 'active' : ''}`}
                        onClick={() => handleStatusFilterChange(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`delete-btn ${selectedRows.length === 0 ? 'disabled' : ''}`}
                onClick={handleDeleteSelected}
                disabled={selectedRows.length === 0}
              >
                <img src="/assets/deletebutton.svg" alt="Delete" className="delete-icon" />
                Delete ({selectedRows.length})
              </button>
            </div>
          </div>

          {showFilterDropdown && (
            <div className="dropdown-overlay" onClick={() => setShowFilterDropdown(false)} />
          )}

          {/* TABLE */}
          <div className="table-container">
            <table className="leads-table">
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="lead-name-col" onClick={() => handleSort('name')}>
                    <div className="th-content">
                      <span>Lead Name</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg"
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'name' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="email-col" onClick={() => handleSort('email')}>
                    <div className="th-content">
                      <span>Email Address</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg"
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'email' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'email' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="phone-col" onClick={() => handleSort('phone')}>
                    <div className="th-content">
                      <span>Phone</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg"
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'phone' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'phone' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="requirement-col" onClick={() => handleSort('requirement')}>
                    <div className="th-content">
                      <span>Requirement</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'requirement' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'requirement' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="budget-col" onClick={() => handleSort('budget')}>
                    <div className="th-content">
                      <span>Budget</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'budget' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'budget' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="location-col" onClick={() => handleSort('location')}>
                    <div className="th-content">
                      <span>Location</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'location' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'location' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="agent-col" onClick={() => handleSort('agent')}>
                    <div className="th-content">
                      <span>Agent</span>
                      <div className="sort-icons">
                        <img 

                          src="/assets/ChevronLeft.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'agent' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'agent' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="followup-col" onClick={() => handleSort('followUp')}>
                    <div className="th-content">
                      <span>Follow-up</span>
                      <div className="sort-icons">
                        <img 
                          src="/assets/ChevronLeft.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'followUp' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'followUp' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="leadtype-col" onClick={() => handleSort('leadType')}>
                    <div className="th-content">
                      <span>Lead Type</span>
                      <div className="sort-icons">
                        <img 

                          src="/assets/ChevronLeft.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'leadType' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src="/assets/ChevronRight.svg" 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'leadType' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="status-col">
                    <span>Status</span>
                  </th>
                  <th className="actions-col">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentLeads.length > 0 ? (
                  currentLeads.map((lead) => {
                    const color = getStatusColor(lead.status);
                    return (
                      <tr key={lead.id}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedRows.includes(lead.id)}
                            onChange={() => handleSelectRow(lead.id)}
                          />
                        </td>
                        <td className="lead-name-col">
                          <span className="lead-name">{lead.name}</span>
                        </td>
                        <td className="email-col">
                          <span className="lead-email">{lead.email}</span>
                        </td>
                        <td className="phone-col">{lead.phone}</td>
                        <td className="requirement-col">
                          <span className="requirement-box">{lead.requirement}</span>
                        </td>
                        <td className="budget-col budget-cell">{lead.budget}</td>
                        <td className="location-col">{lead.location}</td>
                        <td className="agent-col">{lead.agent || '-'}</td>
                        <td className="followup-col">{lead.followUp || '-'}</td>
                        <td className="leadtype-col">{lead.leadType}</td>
                        <td className="status-col">
                          <span className="status-text" style={{ color: color }}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="actions-col">
                          <div className="action-buttons">
                            <button
                              className="action-btn"
                              title="View"
                              onClick={() => handleViewLead(lead)}
                            >
                              <img src="/assets/eye-icon.svg" alt="view" />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete"
                              onClick={() => handleDeleteRow(lead.id)}
                            >

                              <img src="/assets/delete.svg" alt="delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="12" className="no-data-cell">
                      No leads found. Add leads from admin panel.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {filteredLeads.length > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {indexOfFirst + 1}-
                {Math.min(indexOfLast, filteredLeads.length)} Out of{" "}
                {filteredLeads.length}
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-nav"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <img src="/assets/PreviousIcon.svg" alt="Previous" />
                  <span>Previous</span>
                </button>

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={index} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      className={`pagination-number ${
                        currentPage === page ? "active" : ""
                      }`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  className="pagination-nav"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span>Next</span>

                  <img src="/assets/NextIcon.svg" alt="Next" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ViewLeadModal lead={viewLead} onClose={() => setViewLead(null)} />
    </div>
  );
};

export default AgentLeads;
