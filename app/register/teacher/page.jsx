"use client";
import API_BASE_URL from "../../api";


import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiUser, FiMail, FiLock, FiBook, FiCheck, FiEye, 
  FiEyeOff, FiKey, FiAlertCircle, FiPhone, FiBriefcase 
} from "react-icons/fi";
import { RiUserSettingsLine } from "react-icons/ri";
import { useRouter } from "next/navigation";
import { FaChalkboardTeacher } from "react-icons/fa";

export default function TeacherRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    teacherId: "",
    email: "",
    subjects: "",
    institutionCode: "",
    password: "",
    confirmPassword: "",
    phone: "",
    department: "",
    designation: "Teacher"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [registeredTeacher, setRegisteredTeacher] = useState(null);

  const departments = [
    "Computer Science", "Electronics", "Mechanical", "Civil",
    "Electrical", "Information Technology", "Mathematics",
    "Physics", "Chemistry", "Biology", "English", "History",
    "Economics", "Commerce", "Physical Education"
  ];

  const designations = [
    "Teacher", "Assistant Professor", "Associate Professor",
    "Professor", "Head of Department", "Principal", "Dean"
  ];

  const submit = async () => {
    setError("");
    
    // Validation
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const requiredFields = ["name", "teacherId", "email", "subjects", "institutionCode", "password", "department"];
    for (const field of requiredFields) {
      if (!form[field]?.trim()) {
        setError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return;
      }
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert subjects string to array
      const subjectsArray = form.subjects
        .split(',')
        .map(subject => subject.trim())
        .filter(subject => subject.length > 0);

      const res = await fetch(
         `${API_BASE_URL}/api/teachers/register`
,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            teacherId: form.teacherId.trim().toUpperCase(),
            email: form.email.toLowerCase().trim(),
            subjects: subjectsArray,
            institutionCode: form.institutionCode.trim().toUpperCase(),
            password: form.password,
            phone: form.phone || "",
            department: form.department,
            designation: form.designation
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

      setRegisteredTeacher(data.data);
      setShowSuccess(true);
      
      // Auto login if token is provided
      if (data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userType", "teacher");
        localStorage.setItem("userId", data.data.teacher?.id);
        localStorage.setItem("institutionCode", data.data.teacher?.institutionCode);
      }

    } catch (error) {
      setError(error.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormChange = (field, value) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  const handleGoToDashboard = () => {
    if (registeredTeacher?.token) {
      router.push("/teacher");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-pink-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-4xl mx-4"
      >
        {/* Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-purple-600/30 rounded-3xl blur-xl opacity-30" />

        <div className="relative bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", duration: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 mb-4 shadow-lg"
            >
              <FaChalkboardTeacher className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent mb-2 tracking-tight">
              TEACHER REGISTRATION
            </h1>
            <p className="text-gray-400 text-sm tracking-wider">
              // JOIN AS FACULTY MEMBER
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
                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      FULL NAME *
                    </label>
                    <div className="relative group">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={form.name}
                        onChange={(e) => handleFormChange("name", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Teacher ID */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      TEACHER ID *
                    </label>
                    <div className="relative group">
                      <RiUserSettingsLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="TCH101"
                        value={form.teacherId}
                        onChange={(e) => handleFormChange("teacherId", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide uppercase"
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
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type="email"
                        placeholder="teacher@institution.com"
                        value={form.email}
                        onChange={(e) => handleFormChange("email", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      PHONE NUMBER (Optional)
                    </label>
                    <div className="relative group">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type="tel"
                        placeholder="+91 9876543210"
                        value={form.phone}
                        onChange={(e) => handleFormChange("phone", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  {/* Department */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      DEPARTMENT *
                    </label>
                    <div className="relative group">
                      <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <select
                        value={form.department}
                        onChange={(e) => handleFormChange("department", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 appearance-none transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      >
                        <option value="">Select Department</option>
                        {departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Designation */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      DESIGNATION *
                    </label>
                    <div className="relative group">
                      <RiUserSettingsLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <select
                        value={form.designation}
                        onChange={(e) => handleFormChange("designation", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 appearance-none transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      >
                        {designations.map(designation => (
                          <option key={designation} value={designation}>{designation}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subjects - Full Width */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      TEACHING SUBJECTS *
                    </label>
                    <div className="relative group">
                      <FiBook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Mathematics, Physics, Chemistry (separate with commas)"
                        value={form.subjects}
                        onChange={(e) => handleFormChange("subjects", e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter subjects separated by commas (e.g., Mathematics, Physics, Chemistry)
                    </p>
                  </div>

                  {/* Institution Code */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      INSTITUTION CODE *
                    </label>
                    <div className="relative group">
                      <FiKey className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type="text"
                        placeholder="INST-XXXXXX"
                        value={form.institutionCode}
                        onChange={(e) => handleFormChange("institutionCode", e.target.value.toUpperCase())}
                        className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide font-mono uppercase"
                        disabled={isSubmitting}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Get this code from your institution administrator
                    </p>
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      PASSWORD *
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a secure password"
                        value={form.password}
                        onChange={(e) => handleFormChange("password", e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
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

                  {/* Confirm Password */}
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm tracking-wider">
                      CONFIRM PASSWORD *
                    </label>
                    <div className="relative group">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={(e) => handleFormChange("confirmPassword", e.target.value)}
                        className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 transition-all duration-300 tracking-wide"
                        disabled={isSubmitting}
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
                    !form.teacherId || 
                    !form.email || 
                    !form.subjects || 
                    !form.institutionCode || 
                    !form.password || 
                    !form.department ||
                    form.password !== form.confirmPassword}
                  className="w-full relative overflow-hidden group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 font-semibold text-white transition-all duration-300 group-hover:from-purple-700 group-hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>REGISTERING TEACHER...</span>
                      </>
                    ) : (
                      <>
                        <FaChalkboardTeacher className="w-5 h-5" />
                        <span>COMPLETE REGISTRATION</span>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Back Links */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4">
                  <button
                    onClick={() => router.push("/register")}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    ← Back to Registration Options
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={() => router.push("/register/institution")}
                      className="text-sm text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Create Institution
                    </button>
                    <button
                      onClick={() => router.push("/register/student")}
                      className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Register as Student →
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
                    🎉 TEACHER REGISTERED!
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Welcome to the faculty, {form.name}!
                  </p>
                  <div className="mt-2 text-sm text-gray-300 bg-gray-900/40 p-4 rounded-xl max-w-md mx-auto">
                    <div className="grid grid-cols-2 gap-2 text-left">
                      <p className="text-right text-gray-400">Teacher ID:</p>
                      <p className="text-left font-medium font-mono">{registeredTeacher?.teacher?.teacherId || form.teacherId}</p>
                      
                      <p className="text-right text-gray-400">Email:</p>
                      <p className="text-left font-medium">{registeredTeacher?.teacher?.email || form.email}</p>
                      
                      <p className="text-right text-gray-400">Department:</p>
                      <p className="text-left font-medium">{registeredTeacher?.teacher?.department || form.department}</p>
                      
                      <p className="text-right text-gray-400">Designation:</p>
                      <p className="text-left font-medium">{registeredTeacher?.teacher?.designation || form.designation}</p>
                      
                      <p className="text-right text-gray-400">Institution:</p>
                      <p className="text-left font-medium font-mono">{registeredTeacher?.teacher?.institutionCode || form.institutionCode}</p>
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
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-600/10 transition-all flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">Go to Teacher Dashboard</span>
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
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "easeInOut" }}
                      onAnimationComplete={() => {
                        if (registeredTeacher?.token) {
                          router.push("/teacher");
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