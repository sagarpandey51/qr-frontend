"use client";
import API_BASE_URL from "../../api";


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiMail, FiKey, FiBook, FiCheck, FiPhone, FiHash, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { RiUserLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { FaUserGraduate } from "react-icons/fa";

export default function StudentRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    rollNo: "",
    email: "",
    phone: "",
    department: "",
    course: "",
    semester: "",
    institutionCode: "",
    password: "",
    confirmPassword: ""
  });
  
  const [subjects, setSubjects] = useState([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registeredStudent, setRegisteredStudent] = useState(null);

  const courses = ["B.Tech", "B.E", "B.Sc", "B.Com", "B.A", "M.Tech", "M.Sc", "MBA"];
  const semesters = ["1", "2", "3", "4", "5", "6", "7", "8"];
  const departments = [
    "Computer Science",
    "Electronics",
    "Mechanical",
    "Civil",
    "Electrical",
    "Information Technology",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "English",
    "History",
    "Economics",
    "Commerce"
  ];

  const addSubjectField = () => {
    if (subjects.length < 10) {
      setSubjects([...subjects, ""]);
    }
  };

  const removeSubjectField = (index) => {
    if (subjects.length > 1) {
      const updatedSubjects = subjects.filter((_, i) => i !== index);
      setSubjects(updatedSubjects);
    }
  };

  const updateSubject = (index, value) => {
    const updatedSubjects = [...subjects];
    updatedSubjects[index] = value;
    setSubjects(updatedSubjects);
  };

  const submit = async () => {
    setError("");
    
    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    const requiredFields = ["name", "rollNo", "email", "institutionCode", "password", "course", "semester"];
    for (const field of requiredFields) {
      if (!form[field]?.trim()) {
        const fieldName = field.replace(/([A-Z])/g, ' $1').toLowerCase();
        setError(`Please fill in ${fieldName}`);
        return;
      }
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Filter out empty subjects
    const filteredSubjects = subjects.filter(subject => subject.trim() !== "");

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/students/register`
,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            rollNo: form.rollNo.trim().toUpperCase(),
            email: form.email.toLowerCase().trim(),
            phone: form.phone || "",
            department: form.department || "",
            course: form.course,
            semester: form.semester,
            subjects: filteredSubjects,
            institutionCode: form.institutionCode.trim().toUpperCase(),
            password: form.password
          }),
        }
      );

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Registration failed");
      }

      setRegisteredStudent(data.data);
      setShowSuccess(true);
      
      // Auto login if token is provided
      if (data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userType", "student");
        localStorage.setItem("userId", data.data.student?.id);
        localStorage.setItem("institutionCode", data.data.student?.institutionCode);
      }

    } catch (error) {
      setError(error.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleGoToDashboard = () => {
    if (registeredStudent?.token) {
      router.push("/student");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-4"
      >
        {/* Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600/30 via-cyan-600/30 to-blue-600/30 rounded-3xl blur-xl opacity-30" />

        <div className="relative bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", duration: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 mb-4 shadow-lg"
            >
              <FaUserGraduate className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent mb-2 tracking-tight">
              STUDENT REGISTRATION
            </h1>
            <p className="text-gray-400 text-sm tracking-wider">
              // JOIN AS STUDENT MEMBER
            </p>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-800/50 backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <FiAlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {!showSuccess ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Personal Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      FULL NAME *
                    </label>
                    <div className="relative group">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Roll Number */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      ROLL NUMBER *
                    </label>
                    <div className="relative group">
                      <FiHash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="CSE101"
                        value={form.rollNo}
                        onChange={(e) => setForm({ ...form, rollNo: e.target.value.toUpperCase() })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide uppercase"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      EMAIL ADDRESS *
                    </label>
                    <div className="relative group">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                      <input
                        type="email"
                        placeholder="student@institution.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      PHONE NUMBER
                    </label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div className="p-6 rounded-xl bg-gray-900/30 border border-gray-800/50">
                  <h3 className="text-lg font-semibold text-gray-300 mb-4">
                    ACADEMIC INFORMATION
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Department */}
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm tracking-wider">
                        DEPARTMENT
                      </label>
                      <select
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        className="w-full px-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>

                    {/* Course */}
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm tracking-wider">
                        COURSE *
                      </label>
                      <select
                        value={form.course}
                        onChange={(e) => setForm({ ...form, course: e.target.value })}
                        className="w-full px-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Select Course</option>
                        {courses.map(course => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    </div>

                    {/* Semester */}
                    <div className="space-y-2">
                      <label className="text-gray-300 text-sm tracking-wider">
                        SEMESTER *
                      </label>
                      <select
                        value={form.semester}
                        onChange={(e) => setForm({ ...form, semester: e.target.value })}
                        className="w-full px-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Select Semester</option>
                        {semesters.map(sem => (
                          <option key={sem} value={sem}>Semester {sem}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Subjects Section */}
                <div className="p-6 rounded-xl bg-gray-900/30 border border-gray-800/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-300">
                      SUBJECTS (Optional)
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={addSubjectField}
                      type="button"
                      disabled={isSubmitting || subjects.length >= 10}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      + Add Subject
                    </motion.button>
                  </div>
                  
                  <div className="space-y-3">
                    {subjects.map((subject, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3"
                      >
                        <div className="relative flex-1 group">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                            <FiBook className="w-5 h-5" />
                          </div>
                          <input
                            type="text"
                            placeholder={`Subject ${index + 1}`}
                            value={subject}
                            onChange={(e) => updateSubject(index, e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
                            disabled={isSubmitting}
                          />
                        </div>
                        {subjects.length > 1 && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeSubjectField(index)}
                            type="button"
                            disabled={isSubmitting}
                            className="px-4 py-3 bg-red-600/20 text-red-400 rounded-xl hover:bg-red-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remove
                          </motion.button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-gray-500 text-sm mt-3">
                    Add subjects you're enrolled in (optional, can add later)
                  </p>
                </div>

                {/* Institution Code */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    INSTITUTION CODE *
                  </label>
                  <div className="relative group">
                    <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                    <input
                      type="text"
                      placeholder="INST-XXXXXX"
                      value={form.institutionCode}
                      onChange={(e) => setForm({ ...form, institutionCode: e.target.value.toUpperCase() })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide font-mono uppercase"
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Get this code from your institution or teacher
                  </p>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      PASSWORD *
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        disabled={isSubmitting}
                      >
                        {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Minimum 6 characters</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      CONFIRM PASSWORD *
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                        disabled={isSubmitting}
                      >
                        {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submit}
                  disabled={isSubmitting || 
                    !form.name || 
                    !form.rollNo || 
                    !form.email || 
                    !form.institutionCode || 
                    !form.password || 
                    !form.course || 
                    !form.semester ||
                    form.password !== form.confirmPassword}
                  className="w-full relative overflow-hidden group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 font-semibold text-white transition-all duration-300 group-hover:from-blue-700 group-hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>CREATING STUDENT ACCOUNT...</span>
                      </>
                    ) : (
                      <>
                        <FaUserGraduate className="w-5 h-5" />
                        <span>REGISTER AS STUDENT</span>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Back Links */}
                <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-4">
                  <button
                    onClick={() => router.push("/register")}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    ← Back to Registration Options
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push("/register/institution")}
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      Create Institution
                    </button>
                    <button
                      onClick={() => router.push("/register/teacher")}
                      className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      Register as Teacher →
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6 py-8"
              >
                {/* Success Icon */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="w-24 h-24 rounded-full bg-gradient-to-r from-green-600 to-emerald-400 flex items-center justify-center mx-auto shadow-lg"
                >
                  <FiCheck className="w-12 h-12 text-white" />
                </motion.div>

                {/* Success Message */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    🎉 STUDENT REGISTERED!
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Welcome to the institution, {form.name}!
                  </p>
                  <div className="mt-2 text-sm text-gray-300 bg-gray-900/40 p-4 rounded-xl max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <p className="text-right text-gray-400">Roll Number:</p>
                      <p className="text-left font-medium font-mono">{registeredStudent?.student?.rollNo || form.rollNo}</p>
                      
                      <p className="text-right text-gray-400">Email:</p>
                      <p className="text-left font-medium">{registeredStudent?.student?.email || form.email}</p>
                      
                      <p className="text-right text-gray-400">Course:</p>
                      <p className="text-left font-medium">{registeredStudent?.student?.course || form.course}</p>
                      
                      <p className="text-right text-gray-400">Semester:</p>
                      <p className="text-left font-medium">Sem {registeredStudent?.student?.semester || form.semester}</p>
                      
                      <p className="text-right text-gray-400">Institution:</p>
                      <p className="text-left font-medium font-mono">{registeredStudent?.student?.institutionCode || form.institutionCode}</p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <p className="text-gray-300 font-semibold">
                    What would you like to do next?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={handleGoToDashboard}
                      className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 hover:border-blue-400 hover:bg-blue-600/10 transition-all flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">Go to Student Dashboard</span>
                      <span className="text-xs mt-2">Start using the attendance system</span>
                    </button>
                    <button
                      onClick={handleLogin}
                      className="p-4 rounded-xl bg-gradient-to-r from-gray-800/20 to-gray-900/20 border border-gray-700/30 text-gray-300 hover:border-gray-600 hover:bg-gray-800/10 transition-all flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">Go to Login</span>
                      <span className="text-xs mt-2">Login with your credentials</span>
                    </button>
                  </div>
                </div>

                {/* Progress Bar for auto-redirect */}
                <div className="pt-4">
                  <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 to-cyan-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "easeInOut" }}
                      onAnimationComplete={() => {
                        if (registeredStudent?.token) {
                          router.push("/student");
                        } else {
                          router.push("/login");
                        }
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Auto-redirecting in 5 seconds...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}