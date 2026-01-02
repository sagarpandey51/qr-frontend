"use client";
import API_BASE_URL from "@/app/api";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiBook, FiCalendar, FiDownload, FiFilter, 
  FiSearch, FiBarChart2, FiClock, FiCheck, FiEye,
  FiPrinter, FiMail, FiMapPin, FiRefreshCw, FiX,
  FiUsers, FiEyeOff, FiLoader, FiCamera, FiEdit2, FiSave,
  FiLogOut,
  FiSettings,
  FiHome,
  FiClipboard
} from "react-icons/fi";
import { RiQrScanLine, RiUserSettingsLine } from "react-icons/ri";
import { TbQrcode } from "react-icons/tb";
import { FaChalkboardTeacher } from "react-icons/fa";

export default function TeacherPage() {
  const router = useRouter();
  
  // 🔐 Auth state
  const [teacherId, setTeacherId] = useState(null);
  const [institutionCode, setInstitutionCode] = useState(null);
  const [token, setToken] = useState(null);
  const [teacherData, setTeacherData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  // QR States
  const [attendanceQR, setAttendanceQR] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState(1);
  const [scanResult, setScanResult] = useState("");
  const [scanner, setScanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Attendance States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [sortBy, setSortBy] = useState("date");
  const [studentStats, setStudentStats] = useState([]);
  
  // Loading states
  const [loadingTeacherData, setLoadingTeacherData] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  
  // QR Timer
  const [qrTimeLeft, setQrTimeLeft] = useState(0);
  const [qrInterval, setQrInterval] = useState(null);

  // ✅ Load auth safely
  useEffect(() => {
    const teacherId = localStorage.getItem("userId");
    const institutionCode = localStorage.getItem("institutionCode");
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    
    // Check if user is teacher
    if (userType !== "teacher") {
      router.push("/login");
      return;
    }
    
    setTeacherId(teacherId);
    setInstitutionCode(institutionCode);
    setToken(token);
    
    if (teacherId && token) {
      fetchTeacherData(teacherId, token);
      fetchAttendanceRecords(teacherId, token);
    }
    
    // Cleanup scanner
    return () => {
      if (scanner) {
        scanner.stop();
      }
      if (qrInterval) {
        clearInterval(qrInterval);
      }
    };
  }, []);

  // Auto-refresh QR code timer
  useEffect(() => {
    if (qrTimeLeft > 0) {
      const timer = setInterval(() => {
        setQrTimeLeft((prev) => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (qrTimeLeft === 0 && attendanceQR) {
      // QR expired
      setAttendanceQR("");
      if (qrInterval) {
        clearInterval(qrInterval);
        setQrInterval(null);
      }
    }
  }, [qrTimeLeft, attendanceQR]);

  // Fetch teacher data from API
  const fetchTeacherData = async (teacherId, token) => {
    try {
      setLoadingTeacherData(true);
      const res = awaitfetch(`${API_BASE_URL}/api/teachers/profile`
,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setTeacherData(data.data);
        setEditForm({
          name: data.data.name || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          department: data.data.department || "",
          subjects: data.data.subjects || [],
          designation: data.data.designation || ""
        });
        // Load profile photo if exists
        if (data.data.profilePhoto) {
          setProfilePhoto(data.data.profilePhoto);
        }
        // Extract subjects from teacher data
        if (data.data.subjects && Array.isArray(data.data.subjects)) {
          setTeacherSubjects(data.data.subjects.map((subject, index) => ({
            id: index,
            name: subject,
            code: `SUB${index + 1}`,
            schedule: "Schedule to be configured"
          })));
          
          // Auto-select first subject if available
          if (data.data.subjects.length > 0 && !selectedSubject) {
            setSelectedSubject(data.data.subjects[0]);
          }
        }
      } else {
        console.error("Failed to fetch teacher data:", data.message);
        // Set default subjects if API fails
        setTeacherSubjects([
          { id: 1, name: "Default Subject", code: "SUB101", schedule: "To be configured" }
        ]);
        if (!selectedSubject) {
          setSelectedSubject("Default Subject");
        }
      }
    } catch (error) {
      console.error("Error fetching teacher data:", error);
      setTeacherSubjects([
        { id: 1, name: "Default Subject", code: "SUB101", schedule: "To be configured" }
      ]);
      if (!selectedSubject) {
        setSelectedSubject("Default Subject");
      }
    } finally {
      setLoadingTeacherData(false);
    }
  };

  // Update teacher profile
  const updateProfile = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/teachers/profile`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(editForm)
        }
      );
      
      const data = await res.json();
      if (res.ok && data.success) {
        setTeacherData(data.data);
        setEditingProfile(false);
        alert("✅ Profile updated successfully!");
      } else {
        alert(`❌ ${data.message || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("❌ Error updating profile");
    }
  };

  // Fetch attendance records from API
  const fetchAttendanceRecords = async (teacherId, token) => {
    try {
      setLoadingAttendance(true);
      const res = await fetch(
        `${API_BASE_URL}/api/attendance/class-attendance`,{
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setAttendanceRecords(data.data.attendance || []);
        setFilteredRecords(data.data.attendance || []);
        calculateStudentStats(data.data.attendance || []);
      } else {
        console.error("Failed to fetch attendance records:", data.message);
        setAttendanceRecords([]);
        setFilteredRecords([]);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceRecords([]);
      setFilteredRecords([]);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Calculate student statistics
  const calculateStudentStats = (records) => {
    if (!records || records.length === 0) {
      setStudentStats([]);
      return;
    }
    
    const stats = {};
    records.forEach(record => {
      if (record.studentId) {
        const studentId = record.studentId._id || record.studentId;
        if (!stats[studentId]) {
          stats[studentId] = {
            studentId: studentId,
            studentName: record.studentId?.name || `Student ${studentId}`,
            totalClasses: 0,
            present: 0,
            late: 0,
            absent: 0
          };
        }
        stats[studentId].totalClasses++;
        if (record.status === "present") stats[studentId].present++;
        if (record.status === "late") stats[studentId].late++;
        if (record.status === "absent") stats[studentId].absent++;
      }
    });
    setStudentStats(Object.values(stats));
  };

  // Filter and sort attendance
  useEffect(() => {
    let filtered = [...attendanceRecords];
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(record =>
        (record.studentId?.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (record.subject?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    
    // Month filter
    const currentYear = new Date().getFullYear();
    filtered = filtered.filter(record => {
      if (!record.date) return false;
      try {
        const recordDate = new Date(record.date);
        return recordDate.getMonth() === selectedMonth && recordDate.getFullYear() === currentYear;
      } catch {
        return false;
      }
    });
    
    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date || 0) - new Date(a.date || 0);
      } else if (sortBy === "name") {
        return (a.studentId?.name || '').localeCompare(b.studentId?.name || '');
      } else if (sortBy === "subject") {
        return (a.subject || '').localeCompare(b.subject || '');
      }
      return 0;
    });
    
    setFilteredRecords(filtered);
  }, [searchQuery, selectedMonth, sortBy, attendanceRecords]);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (!teacherId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-white text-xl">Authentication Required</h2>
          <p className="text-gray-400 mt-2">Please login again</p>
          <button 
            onClick={() => router.push("/login")}
            className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 📌 Generate Attendance QR
  const generateAttendanceQR = async () => {
    if (!selectedSubject) {
      alert("Please select a subject first");
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/qr/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            subject: selectedSubject,
            class: selectedClass || "General",
            period: selectedPeriod || 1,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to generate QR");
      }

      setAttendanceQR(data.data.qrToken);
      setQrTimeLeft(300); // 5 minutes in seconds
      
      // Start countdown
      if (qrInterval) clearInterval(qrInterval);
      const interval = setInterval(() => {
        setQrTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setAttendanceQR("");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setQrInterval(interval);
      
    } catch (error) {
      console.error("Error generating QR:", error);
      alert(error.message || "Failed to generate QR");
    } finally {
      setLoading(false);
    }
  };

  // Handle subject selection
  const handleSelectSubject = (subjectName) => {
    setSelectedSubject(subjectName);
    // Clear previous QR if subject changes
    if (attendanceQR && subjectName !== selectedSubject) {
      setAttendanceQR("");
      if (qrInterval) {
        clearInterval(qrInterval);
        setQrInterval(null);
      }
      setQrTimeLeft(0);
    }
  };

  // 📷 Start Scanner
  const startScanner = async () => {
    if (scanner) return;

    const qrScanner = new Html5Qrcode("reader");
    setScanner(qrScanner);

    try {
      await qrScanner.start(
        { facingMode: "environment" },
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          setScanResult(decodedText);
          handleScanResult(decodedText);
          qrScanner.stop();
          setScanner(null);
        },
        (error) => {
          console.error("QR scan error:", error);
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      alert("Failed to start scanner. Please check camera permissions.");
    }
  };

  const stopScanner = async () => {
    if (scanner) {
      await scanner.stop();
      setScanner(null);
    }
  };

  const handleScanResult = async (result) => {
    try {
      // Mark attendance via API
      const res = await fetch(
        `${API_BASE_URL}/api/attendance/mark`,{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            qrToken: result,
          }),
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        alert(`✅ ${data.message}`);
        // Refresh attendance records
        fetchAttendanceRecords(teacherId, token);
      } else {
        alert(`❌ ${data.message || 'Failed to mark attendance'}`);
      }
    } catch (e) {
      console.error("Error marking attendance:", e);
      alert("❌ Error processing QR code");
    }
  };

  // Format time left
  const formatTimeLeft = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Refresh data
  const refreshData = () => {
    if (teacherId && token) {
      fetchTeacherData(teacherId, token);
      fetchAttendanceRecords(teacherId, token);
    }
  };

  // Months for filter
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 p-4 md:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 bg-clip-text text-transparent">
              TEACHER DASHBOARD
            </h1>
            <p className="text-gray-400 text-sm tracking-wider mt-2">
              // ATTENDANCE MANAGEMENT SYSTEM
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 rounded-lg bg-gray-900/40 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700 transition-all"
              title="Refresh data"
            >
              <FiRefreshCw className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-gray-900/40 border border-gray-800 text-gray-400 hover:text-red-400 hover:border-red-500/50 transition-all"
              title="Logout"
            >
              <FiLogOut className="w-5 h-5" />
            </button>
            
            {/* Tabs */}
            <div className="flex flex-wrap gap-2 bg-gray-900/40 backdrop-blur-sm p-2 rounded-xl">
              {["dashboard", "qr", "reports", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 1: Teacher Details & Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
        >
          {/* Teacher Profile Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl blur-md" />
                <div className="relative">
                  {profilePhoto ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-purple-500/50">
                      <img 
                        src={profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 flex items-center justify-center">
                      <FaChalkboardTeacher className="w-10 h-10 text-purple-400" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Teacher Info */}
              <div className="flex-1">
                {editingProfile ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                      placeholder="Full Name"
                    />
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                      placeholder="Email"
                    />
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                      placeholder="Phone"
                    />
                    <div className="flex gap-3">
                      <button
                        onClick={updateProfile}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FiSave className="w-4 h-4 inline mr-2" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        <FiX className="w-4 h-4 inline mr-2" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-white">
                          {loadingTeacherData ? (
                            <div className="flex items-center gap-2">
                              <FiLoader className="w-5 h-5 animate-spin" />
                              Loading...
                            </div>
                          ) : (
                            teacherData?.name || "Teacher"
                          )}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {teacherData?.designation || 'Teacher'} • {teacherData?.department || 'Department'}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                        title="Edit Profile"
                      >
                        <FiEdit2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="px-3 py-1 rounded-full bg-purple-900/30 text-purple-300 text-sm border border-purple-500/30">
                        ID: {teacherData?.teacherId || teacherId}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-blue-900/30 text-blue-300 text-sm border border-blue-500/30">
                        {teacherData?.department || "Department"}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-green-900/30 text-green-300 text-sm border border-green-500/30">
                        Subjects: {teacherSubjects.length}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-sm border border-gray-700">
                        <FiMail className="w-3 h-3 inline mr-1" />
                        {teacherData?.email || 'Email not set'}
                      </span>
                      {teacherData?.phone && (
                        <span className="px-3 py-1 rounded-full bg-gray-800/50 text-gray-300 text-sm border border-gray-700">
                          <FiPhone className="w-3 h-3 inline mr-1" />
                          {teacherData.phone}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                <div className="flex items-center gap-3">
                  <FiUsers className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Students</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingAttendance ? (
                        <FiLoader className="w-5 h-5 animate-spin inline" />
                      ) : (
                        studentStats.length || 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                <div className="flex items-center gap-3">
                  <FiBarChart2 className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Attendance Rate</p>
                    <p className="text-2xl font-bold text-white">
                      {loadingAttendance ? (
                        <FiLoader className="w-5 h-5 animate-spin inline" />
                      ) : studentStats.length > 0 ? (
                        Math.round(
                          studentStats.reduce((acc, stat) => {
                            const total = stat.totalClasses || 1;
                            const present = stat.present || 0;
                            return acc + (present / total);
                          }, 0) / studentStats.length * 100
                        ) + '%'
                      ) : (
                        '0%'
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <FiBook className="w-5 h-5 text-purple-400" />
                  Teaching Subjects
                </h3>
                {loadingTeacherData && (
                  <FiLoader className="w-4 h-4 animate-spin text-gray-400" />
                )}
              </div>
              
              {loadingTeacherData ? (
                <div className="text-center py-8">
                  <FiLoader className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                  <p className="text-gray-500 mt-2">Loading subjects...</p>
                </div>
              ) : teacherSubjects.length === 0 ? (
                <div className="text-center py-8">
                  <FiBook className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No subjects assigned</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {teacherSubjects.map((subject) => (
                    <div 
                      key={subject.id} 
                      className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                        selectedSubject === subject.name 
                          ? 'bg-purple-900/20 border-purple-500/50' 
                          : 'bg-gray-900/40 border-gray-800 hover:border-purple-500/30'
                      }`}
                      onClick={() => handleSelectSubject(subject.name)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-white">{subject.name}</h4>
                          <p className="text-sm text-gray-400">{subject.code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedSubject === subject.name && (
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            selectedSubject === subject.name 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-800 text-gray-300'
                          }`}>
                            {selectedSubject === subject.name ? 'Selected' : 'Select'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-400">
                        <FiClock className="w-4 h-4" />
                        <span>{subject.schedule}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* QR Section */}
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TbQrcode className="w-5 h-5 text-purple-400" />
              QR Attendance Generator
            </h3>
            
            {/* Subject Selection */}
            <div className="space-y-4 mb-6">
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800">
                <p className="text-sm text-gray-300 mb-2">Selected Subject:</p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-purple-300">
                    {selectedSubject || "None selected"}
                  </p>
                  {selectedSubject && (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">Ready</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Class and Period Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Class</label>
                  <input
                    type="text"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    placeholder="e.g., CS101"
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>Period {num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={generateAttendanceQR}
                disabled={loading || !selectedSubject}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating QR...
                  </div>
                ) : (
                  "Generate Attendance QR"
                )}
              </motion.button>

              {attendanceQR && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-4 p-4 rounded-xl bg-gray-900/40 border border-green-500/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FiCheck className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-semibold">LIVE QR ACTIVE</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-xs text-green-400">
                        Expires in: {formatTimeLeft(qrTimeLeft)}
                      </span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/30 flex justify-center">
                    <QRCodeCanvas 
                      value={attendanceQR} 
                      size={140}
                      bgColor="transparent"
                      fgColor="#ffffff"
                    />
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-xs text-gray-400">
                      Display this for students to scan
                    </p>
                    <p className="text-xs text-gray-500">
                      Subject: {selectedSubject} • Class: {selectedClass || "General"}
                    </p>
                  </div>
                </motion.div>
              )}

              {!selectedSubject && (
                <div className="p-4 rounded-xl bg-yellow-900/20 border border-yellow-500/30">
                  <div className="flex items-center gap-2">
                    <FiBook className="w-4 h-4 text-yellow-400" />
                    <p className="text-sm text-yellow-300">Select a subject to generate QR</p>
                  </div>
                  <p className="text-xs text-yellow-400/70 mt-1">
                    Click on any subject card to select it
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: QR Scanner for Students */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <RiQrScanLine className="w-6 h-6 text-blue-400" />
              Student QR Scanner
            </h2>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startScanner}
                disabled={scanner}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <RiQrScanLine className="w-4 h-4" />
                Start Scanner
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={stopScanner}
                disabled={!scanner}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                <FiX className="w-4 h-4" />
                Stop Scanner
              </motion.button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Scanner View */}
            <div className="lg:w-2/3">
              <div className="relative">
                <div
                  id="reader"
                  className="w-full aspect-square border-2 border-gray-700 rounded-2xl overflow-hidden"
                >
                  {scanner && (
                    <motion.div
                      className="absolute inset-0 border-2 border-blue-500/50 rounded-2xl"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(59,130,246,0.3)",
                          "0 0 40px rgba(59,130,246,0.5)",
                          "0 0 20px rgba(59,130,246,0.3)",
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </div>
                
                {!scanner && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <RiQrScanLine className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500">Scanner is inactive</p>
                      <p className="text-sm text-gray-400 mt-1">Click "Start Scanner" to begin</p>
                    </div>
                  </div>
                )}
              </div>

              {scanResult && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-gradient-to-r from-gray-900/80 to-black/80 border border-green-500/30"
                >
                  <h4 className="text-green-400 font-semibold mb-2">Scan Successful!</h4>
                  <p className="text-sm text-gray-300 break-all">
                    {scanResult.length > 100 ? scanResult.substring(0, 100) + "..." : scanResult}
                  </p>
                </motion.div>
              )}
            </div>

            {/* Scan Instructions */}
            <div className="lg:w-1/3 space-y-4">
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                <h4 className="font-semibold text-white mb-2">How to use:</h4>
                <ol className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">1.</span>
                    Click "Start Scanner" to activate camera
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">2.</span>
                    Point camera at student's QR code
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">3.</span>
                    Scanner will automatically detect
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400">4.</span>
                    Attendance will be marked automatically
                  </li>
                </ol>
              </div>

              {attendanceRecords.slice(0, 3).length > 0 && (
                <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                  <h4 className="font-semibold text-white mb-2">Recent Attendance</h4>
                  <div className="space-y-2">
                    {attendanceRecords.slice(0, 3).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                        <div>
                          <p className="text-sm text-white">{record.studentId?.name || "Student"}</p>
                          <p className="text-xs text-gray-400">
                            {record.subject} • {new Date(record.scanTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          record.status === "present" ? "bg-green-900/30 text-green-400" :
                          record.status === "late" ? "bg-yellow-900/30 text-yellow-400" :
                          "bg-gray-900/30 text-gray-400"
                        }`}>
                          {record.status || "Unknown"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: Attendance Reports & Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiClipboard className="w-6 h-6 text-green-400" />
              Attendance Reports
            </h2>
            
            <div className="flex flex-wrap gap-3">
              {/* Search */}
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:border-green-500/50"
                />
              </div>

              {/* Filters */}
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="px-4 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none"
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="subject">Sort by Subject</option>
              </select>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="overflow-x-auto mb-6">
            {loadingAttendance ? (
              <div className="text-center py-12">
                <FiLoader className="w-12 h-12 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-4">Loading attendance records...</p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No attendance records found</p>
                {searchQuery && (
                  <p className="text-sm mt-2">Try adjusting your search filters</p>
                )}
              </div>
            ) : (
              <div className="rounded-xl overflow-hidden border border-gray-800">
                <table className="w-full">
                  <thead className="bg-gray-900/60">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Student</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Subject</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Date</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Time</th>
                      <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => (
                      <tr key={index} className="border-t border-gray-800/30 hover:bg-gray-800/20 transition-colors">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-gray-300">{record.studentId?.name || "Student"}</p>
                            <p className="text-xs text-gray-400">{record.rollNumber || record.studentId?.rollNo}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{record.subject || 'N/A'}</td>
                        <td className="py-3 px-4 text-gray-300">
                          {record.date ? new Date(record.date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-gray-300">
                          {record.scanTime ? new Date(record.scanTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            record.status === "present" ? "bg-green-900/30 text-green-400 border border-green-500/30" :
                            record.status === "late" ? "bg-yellow-900/30 text-yellow-400 border border-yellow-500/30" :
                            record.status === "absent" ? "bg-red-900/30 text-red-400 border border-red-500/30" :
                            "bg-gray-900/30 text-gray-400 border border-gray-500/30"
                          }`}>
                            {record.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Student Statistics */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiBarChart2 className="w-5 h-5 text-purple-400" />
              Student Statistics
            </h3>
            
            {loadingAttendance ? (
              <div className="text-center py-8">
                <FiLoader className="w-8 h-8 animate-spin text-gray-400 mx-auto" />
                <p className="text-gray-500 mt-2">Loading statistics...</p>
              </div>
            ) : studentStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiUsers className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No student statistics available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {studentStats.slice(0, 4).map((stat) => {
                  const attendancePercentage = stat.totalClasses > 0 
                    ? Math.round((stat.present / stat.totalClasses) * 100)
                    : 0;
                  
                  return (
                    <div key={stat.studentId} className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white">{stat.studentName}</h4>
                          <p className="text-sm text-gray-400">{stat.studentId}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">{attendancePercentage}%</div>
                          <div className="text-xs text-gray-400">Attendance</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Total Classes:</span>
                          <span className="text-white">{stat.totalClasses}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-400">Present:</span>
                          <span className="text-white">{stat.present}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-yellow-400">Late:</span>
                          <span className="text-white">{stat.late}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-red-400">Absent:</span>
                          <span className="text-white">{stat.absent}</span>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                            style={{ width: `${attendancePercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">TOTAL RECORDS: </span>
            <span className="text-gray-200 font-semibold">
              {loadingAttendance ? (
                <FiLoader className="w-4 h-4 animate-spin inline" />
              ) : (
                attendanceRecords.length
              )}
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">FILTERED: </span>
            <span className="text-gray-200 font-semibold">
              {loadingAttendance ? (
                <FiLoader className="w-4 h-4 animate-spin inline" />
              ) : (
                filteredRecords.length
              )}
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">STUDENTS: </span>
            <span className="text-gray-200 font-semibold">
              {loadingAttendance ? (
                <FiLoader className="w-4 h-4 animate-spin inline" />
              ) : (
                studentStats.length
              )}
            </span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">SELECTED SUBJECT: </span>
            <span className="text-gray-200 font-semibold">
              {selectedSubject || "None"}
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}