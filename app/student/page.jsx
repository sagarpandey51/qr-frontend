"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiCalendar, FiBook, FiCheck, FiX, 
  FiMapPin, FiClock, FiBarChart2, FiTrendingUp,
  FiFilter, FiDownload, FiRefreshCw, FiLoader,
  FiCamera, FiUpload, FiEdit2, FiSave,
  FiMail, FiPhone, FiHash, FiPercent,
  FiLogOut,
  FiClipboard,
  FiHome
} from "react-icons/fi";
import { RiQrScanLine, RiUserLine } from "react-icons/ri";
import { TbQrcode } from "react-icons/tb";
import { FaUserGraduate } from "react-icons/fa";

export default function StudentPage() {
  const router = useRouter();
  const [studentId, setStudentId] = useState(null);
  const [institutionCode, setInstitutionCode] = useState(null);
  const [token, setToken] = useState(null);
  const [studentData, setStudentData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [scanner, setScanner] = useState(null);
  const [message, setMessage] = useState("");
  const [scanResult, setScanResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  // Profile editing states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({});

  // Attendance States
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [subjectStats, setSubjectStats] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [overallStats, setOverallStats] = useState({
    totalClasses: 0,
    present: 0,
    late: 0,
    absent: 0,
    attendancePercentage: 0
  });
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  // Subjects list
  const [studentSubjects, setStudentSubjects] = useState([]);

  // ✅ Load auth safely
  useEffect(() => {
    const studentId = localStorage.getItem("userId");
    const institutionCode = localStorage.getItem("institutionCode");
    const token = localStorage.getItem("token");
    const userType = localStorage.getItem("userType");
    
    // Check if user is student
    if (userType !== "student") {
      router.push("/login");
      return;
    }
    
    setStudentId(studentId);
    setInstitutionCode(institutionCode);
    setToken(token);
    
    if (studentId && token) {
      fetchStudentData(studentId, token);
      fetchAttendanceRecords(studentId, token);
    }
    
    // Cleanup scanner
    return () => {
      if (scanner) {
        scanner.stop();
      }
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  // Fetch student data from API
  const fetchStudentData = async (studentId, token) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/students/profile`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      const data = await res.json();
      if (res.ok && data.success) {
        setStudentData(data.data);
        setEditForm({
          name: data.data.name || "",
          rollNo: data.data.rollNo || "",
          email: data.data.email || "",
          phone: data.data.phone || "",
          course: data.data.course || "",
          semester: data.data.semester || "",
          branch: data.data.branch || ""
        });
        // Extract subjects from student data
        if (data.data.subjects && Array.isArray(data.data.subjects)) {
          setStudentSubjects(data.data.subjects.map((subject, index) => ({
            id: index,
            name: subject,
            code: `SUB${index + 1}`,
            schedule: "Schedule to be configured"
          })));
        }
      } else {
        console.error("Failed to fetch student data:", data.message);
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  // Update student profile
  const updateProfile = async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/students/profile`,
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
        setStudentData(data.data);
        setEditingProfile(false);
        setMessage("✅ Profile updated successfully!");
      } else {
        setMessage(`❌ ${data.message || 'Failed to update profile'}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("❌ Error updating profile");
    }
  };

  // Fetch attendance records from API
  const fetchAttendanceRecords = async (studentId, token) => {
    try {
      setLoadingAttendance(true);
      const res = await fetch(
        `http://localhost:5000/api/attendance/my-attendance`,
        {
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
        calculateSubjectStats(data.data.attendance || []);
        calculateOverallStats(data.data.attendance || []);
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

  // Calculate subject-wise statistics
  const calculateSubjectStats = (records) => {
    if (!records || records.length === 0) {
      setSubjectStats([]);
      return;
    }
    
    const stats = {};
    records.forEach(record => {
      if (!stats[record.subject]) {
        stats[record.subject] = {
          subject: record.subject,
          totalClasses: 0,
          present: 0,
          late: 0,
          absent: 0,
          attendancePercentage: 0
        };
      }
      stats[record.subject].totalClasses++;
      if (record.status === "present") stats[record.subject].present++;
      if (record.status === "late") stats[record.subject].late++;
      if (record.status === "absent") stats[record.subject].absent++;
    });
    
    // Calculate percentages
    Object.keys(stats).forEach(subject => {
      const stat = stats[subject];
      stat.attendancePercentage = stat.totalClasses > 0 
        ? Math.round((stat.present / stat.totalClasses) * 100)
        : 0;
    });
    
    setSubjectStats(Object.values(stats));
  };

  // Calculate overall statistics
  const calculateOverallStats = (records) => {
    if (!records || records.length === 0) {
      setOverallStats({
        totalClasses: 0,
        present: 0,
        late: 0,
        absent: 0,
        attendancePercentage: 0
      });
      return;
    }
    
    let totalClasses = records.length;
    let present = records.filter(r => r.status === "present").length;
    let late = records.filter(r => r.status === "late").length;
    let absent = records.filter(r => r.status === "absent").length;
    
    setOverallStats({
      totalClasses,
      present,
      late,
      absent,
      attendancePercentage: Math.round((present / totalClasses) * 100)
    });
  };

  // Handle subject selection
  const handleSelectSubject = (subjectName) => {
    setSelectedSubject(subjectName);
  };

  if (!studentId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h2 className="text-white text-xl">Authentication Required</h2>
          <p className="text-gray-400 mt-2">Please login again</p>
          <button 
            onClick={() => router.push("/login")}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // 📷 Start QR Scanner
  const startScanner = async () => {
    if (scanner) return;

    setLoading(true);
    setMessage("");
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
        async (qrToken) => {
          setScanResult(qrToken);
          await qrScanner.stop();
          setScanner(null);
          setLoading(false);

          // Mark attendance via API
          try {
            const res = await fetch(
              "http://localhost:5000/api/attendance/mark",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                  qrToken: qrToken,
                }),
              }
            );

            const data = await res.json();
            if (res.ok && data.success) {
              setMessage(`✅ ${data.message}`);
              // Refresh attendance records
              fetchAttendanceRecords(studentId, token);
            } else {
              setMessage(`❌ ${data.message || 'Failed to mark attendance'}`);
            }
          } catch (error) {
            console.error("Error marking attendance:", error);
            setMessage("❌ Error processing attendance");
          }
        },
        (error) => {
          console.error("QR scan error:", error);
        }
      );
    } catch (err) {
      console.error("Scanner error:", err);
      setLoading(false);
      setMessage("❌ Failed to start scanner. Please check camera permissions.");
    }
  };

  const stopScanner = async () => {
    if (scanner) {
      await scanner.stop();
      setScanner(null);
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    if (studentId && token) {
      fetchStudentData(studentId, token);
      fetchAttendanceRecords(studentId, token);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case "present": return "text-green-400 bg-green-900/30 border-green-500/30";
      case "late": return "text-yellow-400 bg-yellow-900/30 border-yellow-500/30";
      case "absent": return "text-red-400 bg-red-900/30 border-red-500/30";
      default: return "text-gray-400 bg-gray-900/30 border-gray-500/30";
    }
  };

  // Filter records by selected subject
  const getFilteredAttendance = () => {
    if (!selectedSubject || selectedSubject === "All Subjects") {
      return attendanceRecords;
    }
    return attendanceRecords.filter(record => record.subject === selectedSubject);
  };

  // Get stats for selected subject
  const getSelectedSubjectStats = () => {
    if (!selectedSubject || selectedSubject === "All Subjects") {
      return null;
    }
    return subjectStats.find(subject => subject.subject === selectedSubject);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-900 p-4 md:p-6">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-200 via-blue-200 to-gray-200 bg-clip-text text-transparent">
              STUDENT DASHBOARD
            </h1>
            <p className="text-gray-400 text-sm tracking-wider mt-2">
              // ATTENDANCE TRACKING SYSTEM
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
              {["dashboard", "scanner", "attendance", "analytics"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 1: Student Profile & Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6"
        >
          {/* Student Profile Card */}
          <div className="lg:col-span-2 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-start gap-4 mb-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl blur-md" />
                <div className="relative">
                  {profilePhoto ? (
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-blue-500/50">
                      <img 
                        src={profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 flex items-center justify-center">
                      <FaUserGraduate className="w-10 h-10 text-blue-400" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Student Info */}
              <div className="flex-1">
                {editingProfile ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                      placeholder="Full Name"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.rollNo}
                        onChange={(e) => setEditForm({...editForm, rollNo: e.target.value})}
                        className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                        placeholder="Roll Number"
                      />
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                        placeholder="Email"
                      />
                    </div>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                      placeholder="Phone"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editForm.course}
                        onChange={(e) => setEditForm({...editForm, course: e.target.value})}
                        className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                        placeholder="Course"
                      />
                      <input
                        type="text"
                        value={editForm.semester}
                        onChange={(e) => setEditForm({...editForm, semester: e.target.value})}
                        className="px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700 text-white"
                        placeholder="Semester"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={updateProfile}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex-1"
                      >
                        <FiSave className="w-4 h-4 inline mr-2" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingProfile(false)}
                        className="px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
                          {studentData?.name || `Student ${studentId}`}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {studentData?.rollNo || 'Roll No: N/A'} • {studentData?.course || 'Course'} Sem {studentData?.semester || 'N/A'}
                        </p>
                      </div>
                      <button
                        onClick={() => setEditingProfile(true)}
                        className="p-3 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                        title="Edit Profile"
                      >
                        <FiEdit2 className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="px-3 py-2 rounded-full bg-blue-900/30 text-blue-300 text-sm border border-blue-500/30 flex items-center gap-2">
                        <FiHash className="w-3 h-3" />
                        ID: {studentData?.rollNo || studentId}
                      </span>
                      <span className="px-3 py-2 rounded-full bg-purple-900/30 text-purple-300 text-sm border border-purple-500/30">
                        {studentData?.branch || studentData?.course || "Course"}
                      </span>
                      <span className="px-3 py-2 rounded-full bg-green-900/30 text-green-300 text-sm border border-green-500/30 flex items-center gap-2">
                        <FiPercent className="w-3 h-3" />
                        Attendance: {overallStats.attendancePercentage}%
                      </span>
                      <span className="px-3 py-2 rounded-full bg-gray-800/50 text-gray-300 text-sm border border-gray-700 flex items-center gap-2">
                        <FiMail className="w-3 h-3" />
                        {studentData?.email || 'Email not set'}
                      </span>
                      {studentData?.phone && (
                        <span className="px-3 py-2 rounded-full bg-gray-800/50 text-gray-300 text-sm border border-gray-700 flex items-center gap-2">
                          <FiPhone className="w-3 h-3" />
                          {studentData.phone}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FiCalendar className="w-6 h-6 text-blue-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Total Classes</p>
                    <p className="text-2xl font-bold text-white">
                      {overallStats.totalClasses}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-green-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FiCheck className="w-6 h-6 text-green-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Present</p>
                    <p className="text-2xl font-bold text-white">
                      {overallStats.present}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-yellow-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FiClock className="w-6 h-6 text-yellow-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Late</p>
                    <p className="text-2xl font-bold text-white">
                      {overallStats.late}
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-red-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <FiX className="w-6 h-6 text-red-400" />
                  <div>
                    <p className="text-gray-400 text-sm">Absent</p>
                    <p className="text-2xl font-bold text-white">
                      {overallStats.absent}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <FiPercent className="w-4 h-4 text-blue-400" />
                  Overall Attendance Progress
                </h3>
                <span className="text-2xl font-bold text-blue-300">
                  {overallStats.attendancePercentage}%
                </span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallStats.attendancePercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Institution Info Card */}
          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FiHome className="w-5 h-5 text-blue-400" />
              Institution Info
            </h3>
            
            <div className="flex flex-col items-center mb-6">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-blue-500/30 mb-4">
                <QRCodeCanvas 
                  value={JSON.stringify({
                    role: "student",
                    studentId,
                    institutionCode,
                    name: studentData?.name || "Student"
                  })} 
                  size={180}
                  bgColor="transparent"
                  fgColor="#ffffff"
                  level="H"
                />
              </div>
              <p className="text-gray-400 text-sm text-center">
                Student ID QR Code
              </p>
            </div>

            {/* Quick Info */}
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800">
                <p className="text-sm text-gray-300 mb-1">Institution Code</p>
                <p className="font-semibold text-white font-mono">{institutionCode}</p>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800">
                <p className="text-sm text-gray-300 mb-1">Student Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400 font-semibold">ACTIVE</span>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-900/40 border border-gray-800">
                <p className="text-sm text-gray-300 mb-1">Enrolled Subjects</p>
                <p className="text-sm text-white">
                  {studentSubjects.length} subjects
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 2: QR Scanner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl mb-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <RiQrScanLine className="w-6 h-6 text-green-400" />
              Scan Teacher's QR
            </h2>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startScanner}
                disabled={scanner || loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <FiLoader className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : scanner ? (
                  <>
                    <RiQrScanLine className="w-4 h-4" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <RiQrScanLine className="w-4 h-4" />
                    Start Scanner
                  </>
                )}
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
                      className="absolute inset-0 border-2 border-green-500/50 rounded-2xl"
                      animate={{
                        boxShadow: [
                          "0 0 20px rgba(34,197,94,0.3)",
                          "0 0 40px rgba(34,197,94,0.5)",
                          "0 0 20px rgba(34,197,94,0.3)",
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

              {/* Status Messages */}
              <AnimatePresence>
                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`mt-4 p-4 rounded-xl border ${
                      message.includes("✅") 
                        ? "bg-green-900/20 border-green-500/30" 
                        : "bg-red-900/20 border-red-500/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {message.includes("✅") ? (
                        <FiCheck className="w-5 h-5 text-green-400" />
                      ) : (
                        <FiX className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-sm">{message}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Instructions */}
            <div className="lg:w-1/3 space-y-4">
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                <h4 className="font-semibold text-white mb-2">How to mark attendance:</h4>
                <ol className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">1.</span>
                    Click "Start Scanner" to activate camera
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">2.</span>
                    Point camera at teacher's attendance QR
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">3.</span>
                    Wait for automatic detection
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">4.</span>
                    Attendance will be marked automatically
                  </li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800">
                <h4 className="font-semibold text-white mb-2">Tips:</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Ensure good lighting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Hold device steady</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>Scan during class time only</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-green-400" />
                    <span>One scan per class</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SECTION 3: Subject-wise Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-6 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <FiClipboard className="w-6 h-6 text-purple-400" />
              Attendance Analytics
            </h2>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">
                Showing data for: 
              </span>
              <select
                value={selectedSubject}
                onChange={(e) => handleSelectSubject(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none"
              >
                <option value="All Subjects">All Subjects</option>
                {subjectStats.map((subject, index) => (
                  <option key={index} value={subject.subject}>
                    {subject.subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingAttendance ? (
            <div className="text-center py-12">
              <FiLoader className="w-12 h-12 animate-spin text-gray-400 mx-auto" />
              <p className="text-gray-500 mt-4">Loading attendance analytics...</p>
            </div>
          ) : subjectStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FiBook className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>No attendance data available yet</p>
              <p className="text-sm mt-2">Scan QR codes to start tracking attendance</p>
            </div>
          ) : (
            <>
              {/* Selected Subject Stats */}
              {selectedSubject && selectedSubject !== "All Subjects" && (
                <div className="mb-6">
                  <div className="p-6 rounded-xl bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white">{selectedSubject}</h3>
                        <p className="text-gray-400">Selected Subject Statistics</p>
                      </div>
                      {getSelectedSubjectStats() && (
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-300">
                            {getSelectedSubjectStats().attendancePercentage}%
                          </div>
                          <div className="text-sm text-gray-400">Attendance Rate</div>
                        </div>
                      )}
                    </div>
                    
                    {getSelectedSubjectStats() && (
                      <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{getSelectedSubjectStats().totalClasses}</div>
                          <div className="text-sm text-gray-400">Total Classes</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">{getSelectedSubjectStats().present}</div>
                          <div className="text-sm text-gray-400">Present</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{getSelectedSubjectStats().late}</div>
                          <div className="text-sm text-gray-400">Late</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-400">{getSelectedSubjectStats().absent}</div>
                          <div className="text-sm text-gray-400">Absent</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Subject Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {(selectedSubject === "All Subjects" ? subjectStats : subjectStats.filter(subject => subject.subject === selectedSubject)).map((subject, index) => (
                  <div key={index} className="p-4 rounded-xl bg-gray-900/40 border border-gray-800 hover:border-blue-500/30 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-white">{subject.subject}</h4>
                        <p className="text-sm text-gray-400">{subject.totalClasses} classes</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-300">{subject.attendancePercentage}%</div>
                        <div className="text-xs text-gray-400">Attendance</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          style={{ width: `${subject.attendancePercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    {/* Detailed Stats */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-400">{subject.present}</div>
                        <div className="text-xs text-gray-400">Present</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-400">{subject.late}</div>
                        <div className="text-xs text-gray-400">Late</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-400">{subject.absent}</div>
                        <div className="text-xs text-gray-400">Absent</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Attendance */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FiTrendingUp className="w-5 h-5 text-green-400" />
                  Recent Attendance {selectedSubject !== "All Subjects" && `- ${selectedSubject}`}
                </h3>
                
                <div className="rounded-xl overflow-hidden border border-gray-800">
                  <table className="w-full">
                    <thead className="bg-gray-900/60">
                      <tr>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Subject</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Date</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Time</th>
                        <th className="text-left py-3 px-4 text-gray-400 text-sm font-normal tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getFilteredAttendance().slice(0, 5).map((record, index) => (
                        <tr key={index} className="border-t border-gray-800/30 hover:bg-gray-800/20 transition-colors">
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
                
                {getFilteredAttendance().length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FiCalendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>No attendance records found for {selectedSubject}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Quick Stats Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">TOTAL CLASSES ATTENDED: </span>
            <span className="text-gray-200 font-semibold">{overallStats.present}</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">ATTENDANCE RATE: </span>
            <span className="text-gray-200 font-semibold">{overallStats.attendancePercentage}%</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">SUBJECTS: </span>
            <span className="text-gray-200 font-semibold">{subjectStats.length}</span>
          </div>
          <div className="px-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-sm">
            <span className="text-gray-400">IN VIEW: </span>
            <span className="text-gray-200 font-semibold">{selectedSubject || "All Subjects"}</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}