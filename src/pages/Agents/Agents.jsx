import React, { useState, useEffect } from "react";
import { getAssetPath } from "../../utils/assetPath";
import "./Agents.css";
import { useNavigate } from "react-router-dom";

const Agents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [specializationFilter, setSpecializationFilter] = useState(
    "All Specializations",
  );
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentAgent, setCurrentAgent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [agentToDelete, setAgentToDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    specialization: "Residential Sales",
    experience: "",
    password: "",
    confirmPassword: "",
  });

  const [agentsData, setAgentsData] = useState([]);
  const [leadsData, setLeadsData] = useState([]);

  const getViewDetails = () => {
    const locationValue = (formData.location || "").trim();
    const locationParts = locationValue
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const emailPrefix = formData.email ? formData.email.split("@")[0] : "";
    const city = locationParts.length > 1 ? locationParts[1] : locationParts[0];
    const state = locationParts.length > 2 ? locationParts[2] : "";

    return {
      username: emailPrefix || formData.name.toLowerCase().replace(/\s+/g, "."),
      password: currentAgent?.password || "Not Available",
      address: locationValue || "Not Available",
      city: city || "Not Available",
      state: state || "Not Available",
    };
  };

  // Load agents and leads from localStorage on component mount
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data from localStorage
  const loadData = () => {
    setLoading(true);
    try {
      // Load leads data
      const storedLeads = localStorage.getItem("leadsData");
      let leads = [];
      if (storedLeads) {
        leads = JSON.parse(storedLeads);
      }
      setLeadsData(leads);

      // Load agents data
      const storedAgents = localStorage.getItem("agentsData");
      if (storedAgents) {
        const parsedAgents = JSON.parse(storedAgents);
        // Calculate leads and deals for each agent based on leadsData
        const agentsWithStats = calculateAgentStats(parsedAgents, leads);
        setAgentsData(agentsWithStats);
      } else {
        // Initialize with sample data if no data exists
        initializeSampleData(leads);
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error);
      initializeSampleData([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate leads and deals for each agent based on leadsData
  const calculateAgentStats = (agents, leads) => {
    return agents.map((agent) => {
      // Count leads assigned to this agent
      const agentLeads = leads.filter(
        (lead) =>
          lead.agent && lead.agent.toLowerCase() === agent.name.toLowerCase(),
      );

      // Count deals (leads with status 'Verified' or 'Converted')
      const agentDeals = agentLeads.filter(
        (lead) => lead.status === "Verified" || lead.status === "Converted",
      );

      return {
        ...agent,
        totalLeads: agentLeads.length,
        totalDeals: agentDeals.length,
      };
    });
  };

  // Initialize with sample data
  const initializeSampleData = (leads) => {
    const sampleAgents = [
      {
        id: 1,
        name: "Amit Patil",
        email: "Amit.Patil@sumago.com",
        phone: "9867523490",
        location: "Kothrud",
        specialization: "Residential Sales",
        experience: 14,
        password: "",
      },
      {
        id: 2,
        name: "Rohan Kulkarni",
        email: "Rohan@sumago.com",
        phone: "9012314567",
        location: "Nanded City",
        specialization: "Commercial Sales",
        experience: 12,
        password: "",
      },
      {
        id: 3,
        name: "Riya Patil",
        email: "riya.p@sumago.com",
        phone: "9876543210",
        location: "Koregaon Park",
        specialization: "Rental Sales",
        experience: 15,
        password: "",
      },
      {
        id: 4,
        name: "Neha Shetty",
        email: "Neha@sumago.com",
        phone: "9867523490",
        location: "Indiranagar",
        specialization: "Luxury Properties",
        experience: 11,
        password: "",
      },
      {
        id: 5,
        name: "Priya Deshmukh",
        email: "priya.d@sumago.com",
        phone: "9856743210",
        location: "Wakad",
        specialization: "Commercial Sales",
        experience: 8,
        password: "",
      },
      {
        id: 6,
        name: "Sachin Tendulkar",
        email: "sachin.t@sumago.com",
        phone: "9823456789",
        location: "Baner",
        specialization: "Residential Sales",
        experience: 20,
        password: "",
      },
      {
        id: 7,
        name: "Anjali Sharma",
        email: "anjali.s@sumago.com",
        phone: "9876512345",
        location: "Hinjewadi",
        specialization: "Rental Sales",
        experience: 6,
        password: "",
      },
      {
        id: 8,
        name: "Vikram Mehta",
        email: "vikram.m@sumago.com",
        phone: "9865321470",
        location: "Aundh",
        specialization: "Luxury Properties",
        experience: 10,
        password: "",
      },
      {
        id: 9,
        name: "Kavita Joshi",
        email: "kavita.j@sumago.com",
        phone: "9845671230",
        location: "Viman Nagar",
        specialization: "Commercial Sales",
        experience: 9,
        password: "",
      },
    ];

    // Calculate stats based on leads
    const agentsWithStats = calculateAgentStats(sampleAgents, leads);
    setAgentsData(agentsWithStats);
    saveToLocalStorage(agentsWithStats);
  };

  // Save to localStorage
  const saveToLocalStorage = (data) => {
    try {
      // Remove calculated fields before saving to avoid duplication
      const dataToSave = data.map(
        ({ totalLeads, totalDeals, ...agent }) => agent,
      );
      localStorage.setItem("agentsData", JSON.stringify(dataToSave));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Update agents data and save to localStorage
  const updateAgentsData = (newData) => {
    setAgentsData(newData);
    saveToLocalStorage(newData);
  };

  // Refresh agent stats based on latest leads data
  const refreshAgentStats = () => {
    const storedLeads = localStorage.getItem("leadsData");
    if (storedLeads) {
      const leads = JSON.parse(storedLeads);
      setLeadsData(leads);

      setAgentsData((prevAgents) => calculateAgentStats(prevAgents, leads));
    }
  };

  // Listen for leads data changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "leadsData") {
        refreshAgentStats();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate totals
  const totalAgents = agentsData.length;
  const totalLeads = agentsData.reduce(
    (sum, agent) => sum + (agent.totalLeads || 0),
    0,
  );
  const totalDeals = agentsData.reduce(
    (sum, agent) => sum + (agent.totalDeals || 0),
    0,
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalAgents / itemsPerPage);

  // Specialization filter options
  const specializationOptions = [
    "All Specializations",
    "Residential Sales",
    "Commercial Sales",
    "Rental Sales",
    "Luxury Properties",
  ];

  // Filter agents based on search and specialization filter
  const filteredAgents = agentsData.filter((agent) => {
    const matchesSearch =
      searchQuery === "" ||
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.phone.includes(searchQuery) ||
      agent.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.specialization.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpecialization =
      specializationFilter === "All Specializations" ||
      agent.specialization === specializationFilter;

    return matchesSearch && matchesSpecialization;
  });

  // Sort agents
  const sortedAgents = [...filteredAgents].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Get current page agents
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAgents = sortedAgents.slice(indexOfFirstItem, indexOfLastItem);

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(currentAgents.map((agent) => agent.id));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectRow = (id) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
      setSelectAll(false);
    } else {
      setSelectedRows([...selectedRows, id]);
      if (selectedRows.length + 1 === currentAgents.length) {
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
    setAgentToDelete({ multiple: true, ids: selectedRows });
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (agentToDelete) {
      let newAgentsData;
      if (agentToDelete.multiple) {
        // Delete multiple agents
        newAgentsData = agentsData.filter(
          (agent) => !agentToDelete.ids.includes(agent.id),
        );
        setSelectedRows([]);
        setSelectAll(false);
      } else {
        // Delete single agent
        newAgentsData = agentsData.filter(
          (agent) => agent.id !== agentToDelete.id,
        );
      }
      updateAgentsData(newAgentsData);
      setShowDeleteConfirm(false);
      setAgentToDelete(null);

      // Adjust current page if necessary
      const newTotalPages = Math.ceil(newAgentsData.length / itemsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleSpecializationFilterChange = (specialization) => {
    setSpecializationFilter(specialization);
    setShowFilterDropdown(false);
    setCurrentPage(1);
  };

  const openAddModal = () => {
    setModalMode("add");
    setFormData({
      name: "",
      email: "",
      phone: "",
      location: "",
      specialization: "Residential Sales",
      experience: "",
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const openEditModal = (agent) => {
    setModalMode("edit");
    setCurrentAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      location: agent.location,
      specialization: agent.specialization,
      experience: agent.experience,
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const openViewModal = (agent) => {
    setModalMode("view");
    setCurrentAgent(agent);
    setFormData({
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      location: agent.location,
      specialization: agent.specialization,
      experience: agent.experience,
      password: "",
      confirmPassword: "",
    });
    setShowModal(true);
  };

  const handleDeleteClick = (agent) => {
    setAgentToDelete({ multiple: false, id: agent.id });
    setShowDeleteConfirm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Name validation
    if (!/^[A-Za-z ]+$/.test(formData.name)) {
      alert("Agent name must contain only letters.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Enter a valid email address.");
      return;
    }

    // Phone validation
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    // Password validation for add/edit
    if (modalMode !== "view") {
      if (formData.password !== formData.confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
      if (formData.password.length < 6 && formData.password !== "") {
        alert("Password must be at least 6 characters long!");
        return;
      }
    }

    let newAgentsData;

    if (modalMode === "add") {
      // Add new agent
      const newId =
        agentsData.length > 0
          ? Math.max(...agentsData.map((a) => a.id)) + 1
          : 1;
      const newAgent = {
        ...formData,
        id: newId,
        experience: parseInt(formData.experience) || 0,
        password: formData.password,
        totalLeads: 0,
        totalDeals: 0,
      };
      // Remove confirmPassword before saving
      delete newAgent.confirmPassword;
      newAgentsData = [...agentsData, newAgent];
    } else if (modalMode === "edit") {
      // Edit existing agent
      newAgentsData = agentsData.map((agent) =>
        agent.id === currentAgent.id
          ? {
              ...agent,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              location: formData.location,
              specialization: formData.specialization,
              experience: parseInt(formData.experience) || agent.experience,
              ...(formData.password ? { password: formData.password } : {}),
            }
          : agent,
      );
    }

    // Recalculate stats after adding/editing
    const updatedAgentsWithStats = calculateAgentStats(
      newAgentsData,
      leadsData,
    );
    updateAgentsData(updatedAgentsWithStats);
    setShowModal(false);
  };

  // Get specialization badge color
  const getSpecializationColor = (specialization) => {
    switch (specialization) {
      case "Residential Sales":
        return "#0ACA57";
      case "Commercial Sales":
        return "#2563EB";
      case "Rental Sales":
        return "#EA8E00";
      case "Luxury Properties":
        return "#9333EA";
      default:
        return "#6B7280";
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
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 4,
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="agents-container admin-agents-page">
        <div className="agents-content">
          <div className="loading-container">
            <p>Loading agents data...</p>
          </div>
        </div>
      </div>
    );
  }

  const viewDetails = getViewDetails();

  return (
    <div className="agents-container admin-agents-page">
      <div className="agents-content">
        {/* Header Section */}
        <div className="agents-header">
          <div className="agents-header-left">
            <h1 className="agents-title">Agent Management</h1>
            <p className="agents-subtitle">
              Manage sales agents and their access
            </p>
          </div>
        </div>

        <div className="add-agent-row">
          <button className="add-agent-btn" onClick={() =>navigate("/agents/add")}>
            <span className="plus-icon">+</span>
            Add Agent
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-cards">
          <div className="stat-card1">
            <div className="stat-info">
              <span className="stat-label">Total Agents</span>
              <span className="stat-value">{totalAgents}</span>
            </div>

            <img src={getAssetPath("Total Agents.svg")} alt="Total Agents" />
          </div>

          <div className="stat-card1">
            <div className="stat-info">
              <span className="stat-label">Total Leads</span>
              <span className="stat-value">{totalLeads}</span>
            </div>

            <img
              src={getAssetPath("Agents Total Leads.svg")}
              alt="Total Leads"
            />
          </div>

          <div className="stat-card1">
            <div className="stat-info">
              <span className="stat-label">Total Deals</span>
              <span className="stat-value">{totalDeals}</span>
            </div>

            <img src={getAssetPath("Total Deals.svg")} alt="Total Deals" />
          </div>
        </div>

        {/* White Card Section */}
        <div className="agents-card">
          {/* Search and Filter Row */}
          <div className="agents-filters">
            <div className="search-container">
              <img
                src={getAssetPath("search.svg")}
                alt="Search"
                className="search-icon"
              />
              <input
                type="text"
                placeholder="Search agent by name, phone, email"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-group">
              <div className="filter-dropdown">
                <button
                  className="filterr-btn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <div className="filterr-btn-content">
                    <img
                      src={getAssetPath("filter-icon.svg")}
                      alt="Filter"
                      className="filter-icon"
                    />
                    <span>{specializationFilter}</span>
                  </div>
                  <img
                    src={getAssetPath("dropdown.svg")}
                    alt="Dropdown"
                    className={`dropdown-arrow ${showFilterDropdown ? "open" : ""}`}
                  />
                </button>

                {showFilterDropdown && (
                  <div className="filter-dropdown-menu">
                    {specializationOptions.map((option) => (
                      <div
                        key={option}
                        className={`filter-option ${specializationFilter === option ? "active" : ""}`}
                        onClick={() => handleSpecializationFilterChange(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                className={`delete-btn ${selectedRows.length === 0 ? "disabled" : ""}`}
                onClick={handleDeleteSelected}
                disabled={selectedRows.length === 0}
              >
                <img
                  src={getAssetPath("deletebutton.svg")}
                  alt="Delete"
                  className="delete-icon"
                />
                Delete ({selectedRows.length})
              </button>
            </div>
          </div>

          {showFilterDropdown && (
            <div
              className="dropdown-overlay"
              onClick={() => setShowFilterDropdown(false)}
            />
          )}

          {/* Table */}
          <div className="table-container">
            <table className="agents-table">
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
                  <th
                    className="agent-name-col"
                    onClick={() => handleSort("name")}
                  >
                    <div className="th-content">
                      <span>Agent Name</span>
                      <div className="sort-icons">
                        <img
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "name" && sortConfig.direction === "asc" ? "active" : ""}`}
                        />
                        <img
                          src={getAssetPath("ChevronRight.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "name" && sortConfig.direction === "desc" ? "active" : ""}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="email-col" onClick={() => handleSort("email")}>
                    <div className="th-content">
                      <span>Email Address</span>
                      <div className="sort-icons">
                        <img
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "email" && sortConfig.direction === "asc" ? "active" : ""}`}
                        />
                        <img
                          src={getAssetPath("ChevronRight.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "email" && sortConfig.direction === "desc" ? "active" : ""}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="phone-col" onClick={() => handleSort("phone")}>
                    <div className="th-content">
                      <span>Phone</span>
                      <div className="sort-icons">
                        <img
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "phone" && sortConfig.direction === "asc" ? "active" : ""}`}
                        />
                        <img
                          src={getAssetPath("ChevronRight.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "phone" && sortConfig.direction === "desc" ? "active" : ""}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th
                    className="location-col"
                    onClick={() => handleSort("location")}
                  >
                    <div className="th-content">
                      <span>Location</span>
                      <div className="sort-icons">
                        <img
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "location" && sortConfig.direction === "asc" ? "active" : ""}`}
                        />
                        <img
                          src={getAssetPath("ChevronRight.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "location" && sortConfig.direction === "desc" ? "active" : ""}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th
                    className="specialization-col"
                    onClick={() => handleSort("specialization")}
                  >
                    <div className="th-content">
                      <span>Specialization</span>
                      <div className="sort-icons">
                        <img
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "specialization" && sortConfig.direction === "asc" ? "active" : ""}`}
                        />
                        <img
                          src={getAssetPath("ChevronRight.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "specialization" && sortConfig.direction === "desc" ? "active" : ""}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th
                    className="experience-col"
                    onClick={() => handleSort("experience")}
                  >
                    <div className="th-content">
                      <span>Experience</span>
                      <div className="sort-icons">
                        <img
                          src={getAssetPath("ChevronLeft.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "experience" && sortConfig.direction === "asc" ? "active" : ""}`}
                        />
                        <img
                          src={getAssetPath("ChevronRight.svg")}
                          alt="Sort"
                          className={`sort-icon ${sortConfig.key === "experience" && sortConfig.direction === "desc" ? "active" : ""}`}
                        />
                      </div>
                    </div>
                  </th>
                  <th className="actions-col">
                    <span>Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentAgents.length > 0 ? (
                  currentAgents.map((agent) => {
                    const specializationColor = getSpecializationColor(
                      agent.specialization,
                    );
                    return (
                      <tr key={agent.id}>
                        <td className="checkbox-cell">
                          <input
                            type="checkbox"
                            className="checkbox"
                            checked={selectedRows.includes(agent.id)}
                            onChange={() => handleSelectRow(agent.id)}
                          />
                        </td>
                        <td className="agent-name-col">
                          <span className="agent-name">{agent.name}</span>
                        </td>
                        <td className="email-col">
                          <span className="agent-email">{agent.email}</span>
                        </td>
                        <td className="phone-col">{agent.phone}</td>
                        <td className="location-col">{agent.location}</td>
                        <td
                          className="specialization-col"
                          style={{ color: specializationColor }}
                        >
                          {agent.specialization}
                        </td>
                        <td className="experience-col">
                          <span className="experience-value">
                            {agent.experience} years
                          </span>
                        </td>
                        <td className="actions-col">
                          <div className="action-buttons">
                            <button
                              className="action-btn"
                              title="Edit"
                              onClick={() => openEditModal(agent)}
                            >
                              <img src={getAssetPath("edit.svg")} alt="Edit" />
                            </button>
                            <button
                              className="action-btn"
                              title="View"
                              onClick={() => openViewModal(agent)}
                            >
                              <img
                                src={getAssetPath("eye-icon.svg")}
                                alt="View"
                              />
                            </button>
                            <button
                              className="action-btn delete"
                              title="Delete"
                              onClick={() => handleDeleteClick(agent)}
                            >
                              <img
                                src={getAssetPath("delete.svg")}
                                alt="Delete"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="no-data-cell">
                      No agents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalAgents > 0 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, totalAgents)} Out of {totalAgents}
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

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={index} className="pagination-ellipsis">
                      ...
                    </span>
                  ) : (
                    <button
                      key={index}
                      className={`pagination-number ${currentPage === page ? "active" : ""}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ),
                )}

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

      {/* Add/Edit/View Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div
            className={`modal-content ${modalMode === "view" ? "view-modal-content" : ""}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                {modalMode === "add"
                  ? "Add New Agent"
                  : modalMode === "edit"
                    ? "Edit Details"
                    : "View Details"}
              </h2>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <img
                  src={getAssetPath("Cross Icon.svg")}
                  alt="close"
                  className="close-icon"
                />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {/* EDIT AGENT UI */}
                {modalMode === "edit" ? (
                  <>
                    {/* Contact Details */}
                    <div className="edit-section">
                      <h4>Contact Details</h4>

                      <div className="form-row three">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter Agent Name"
                            required
                            pattern="^[A-Za-z ]+$"
                            title="Name should contain only letters"
                            disabled={modalMode === "view"}
                          />
                        </div>

                        <div className="form-group">
                          <label>Phone</label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, "");
                              if (value.length <= 10) {
                                setFormData({ ...formData, phone: value });
                              }
                            }}
                            placeholder="Enter Phone Number"
                            pattern="[0-9]{10}"
                            title="Phone number must be 10 digits"
                          />
                        </div>

                        <div className="form-group">
                          <label>Email</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                            title="Enter a valid email address"
                          />
                        </div>
                      </div>
                    </div>

                    {/* User ID & Password */}
                    <div className="edit-section">
                      <h3>User ID & Password</h3>

                      <div className="form-row two">
                        <div className="form-group">
                          <label>User Name</label>
                          <input type="text" value={formData.email} disabled />
                        </div>

                        <div className="form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Professional Details */}
                    <div className="edit-section">
                      <h3>Professional Details</h3>

                      <div className="form-row two">
                        <div className="form-group">
                          <label>Experience</label>
                          <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>Specialization</label>
                          <select
                            name="specialization"
                            value={formData.specialization}
                            onChange={handleInputChange}
                          >
                            {specializationOptions
                              .filter((s) => s !== "All Specializations")
                              .map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="edit-section">
                      <h3>Address Information</h3>

                      <div className="form-row three">
                        <div className="form-group">
                          <label>Address</label>
                          <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div className="form-group">
                          <label>City</label>
                          <input type="text" placeholder="City" />
                        </div>

                        <div className="form-group">
                          <label>State</label>
                          <input type="text" placeholder="State" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : modalMode === "view" ? (
                  <div className="view-details-layout">
                    <div className="view-section">
                      <h3>Contact Details</h3>
                      <div className="view-row">
                        <div className="view-group">
                          <label>Name</label>
                          <input className="view-input" type="text" value={formData.name} disabled />
                        </div>
                        <div className="view-group">
                          <label>Phone</label>
                          <input className="view-input" type="text" value={formData.phone} disabled />
                        </div>
                        <div className="view-group">
                          <label>Email</label>
                          <input className="view-input" type="text" value={formData.email} disabled />
                        </div>
                      </div>
                    </div>
                    <div className="view-section">
                      <h3>User ID & Password</h3>
                      <div className="view-row">
                        <div className="view-group">
                          <label>User Name</label>
                          <input className="view-input" type="text" value={viewDetails.username} disabled />
                        </div>
                        <div className="view-group">
                          <label>Password</label>
                          <input className="view-input" type="text" value={viewDetails.password} disabled />
                        </div>
                      </div>
                    </div>
                    <div className="view-section">
                      <h3>Professional Details</h3>
                      <div className="view-row">
                        <div className="view-group">
                          <label>Experience</label>
                          <input className="view-input" type="text" value={formData.experience || 0} disabled />
                        </div>
                        <div className="view-group">
                          <label>Specialization</label>
                          <input className="view-input" type="text" value={formData.specialization} disabled />
                        </div>
                      </div>
                    </div>
                    <div className="view-section">
                      <h3>Address Information</h3>
                      <div className="view-row">
                        <div className="view-group">
                          <label>Address</label>
                          <input className="view-input" type="text" value={viewDetails.address} disabled />
                        </div>
                        <div className="view-group">
                          <label>City</label>
                          <input className="view-input" type="text" value={viewDetails.city} disabled />
                        </div>
                        <div className="view-group">
                          <label>State</label>
                          <input className="view-input" type="text" value={viewDetails.state} disabled />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-row">
                      <div
                        className="form-group"
                      >
                        <label>Agent Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter Agent Name"
                          required
                          pattern="^[A-Za-z ]+$"
                          title="Name should contain only letters"
                          disabled={modalMode === "view"}
                        />
                      </div>

                      <div className="form-group">
                        <label>Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter Email Address"
                          required
                          pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                          title="Enter a valid email address"
                          disabled={modalMode === "view"}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, "");
                            if (value.length <= 10) {
                              setFormData({ ...formData, phone: value });
                            }
                          }}
                          placeholder="Enter Phone Number"
                          pattern="[0-9]{10}"
                          title="Phone number must be 10 digits"
                          required
                          disabled={modalMode === "view"}
                        />
                      </div>

                      <div className="form-group">
                        <label>Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="eg Kothrud, Pune"
                          disabled={modalMode === "view"}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Specialization</label>
                        <select
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                          disabled={modalMode === "view"}
                        >
                          {specializationOptions
                            .filter((s) => s !== "All Specializations")
                            .map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Experience (Years)</label>
                        <input
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleInputChange}
                          placeholder="eg 5"
                          min="0"
                          max="50"
                          required
                          disabled={modalMode === "view"}
                        />
                      </div>
                    </div>

                    {modalMode !== "view" && (
                      <>
                        <div className="form-row">
                          <div className="form-group">
                            <label>
                              Password {modalMode === "add" ? "*" : ""}
                            </label>
                            <input
                              type="password"
                              name="password"
                              value={formData.password}
                              onChange={handleInputChange}
                              placeholder={
                                modalMode === "add"
                                  ? "Enter Password"
                                  : "Leave blank to keep current"
                              }
                              required={modalMode === "add"}
                              minLength="6"
                            />
                          </div>

                          <div className="form-group">
                            <label>
                              Confirm Password {modalMode === "add" ? "*" : ""}
                            </label>
                            <input
                              type="password"
                              name="confirmPassword"
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              placeholder="Confirm Password"
                              required={modalMode === "add"}
                            />
                          </div>
                        </div>
                        <p className="password-hint">
                          Password must be at least 6 characters long
                        </p>
                      </>
                    )}

                  </>
                )}
              </div>

              {modalMode !== "view" && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn">
                    {modalMode === "add" ? "Add Agent" : "Edit Agent"}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="delete-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              {agentToDelete?.multiple ? "these agents" : "this agent"}?
            </p>
            <div className="modal-footer">
              <button
                className="cancel-btn"
                onClick={() => setShowDeleteConfirm(false)}
              >
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

export default Agents;
