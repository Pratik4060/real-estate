import React, { useState, useEffect } from "react";
import { getAssetPath } from "../../../utils/assetPath";
import "./AgentSiteVisits.css";

const AgentSiteVisits = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('edit');
  const [currentVisit, setCurrentVisit] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for edit
  const [formData, setFormData] = useState({
    clientName: "",
    propertyName: "",
    visitDate: "",
    visitTime: "",
    agent: "",
    status: "Scheduled",
  });

  const [visitsData, setVisitsData] = useState([]);

  const itemsPerPage = 10;

  // Load data from localStorage on component mount
  useEffect(() => {
    loadData();
    
    // Add event listener for localStorage changes
    const handleStorageChange = () => {
      loadData();
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

  const loadData = () => {
    setLoading(true);
    try {
      const storedVisits = localStorage.getItem("siteVisitsData");
      if (storedVisits) {
        const parsedVisits = JSON.parse(storedVisits);
        setVisitsData(parsedVisits);
      } else {
        setVisitsData([]);
      }
    } catch (error) {
      console.error("Error loading site visits:", error);
      setVisitsData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalVisits = visitsData.length;
  const totalPages = Math.ceil(totalVisits / itemsPerPage);

  // Filter visits based on search
  const filteredVisits = visitsData.filter((visit) => {
    const matchesSearch = searchQuery === "" ||
      (visit.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visit.propertyName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visit.agent || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (visit.visitDate || '').includes(searchQuery) ||
      (visit.visitTime || '').includes(searchQuery);
    
    return matchesSearch;
  });

  // Sort visits
  const sortedVisits = [...filteredVisits].sort((a, b) => {
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

  // Get current page visits
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentVisits = sortedVisits.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentVisits.map((visit) => visit.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, id]);
      if (selectedRows.length + 1 === currentVisits.length) {
        setSelectAll(true);
      }
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedRows([]);
      setSelectAll(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;
    setVisitToDelete({ multiple: true, ids: selectedRows });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (visitToDelete) {
      let newVisitsData;
      if (visitToDelete.multiple) {
        // Delete multiple visits
        newVisitsData = visitsData.filter(visit => !visitToDelete.ids.includes(visit.id));
        setSelectedRows([]);
        setSelectAll(false);
      } else {
        // Delete single visit
        newVisitsData = visitsData.filter(visit => visit.id !== visitToDelete.id);
      }
      
      setVisitsData(newVisitsData);
      localStorage.setItem("siteVisitsData", JSON.stringify(newVisitsData));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('localStorageUpdated'));
      
      setShowDeleteConfirm(false);
      setVisitToDelete(null);
      
      // Adjust current page if necessary
      const newTotalPages = Math.ceil(newVisitsData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleDeleteSingle = (id) => {
    setVisitToDelete({ multiple: false, id: id });
    setShowDeleteConfirm(true);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEditClick = (visit) => {
    setModalMode('edit');
    setCurrentVisit(visit);
    setFormData({
      clientName: visit.clientName,
      propertyName: visit.propertyName,
      visitDate: visit.visitDate,
      visitTime: visit.visitTime,
      agent: visit.agent,
      status: visit.status,
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (modalMode === 'edit' && currentVisit) {
      // Edit existing visit
      const updatedVisits = visitsData.map(visit => 
        visit.id === currentVisit.id ? { 
          ...formData, 
          id: currentVisit.id,
        } : visit
      );
      
      setVisitsData(updatedVisits);
      localStorage.setItem("siteVisitsData", JSON.stringify(updatedVisits));
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('localStorageUpdated'));
    }
    
    setShowModal(false);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Scheduled':
        return '#0065D0';
      case 'Completed':
        return '#0A7B0A';
      case 'Cancelled':
        return '#D92D20';
      case 'Rescheduled':
        return '#B45B0A';
      default:
        return '#374151';
    }
  };

  // Generate page numbers for pagination
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

  // Show loading state
  if (loading) {
    return (
      <div className="visits-container">
        <div className="visits-content">
          <div className="loading-container" style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading site visits data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="visits-container">
      <div className="visits-content">
        {/* Header Section */}
        <div className="visits-header">
          <div className="visits-header-left">
            <h1 className="visits-title">Site Visits</h1>
            <p className="visits-subtitle">Schedule and track property visits ({totalVisits} total)</p>
          </div>
        </div>

        {/* White Card Section */}
        <div className="visits-card">
          {/* Search Row */}
          <div className="visits-filters">
            <div className="search-container">
              <img src={getAssetPath("search.svg")} alt="Search" className="search-icon" />
              <input
                type="text"
                placeholder="Search by client name, property, agent..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <button
              className={`delete-btn ${selectedRows.length === 0 ? 'disabled' : ''}`}
              onClick={handleDeleteSelected}
              disabled={selectedRows.length === 0}
            >

              <img src={getAssetPath("deletebutton.svg")} alt="Delete" className="delete-icon" />
              Delete ({selectedRows.length})
            </button>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="visits-table">
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
                  <th className="client-name-col" onClick={() => handleSort('clientName')}>
                    <div className="th-content">
                      <span>Client Name</span>
                      <div className="sort-icons">
                        <img 

                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'clientName' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src={getAssetPath("ChevronRight.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'clientName' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="property-name-col" onClick={() => handleSort('propertyName')}>
                    <div className="th-content">
                      <span>Property Name</span>
                      <div className="sort-icons">
                        <img 
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'propertyName' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src={getAssetPath("ChevronRight.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'propertyName' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="visit-date-col" onClick={() => handleSort('visitDate')}>
                    <div className="th-content">
                      <span>Visit Date</span>
                      <div className="sort-icons">
                        <img 

                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'visitDate' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src={getAssetPath("ChevronRight.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'visitDate' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="visit-time-col" onClick={() => handleSort('visitTime')}>
                    <div className="th-content">
                      <span>Visit Time</span>
                      <div className="sort-icons">
                        <img 

                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'visitTime' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'visitTime' && sortConfig.direction === 'desc' ? 'active' : ''}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="agent-col" onClick={() => handleSort('agent')}>
                    <div className="th-content">
                      <span>Agent</span>
                      <div className="sort-icons">
                        <img 

                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'agent' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 

                          src={getAssetPath("ChevronRight.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'agent' && sortConfig.direction === 'desc' ? 'active' : ''}`}
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
                {currentVisits.length > 0 ? (
                  currentVisits.map((visit) => {
                    const statusColor = getStatusColor(visit.status);
                    return (
                      <tr key={visit.id}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedRows.includes(visit.id)}
                            onChange={() => handleSelectRow(visit.id)}
                          />
                        </td>
                        <td className="client-name-col">
                          <span className="client-name">{visit.clientName}</span>
                        </td>
                        <td className="property-name-col">
                          <span className="property-name">{visit.propertyName}</span>
                        </td>
                        <td className="visit-date-col">{visit.visitDate}</td>
                        <td className="visit-time-col">{visit.visitTime}</td>
                        <td className="agent-col">{visit.agent}</td>
                        <td className="status-col">
                          <span className="status-text" style={{ color: statusColor }}>
                            {visit.status}
                          </span>
                        </td>
                        <td className="actions-col">
                          <div className="action-buttons">
                            <button 
                              className="action-btn" 
                              title="Edit" 
                              onClick={() => handleEditClick(visit)}
                            >

                              <img src={getAssetPath("edit.svg")} alt="Edit" />
                            </button>
                            <button 
                              className="action-btn delete" 
                              title="Delete" 
                              onClick={() => handleDeleteSingle(visit.id)}
                            >

                              <img src={getAssetPath("delete.svg")} alt="Delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data-cell">
                      No site visits found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalVisits > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalVisits)} Out of {totalVisits}
              </div>
              <div className="pagination-controls">
                <button
                  className="pagination-nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >

                  <img src={getAssetPath("PreviousIcon.svg")} alt="Previous" />
                  <span>Previous</span>
                </button>

                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={index} className="pagination-ellipsis">...</span>
                  ) : (
                    <button
                      key={index}
                      className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                ))}

                <button
                  className="pagination-nav"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <span>Next</span>

                  <img src={getAssetPath("NextIcon.svg")} alt="Next" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showModal && currentVisit && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="site-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Visit</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>Ã—</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row single">
                  <div className="form-group">
                    <label>Client Name *</label>
                    <input
                      type="text"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      placeholder="Enter Client Name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row single">
                  <div className="form-group">
                    <label>Property Name *</label>
                    <input
                      type="text"
                      name="propertyName"
                      value={formData.propertyName}
                      onChange={handleInputChange}
                      placeholder="Enter Property Name"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Visit Date *</label>
                    <input
                      type="text"
                      name="visitDate"
                      value={formData.visitDate}
                      onChange={handleInputChange}
                      placeholder="DD/MM/YYYY"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Visit Time *</label>
                    <input
                      type="text"
                      name="visitTime"
                      value={formData.visitTime}
                      onChange={handleInputChange}
                      placeholder="-- / --"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Agent Name *</label>
                    <input
                      type="text"
                      name="agent"
                      value={formData.agent}
                      onChange={handleInputChange}
                      placeholder="Enter Agent Name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Status *</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Rescheduled">Rescheduled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  Update Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {visitToDelete?.multiple ? 'these visits' : 'this visit'}?</p>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="delete-confirm-btn" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSiteVisits;
