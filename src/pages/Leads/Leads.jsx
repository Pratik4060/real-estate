import  { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { getAssetPath } from "../../utils/assetPath";
import "./Leads.css";

const Leads = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [currentLead, setCurrentLead] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Contact verification state
  const [Verification, setVerification] = useState({
    mobileVerified: false,
    leadVerified: false,
    emailValid: false
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    requirement: "Buy",
    budget: "",
    location: "",
    agent: "",
    followUp: "",
    status: "New",
    internalNotes: "",
    leadQuality: "Lead Quality"
  });

  const [leadsData, setLeadsData] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadLeadsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, []);

  // Load leads data from localStorage
  const loadLeadsData = () => {
    setLoading(true);
    try {
      const storedLeads = localStorage.getItem('leadsData');
      if (storedLeads) {
        const parsedLeads = JSON.parse(storedLeads);
        // Ensure each lead has verification and internal notes
        const leadsWithVerification = parsedLeads.map(lead => ({
          ...lead,
          verification: lead.verification || {
            mobileVerified: false,
            leadVerified: false,
            emailValid: false
          },
          internalNotes: lead.internalNotes || '',
          leadQuality: lead.leadQuality || 'Lead Quality'
        }));
        setLeadsData(leadsWithVerification);
      } else {
        // Initialize with sample data if no data exists
        initializeSampleData();
      }
    } catch (error) {
      console.error('Error loading leads from localStorage:', error);
      initializeSampleData();
    } finally {
      setLoading(false);
    }
  };

  // Initialize with sample data
  const initializeSampleData = () => {
    const sampleData = [
      {
        id: 1,
        name: "Riya Patil",
        email: "riya.p@sumago.com",
        phone: "9867523490",
        requirement: "Buy",
        budget: "? 75L",
        location: "Kothrud",
        agent: "Amit Patil",
        followUp: "12/02/2026",
        status: "Closed",
        internalNotes: "Customer is actively looking for a property. Interested in gated communities with good amenities.",
        leadQuality: "Hot",
        verification: {
          mobileVerified: true,
          leadVerified: false,
          emailValid: true
        }
      },
      {
        id: 2,
        name: "Rohan Sharma",
        email: "rohan.s@sumago.com",
        phone: "9012314567",
        requirement: "Rent",
        budget: "? 35k / mo",
        location: "Nanded City",
        agent: "Rohan Kulkarni",
        followUp: "11/04/2026",
        status: "New",
        internalNotes: "Looking for 2BHK apartment near IT park.",
        leadQuality: "Warm",
        verification: {
          mobileVerified: false,
          leadVerified: false,
          emailValid: true
        }
      },
      {
        id: 3,
        name: "Priya Deshmukh",
        email: "priya.d@sumago.com",
        phone: "9876543210",
        requirement: "Lease",
        budget: "? 1.2CR",
        location: "Koregaon Park",
        agent: "Neha Shetty",
        followUp: "16/05/2026",
        status: "Verified",
        internalNotes: "Premium client looking for luxury property.",
        leadQuality: "Hot",
        verification: {
          mobileVerified: true,
          leadVerified: true,
          emailValid: true
        }
      },
      {
        id: 4,
        name: "Amit Kumar",
        email: "amit.k@sumago.com",
        phone: "9867523491",
        requirement: "Rent",
        budget: "? 35k / mo",
        location: "Indiranagar",
        agent: "Rohan Kulkarni",
        followUp: "31/09/2026",
        status: "Cancelled",
        internalNotes: "Client decided to postpone property search.",
        leadQuality: "Cold",
        verification: {
          mobileVerified: false,
          leadVerified: false,
          emailValid: false
        }
      },
      {
        id: 5,
        name: "Sneha Patel",
        email: "sneha.p@sumago.com",
        phone: "9876543211",
        requirement: "Buy",
        budget: "? 85L",
        location: "Wakad",
        agent: "Neha Shetty",
        followUp: "10/01/2026",
        status: "Verified",
        internalNotes: "Looking for ready-to-move property near school.",
        leadQuality: "Warm",
        verification: {
          mobileVerified: true,
          leadVerified: true,
          emailValid: true
        }
      },
    ];
    setLeadsData(sampleData);
    saveToLocalStorage(sampleData);
  };

  // Save to localStorage
  const saveToLocalStorage = (data) => {
    try {
      localStorage.setItem('leadsData', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  // Update leads data and save to localStorage
  const updateLeadsData = (newData) => {
    setLeadsData(newData);
    saveToLocalStorage(newData);
  };

  const totalLeads = leadsData.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);

  // Status filter options
  const statusOptions = ['All Status', 'New', 'Closed', 'Verified', 'Cancelled'];
  const requirementOptions = ['Buy', 'Rent', 'Lease', 'Commercial'];

  // Filter leads based on search and status filter
  const filteredLeads = leadsData.filter((lead) => {
    const matchesSearch = searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.agent.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'All Status' ||
      lead.status === statusFilter;

    return matchesSearch && matchesStatus;
  })

  // Sort leads
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

  // Get current page leads
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLeads = sortedLeads.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentLeads.map((lead) => lead.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, id]);
      if (selectedRows.length + 1 === currentLeads.length) {
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
    setLeadToDelete({ multiple: true, ids: selectedRows });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      let newLeadsData;
      if (leadToDelete.multiple) {
        // Delete multiple leads
        newLeadsData = leadsData.filter(lead => !leadToDelete.ids.includes(lead.id));
        setSelectedRows([]);
        setSelectAll(false);
      } else {
        // Delete single lead
        newLeadsData = leadsData.filter(lead => lead.id !== leadToDelete.id);
      }
      updateLeadsData(newLeadsData);
      setShowDeleteConfirm(false);
      setLeadToDelete(null);

      // Adjust current page if necessary
      const newTotalPages = Math.ceil(newLeadsData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setModalMode('add');
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      requirement: "Buy",
      budget: "",
      location: "",
      agent: "",
      followUp: "",
      status: "New",
      internalNotes: "",
      leadQuality: "Lead Quality"
    });
    setVerification({
      mobileVerified: false,
      leadVerified: false,
      emailValid: false
    });
    setShowModal(true);
  };

  const openEditModal = (lead) => {
    setModalMode('edit');
    setCurrentLead(lead);
    setFormData({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      requirement: lead.requirement,
      budget: lead.budget,
      location: lead.location,
      agent: lead.agent,
      followUp: lead.followUp,
      status: lead.status,
      internalNotes: lead.internalNotes || '',
      leadQuality: lead.leadQuality || 'Lead Quality'
    });
    setVerification(
      lead.verification || {
        mobileVerified: false,
        leadVerified: false,
        emailValid: false
      }
    );
    setShowModal(true);
  };

  const handleDeleteClick = (lead) => {
    setLeadToDelete({ multiple: false, id: lead.id });
    setShowDeleteConfirm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleVerificationChange = (field) => {
    setVerification(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let newLeadsData;

    if (modalMode === 'add') {
      // Generate new ID
      const newId = leadsData.length > 0 ? Math.max(...leadsData.map(l => l.id)) + 1 : 1;
      const newLead = {
        ...formData,
        id: newId,
        verification: Verification,
        internalNotes: formData.internalNotes || '',
        leadQuality: formData.leadQuality || 'Lead Quality'
      };
      newLeadsData = [...leadsData, newLead];
    } else if (modalMode === 'edit') {
      // Edit existing lead
      newLeadsData = leadsData.map(lead =>
        lead.id === currentLead.id ? {
          ...formData,
          id: currentLead.id,
          verification: Verification,
          internalNotes: formData.internalNotes || lead.internalNotes || '',
          leadQuality: formData.leadQuality || lead.leadQuality || 'Lead Quality'
        } : lead
      );
    }

    updateLeadsData(newLeadsData);
    setShowModal(false);
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return '#EA8E00';
      case 'Closed':
        return '#2563EB';
      case 'Verified':
        return '#0ACA57';
      case 'Cancelled':
        return '#FC4141';
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
      <div className="leads-container admin-leads-page">
        <div className="leads-content">
          <div className="loading-container">
            <p>Loading leads data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="leads-container admin-leads-page">
      <div className="leads-content">
        <div className="leads-header">
  <div className="leads-header-left">
    <h1 className="leads-title">Leads</h1>
    <p className="leads-subtitle">Manage and track all leads</p>
  </div>
</div>

<div className="add-leads-row">
  <button className="add-leads-btn" onClick={openAddModal}>
    <span className="plus-icon">+</span>
    Add Leads
  </button>
</div>

        {/* White Card Section */}
        <div className="leads-card">
          {/* Search and Filter Row */}
          <div className="leads-filters">
            <div className="search-container">

              <img src={getAssetPath("search.svg")} alt="Search" className="search-icon" />
              <input
                type="text"
                placeholder="Search lead by name, phone"
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

                    <img src={getAssetPath("filter-icon.svg")} alt="Filter" className="filter-icon" />
                    <span>{statusFilter}</span>
                  </div>

                  <img 
                    src={getAssetPath("dropdown.svg")} 
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

                <img src={getAssetPath("deletebutton.svg")} alt="Delete" className="delete-icon" />
                Delete ({selectedRows.length})
              </button>
            </div>
          </div>

          {showFilterDropdown && (
            <div className="dropdown-overlay" onClick={() => setShowFilterDropdown(false)} />
          )}

          {/* Table */}
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
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'name' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
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
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'email' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
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
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'phone' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
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
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'requirement' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
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
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'budget' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
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
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'location' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
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
                  <th className="followup-col" onClick={() => handleSort('followUp')}>
                    <div className="th-content">
                      <span>Follow-up</span>
                      <div className="sort-icons">

                        <img 
                          src={getAssetPath("ChevronLeft.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'followUp' && sortConfig.direction === 'asc' ? 'active' : ''}`}
                        />
                        <img 
                          src={getAssetPath("ChevronRight.svg")} 
                          alt="Sort" 
                          className={`sort-icon ${sortConfig.key === 'followUp' && sortConfig.direction === 'desc' ? 'active' : ''}`}
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
                    const statusColor = getStatusColor(lead.status);
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
                        <td className="agent-col">{lead.agent}</td>
                        <td className="followup-col">{lead.followUp}</td>
                        <td className="status-col">
                          <span className="status-text" style={{ color: statusColor }}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="actions-col">
                          <div className="action-buttons">
                            <button className="action-btn" title="View" onClick={() => navigate(`/leads/${lead.id}`)}>

                              <img src={getAssetPath("eye-icon.svg")} alt="View" />
                            </button>
                            <button className="action-btn" title="Edit" onClick={() => openEditModal(lead)}>
                              <img src={getAssetPath("edit.svg")} alt="Edit" />
                            </button>
                            <button className="action-btn delete" title="Delete" onClick={() => handleDeleteClick(lead)}>
                              <img src={getAssetPath("delete.svg")} alt="Delete" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="11" className="no-data-cell">
                      No leads found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalLeads > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalLeads)} Out of {totalLeads}
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

      {/* Add/Edit Modal */}
{/* Add/Edit Modal */}
{showModal && (
  <div className="modal-overlay" onClick={() => setShowModal(false)}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      
      <div className="modal-header">
        <h2>{modalMode === "add" ? "Add New Lead" : "Edit Lead"}</h2>
        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
      </div>

      <form onSubmit={handleSubmit}>

        {/* Lead Name + Phone */}
        <div className="form-row">
          <div className="form-group">
            <label>Lead Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter Lead Name"
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter Phone Number"
              required
            />
          </div>
        </div>

        {/* Location + Email/Budget */}
        <div className="form-row">
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="eg Nanded City"
            />
          </div>

          {modalMode === "add" ? (
            <div className="form-group">
              <label>Email ID</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter Email"
              />
            </div>
          ) : (
            <div className="form-group">
              <label>Budget</label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="eg ₹75L or ₹35k"
              />
            </div>
          )}
        </div>

        {/* Agent + Followup */}
        <div className="form-row">
          <div className="form-group">
            <label>Agent Name</label>
            <input
              type="text"
              name="agent"
              value={formData.agent}
              onChange={handleInputChange}
              placeholder="Enter Agent Name"
            />
          </div>

          <div className="form-group">
            <label>Follow-up Date</label>
            <input
              type="text"
              name="followUp"
              value={formData.followUp}
              onChange={handleInputChange}
              placeholder="DD/MM/YYYY"
            />
          </div>
        </div>

        {/* Requirement + Status */}
        <div className="form-row">
          <div className="form-group">
            <label>Requirement Type</label>
            <select
              name="requirement"
              value={formData.requirement}
              onChange={handleInputChange}
            >
              {requirementOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Lead Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              {statusOptions
                .filter(s => s !== "All Status")
                .map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Verification section only for Edit */}
        {modalMode === "edit" && (
          <div className="verification-section">
            <label className="verification-title">Contact Verification</label>

            <div className="verification-toggles">

              <div className="toggle-group">
                <span className="toggle-label">Mobile Verified</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Verification.mobileVerified}
                    onChange={() => handleVerificationChange("mobileVerified")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <span className="toggle-label">Lead Verified</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Verification.leadVerified}
                    onChange={() => handleVerificationChange("leadVerified")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="toggle-group">
                <span className="toggle-label">Email Valid</span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={Verification.emailValid}
                    onChange={() => handleVerificationChange("emailValid")}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

            </div>
          </div>
        )}

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </button>

          <button type="submit" className="submit-btn">
            {modalMode === "add" ? "Add Leads" : "Edit Lead"}
          </button>
        </div>

      </form>
    </div>
  </div>
)}

      {showDeleteConfirm && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {leadToDelete?.multiple ? 'these leads' : 'this lead'}?</p>
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

export default Leads;

