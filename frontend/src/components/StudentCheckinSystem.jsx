import { useState, useEffect } from "react";
import {
  Plus,
  Users,
  Clock,
  Search,
  MapPin,
  AlertCircle,
  CheckCircle,
  Loader,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import "./studentCheckinSystem.css";
import axios from "axios";

const StudentCheckinSystem = () => {
  const [students, setStudents] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("students");

  // Pagination states
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const [currentCheckinPage, setCurrentCheckinPage] = useState(1);
  const itemsPerPage = 5;

  // Form states
  const [studentForm, setStudentForm] = useState({
    name: "",
    email: "",
    studentId: "",
    pincode: "",
    district: "",
    state: "",
    country: "",
  });
  const [checkinForm, setCheckinForm] = useState({
    studentId: "",
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    fetchStudents();
    fetchCheckins();
  }, []);

  const API_BASE = "http://localhost:8000/api/v0";

  const showMessage = (message, type = "success") => {
    if (type === "success") {
      setSuccess(message);
      setError("");
      setTimeout(() => setSuccess(""), 3000);
    } else {
      setError(message);
      setSuccess("");
      setTimeout(() => setError(""), 3000);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/students`);
      if (response.status === 200) {
        setStudents(response.data.students);
      } else {
        throw new Error("Failed to fetch students");
      }
    } catch (err) {
      showMessage("Error fetching students: " + err.message, "error");
    }
    setLoading(false);
  };

  const fetchCheckins = async () => {
    try {
      const response = await axios.get(`${API_BASE}/checkins`);
      if (response.status === 200) {
        setCheckins(response.data.checkInStudents);
      } else {
        throw new Error("Failed to fetch check-ins");
      }
    } catch (err) {
      showMessage(err.response.data.message, "error");
    }
  };

  const fetchLocationByPincode = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;

    setPincodeLoading(true);
    try {
      const response = await axios.get(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = response.data;

      if (data[0].Status === "Success" && data[0].PostOffice.length > 0) {
        const location = data[0].PostOffice[0];
        setStudentForm((prev) => ({
          ...prev,
          district: location.District,
          state: location.State,
          country: location.Country,
        }));
      } else {
        showMessage("Invalid pincode or location not found", "error");
      }
    } catch (err) {
      showMessage("Error fetching location data", "error");
    }
    setPincodeLoading(false);
  };

  const handleStudentSubmit = async () => {
    if (
      !studentForm.name ||
      !studentForm.email ||
      !studentForm.studentId ||
      !studentForm.pincode ||
      !studentForm.district ||
      !studentForm.state ||
      !studentForm.country
    ) {
      showMessage("Please fill in all required fields", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/students`, studentForm);
      if (response.status === 201) {
        showMessage("Student added successfully!");
        setStudentForm({
          name: "",
          email: "",
          studentId: "",
          pincode: "",
          district: "",
          state: "",
          country: "",
        });
        fetchStudents();
      }
    } catch (err) {
      showMessage(err.response.data.message, "error");
    }
    setLoading(false);
  };

  const handleCheckin = async () => {
    if (!checkinForm.studentId) {
      showMessage("Please enter a Student ID", "error");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/checkins`, {
        student_id: checkinForm.studentId,
        timestamp: new Date().toISOString(),
      });

      if (response.status === 201) {
        showMessage("Check-in recorded successfully!");
        setCheckinForm({ studentId: "" });
        fetchCheckins();
      }
    } catch (err) {
      if (err.response) {
        showMessage(err.response.data.message, "error");
      } else if (err.request) {
        showMessage("Error: No response from server.", "error");
      } else {
        showMessage("Error recording check-in: " + err.message, "error");
      }
    }
    setLoading(false);
  };
  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalStudentPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const totalCheckinPages = Math.ceil(
    (Array.isArray(checkins) ? checkins.length : 0) / itemsPerPage
  );

  const paginatedStudents = filteredStudents.slice(
    (currentStudentPage - 1) * itemsPerPage,
    currentStudentPage * itemsPerPage
  );

  const paginatedCheckins = Array.isArray(checkins)
    ? checkins
        .slice()
        .reverse()
        .slice(
          (currentCheckinPage - 1) * itemsPerPage,
          currentCheckinPage * itemsPerPage
        )
    : [];

  const handleStudentPageChange = (page) => {
    setCurrentStudentPage(page);
  };

  const handleCheckinPageChange = (page) => {
    setCurrentCheckinPage(page);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const Pagination = ({ currentPage, totalPages, onPageChange, type }) => {
    const getPageNumbers = () => {
      const pages = [];
      const showPages = 5;

      if (totalPages <= showPages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
        return pages;
      }

      let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
      let endPage = Math.min(totalPages, startPage + showPages - 1);

      if (endPage - startPage < showPages - 1) {
        startPage = Math.max(1, endPage - showPages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="pagination-container">
        <div className="pagination">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn pagination-prev"
          >
            <ChevronLeft className="pagination-icon" />
            Previous
          </button>

          <div className="pagination-pages">
            {currentPage > 3 && (
              <>
                <button
                  key="first-page"
                  onClick={() => onPageChange(1)}
                  className="pagination-page"
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span key="start-dots" className="pagination-dots">
                    ...
                  </span>
                )}
              </>
            )}

            {getPageNumbers().map((page) => (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                className={`pagination-page ${
                  currentPage === page ? "active" : ""
                }`}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span key="end-dots" className="pagination-dots">
                    ...
                  </span>
                )}
                <button
                  key="last-page"
                  onClick={() => onPageChange(totalPages)}
                  className="pagination-page"
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn pagination-next"
          >
            Next
            <ChevronRight className="pagination-icon" />
          </button>
        </div>

        <div className="pagination-info">
          Showing{" "}
          {Math.min(
            (currentPage - 1) * itemsPerPage + 1,
            type === "students"
              ? filteredStudents.length
              : Array.isArray(checkins)
              ? checkins.length
              : 0
          )}{" "}
          to{" "}
          {Math.min(
            currentPage * itemsPerPage,
            type === "students"
              ? filteredStudents.length
              : Array.isArray(checkins)
              ? checkins.length
              : 0
          )}{" "}
          of{" "}
          {type === "students"
            ? filteredStudents.length
            : Array.isArray(checkins)
            ? checkins.length
            : 0}{" "}
          entries
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="header-title">
              <div className="header-icon">
                <Users className="icon-lg text-white" />
              </div>
              <h1>Student Check-in System</h1>
            </div>
            <div className="header-stats">
              <div className="stat-item">
                <Users className="icon" />
                <span>{students.length} Students</span>
              </div>
              <div className="stat-item">
                <Clock className="icon" />
                <span>{checkins.length} Check-ins Today</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {(success || error) && (
        <div className="message-container">
          {success && (
            <div className="message message-success">
              <CheckCircle className="icon-md text-green-600" />
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="message message-error">
              <AlertCircle className="icon-md text-red-600" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      <main className="main-container">
        {/* Tab Navigation */}
        <div className="tab-container">
          <nav className="tab-nav">
            <button
              onClick={() => setActiveTab("students")}
              className={`tab-button ${
                activeTab === "students" ? "active" : ""
              }`}
            >
              <div className="tab-content">
                <Users className="icon" />
                <span>Student Management</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("checkins")}
              className={`tab-button ${
                activeTab === "checkins" ? "active" : ""
              }`}
            >
              <div className="tab-content">
                <Clock className="icon" />
                <span>Check-in Management</span>
              </div>
            </button>
          </nav>
        </div>

        {activeTab === "students" && (
          <>
            {/* Add Student Form */}
            <div className="left-card">
              <h2 className="card-header">
                <Plus className="icon-md" />
                <span>Add New Student</span>
              </h2>

              <div className="form-container">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      value={studentForm.name}
                      onChange={(e) =>
                        setStudentForm({ ...studentForm, name: e.target.value })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email *</label>
                    <input
                      type="email"
                      value={studentForm.email}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          email: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student ID *</label>
                    <input
                      type="text"
                      value={studentForm.studentId}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          studentId: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Institute Pincode *</label>
                    <div className="input-container">
                      <input
                        type="text"
                        value={studentForm.pincode}
                        onChange={(e) => {
                          const pincode = e.target.value;
                          setStudentForm({ ...studentForm, pincode });
                          if (pincode.length === 6) {
                            fetchLocationByPincode(pincode);
                          }
                        }}
                        maxLength="6"
                        className="form-input"
                        placeholder="Enter 6-digit pincode"
                      />
                      {pincodeLoading && (
                        <div className="input-loading">
                          <Loader className="icon spinner text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">District *</label>
                    <input
                      type="text"
                      value={studentForm.district}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          district: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State *</label>
                    <input
                      type="text"
                      value={studentForm.state}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          state: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>

                  <div className="form-group form-grid-full">
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      value={studentForm.country}
                      onChange={(e) =>
                        setStudentForm({
                          ...studentForm,
                          country: e.target.value,
                        })
                      }
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    onClick={handleStudentSubmit}
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading && <Loader className="icon spinner" />}
                    <span>Add Student</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Students List */}
            <div className="right-card">
              <div className="card-section">
                <h2 className="card-header">All Students</h2>
                <div className="search-container">
                  <div className="input-container">
                    <Search className="input-icon" />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-input input-with-icon"
                    />
                  </div>
                </div>
              </div>

              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Location</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {paginatedStudents.map((student) => (
                      <tr key={student.student_id}>
                        <td>
                          <div>
                            <div className="table-cell-main">
                              {student.name}
                            </div>
                            <div className="table-cell-sub">
                              {student.email}
                            </div>
                          </div>
                        </td>
                        <td className="table-cell-main">
                          {student.student_id}
                        </td>
                        <td className="table-cell-secondary">
                          {student.district && student.state ? (
                            <div className="table-cell-location">
                              <MapPin className="icon-sm" />
                              <span>
                                {student.district}, {student.state},
                                {student.country}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredStudents.length === 0 && (
                  <div className="table-empty">
                    {searchTerm
                      ? "No students found matching your search."
                      : "No students registered yet."}
                  </div>
                )}
              </div>

              <Pagination
                currentPage={currentStudentPage}
                totalPages={totalStudentPages}
                onPageChange={handleStudentPageChange}
                type="students"
              />
            </div>
          </>
        )}

        {activeTab === "checkins" && (
          <>
            {/* Check-in Form */}
            <div className="left-card">
              <h2 className="card-header">
                <Clock className="icon-md" />
                <span>Student Check-in</span>
              </h2>

              <div className="form-row">
                <input
                  type="text"
                  value={checkinForm.studentId}
                  onChange={(e) =>
                    setCheckinForm({
                      ...checkinForm,
                      studentId: e.target.value,
                    })
                  }
                  placeholder="Enter Student ID"
                  className="form-input"
                />
                <button
                  onClick={handleCheckin}
                  disabled={loading}
                  className="btn btn-success"
                >
                  {loading && <Loader className="icon spinner" />}
                  <span>Check In</span>
                </button>
              </div>
            </div>

            {/* Check-ins List */}
            <div className="right-card">
              <h2 className="card-header">Recent Check-ins</h2>

              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th>Student</th>
                      <th>Student ID</th>
                      <th>Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {paginatedCheckins.map((checkin, index) => (
                      <tr key={`checkin-${currentCheckinPage}-${index}`}>
                        <td>
                          <div className="table-cell-main">
                            {checkin.student.name}
                          </div>
                          <div className="table-cell-sub">
                            {checkin.student.email}
                          </div>
                        </td>
                        <td className="table-cell-main">
                          {checkin.student.student_id}
                        </td>
                        <td className="table-cell-secondary">
                          {formatDate(checkin.timestamp)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {Array.isArray(checkins) && checkins.length === 0 && (
                  <div className="table-empty">No check-ins recorded yet.</div>
                )}
              </div>

              <Pagination
                currentPage={currentCheckinPage}
                totalPages={totalCheckinPages}
                onPageChange={handleCheckinPageChange}
                type="checkins"
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default StudentCheckinSystem;
