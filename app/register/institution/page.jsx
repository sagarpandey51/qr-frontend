"use client";
import API_BASE_URL from "../api";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiHome, FiCheck, FiShield, FiCopy, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser, FiPhone, FiGlobe } from "react-icons/fi";
import { RiGovernmentLine } from "react-icons/ri";
import { useRouter } from "next/navigation";

export default function InstitutionRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    type: "school",
    address: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institutionCode, setInstitutionCode] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [error, setError] = useState("");
  const [successData, setSuccessData] = useState(null);

  const institutionTypes = [
    { value: "school", label: "School" },
    { value: "college", label: "College" },
    { value: "coaching", label: "Coaching Center" },
    { value: "university", label: "University" }
  ];

  // Generate random institution code on component mount
  useEffect(() => {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setGeneratedCode(`INST-${code}`);
    };
    
    generateCode();
  }, []);

  // Regenerate code function
  const regenerateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(`INST-${code}`);
  };

  const submit = async () => {
    setError("");
    
    // Validation
    if (!form.name.trim()) {
      setError("Please enter institution name");
      return;
    }
    
    if (!form.email.trim()) {
      setError("Please enter email address");
      return;
    }
    
    if (!form.password.trim()) {
      setError("Please enter password");
      return;
    }
    
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
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
      const res = await fetch(
        `${API_BASE_URL}/api/auth/institution/register`
,
        {
          method: "POST",
          headers: { 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({ 
            name: form.name.trim(),
            email: form.email.toLowerCase().trim(),
            password: form.password,
            type: form.type,
            address: form.address,
            phone: form.phone
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

      // Save the data from response
      setSuccessData(data.data);
      setInstitutionCode(data.data.institution?.institutionCode || generatedCode);
      setShowSuccess(true);
      
      // Also save token for immediate login if needed
      if (data.data.token) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("userType", "institution");
        localStorage.setItem("userId", data.data.institution?.id);
        localStorage.setItem("institutionCode", data.data.institution?.institutionCode);
      }

    } catch (error) {
      setError(error.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(institutionCode || generatedCode);
    alert("Institution code copied to clipboard!");
  };

  const handleContinue = () => {
    router.push("/register/teacher");
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
    if (successData?.token) {
      router.push("/admin");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-orange-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-yellow-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-2xl mx-4"
      >
        {/* Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-600/30 via-yellow-600/30 to-orange-600/30 rounded-3xl blur-xl opacity-30" />

        <div className="relative bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", duration: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 to-yellow-500 mb-4 shadow-lg"
            >
              <RiGovernmentLine className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-300 bg-clip-text text-transparent mb-2 tracking-tight">
              INSTITUTION REGISTRATION
            </h1>
            <p className="text-gray-400 text-sm tracking-wider">
              // CREATE YOUR INSTITUTION PROFILE
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
                {/* Institution Name */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    INSTITUTION NAME *
                  </label>
                  <div className="relative group">
                    <FiHome className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Enter institution name"
                      value={form.name}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all duration-300 tracking-wide"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    ADMIN EMAIL *
                  </label>
                  <div className="relative group">
                    <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors w-5 h-5" />
                    <input
                      type="email"
                      placeholder="admin@institution.com"
                      value={form.email}
                      onChange={(e) => handleFormChange("email", e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all duration-300 tracking-wide"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Institution Type */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    INSTITUTION TYPE *
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors">
                      <RiGovernmentLine className="w-5 h-5" />
                    </div>
                    <select
                      value={form.type}
                      onChange={(e) => handleFormChange("type", e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 appearance-none transition-all duration-300 tracking-wide"
                      disabled={isSubmitting}
                    >
                      {institutionTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Phone (Optional) */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    CONTACT PHONE (Optional)
                  </label>
                  <div className="relative group">
                    <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors w-5 h-5" />
                    <input
                      type="tel"
                      placeholder="+91 9876543210"
                      value={form.phone}
                      onChange={(e) => handleFormChange("phone", e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all duration-300 tracking-wide"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Address (Optional) */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    ADDRESS (Optional)
                  </label>
                  <div className="relative group">
                    <FiHome className="absolute left-4 top-3 text-gray-500 group-focus-within:text-orange-400 transition-colors w-5 h-5" />
                    <textarea
                      placeholder="Enter institution address"
                      value={form.address}
                      onChange={(e) => handleFormChange("address", e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all duration-300 tracking-wide min-h-[100px] resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-gray-300 text-sm tracking-wider">
                    ADMIN PASSWORD *
                  </label>
                  <div className="relative group">
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors w-5 h-5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Create admin password"
                      value={form.password}
                      onChange={(e) => handleFormChange("password", e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all duration-300 tracking-wide"
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
                    <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange-400 transition-colors w-5 h-5" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm admin password"
                      value={form.confirmPassword}
                      onChange={(e) => handleFormChange("confirmPassword", e.target.value)}
                      className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all duration-300 tracking-wide"
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

                {/* Generated Code Display */}
                <div className="p-4 rounded-xl bg-gray-900/30 border border-gray-800/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                      <FiShield className="w-4 h-4 text-yellow-400" />
                      YOUR INSTITUTION CODE
                    </h3>
                    <button
                      onClick={regenerateCode}
                      className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                      disabled={isSubmitting}
                    >
                      Regenerate
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <code className="text-lg font-bold text-white font-mono tracking-wider bg-black/40 px-4 py-2 rounded-lg flex-1 text-center">
                      {generatedCode}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        navigator.clipboard.writeText(generatedCode);
                        alert("Code copied to clipboard!");
                      }}
                      className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                      title="Copy to clipboard"
                      disabled={isSubmitting}
                    >
                      <FiCopy className="w-4 h-4 text-gray-300" />
                    </motion.button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    • This code will be generated automatically on registration
                    <br />
                    • Share with teachers and students for their registration
                    <br />
                    • Free Tier: Up to 5 teachers and 100 students
                  </p>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={submit}
                  disabled={isSubmitting || !form.name || !form.email || !form.password || form.password !== form.confirmPassword}
                  className="w-full relative overflow-hidden group"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                  
                  <div className="relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-yellow-600 font-semibold text-white transition-all duration-300 group-hover:from-orange-700 group-hover:to-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isSubmitting ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span>CREATING INSTITUTION...</span>
                      </>
                    ) : (
                      <>
                        <RiGovernmentLine className="w-5 h-5" />
                        <span>REGISTER INSTITUTION</span>
                      </>
                    )}
                  </div>
                </motion.button>

                {/* Back Link */}
                <div className="text-center">
                  <button
                    onClick={() => router.push("/register")}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    ← Back to Registration Options
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center space-y-6"
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
                    🎉 REGISTRATION SUCCESSFUL!
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Your institution has been registered successfully
                  </p>
                  <div className="mt-2 text-sm text-gray-300 bg-gray-900/40 p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-2">
                      <p className="text-right text-gray-400">Institution:</p>
                      <p className="text-left font-medium">{successData?.institution?.name || form.name}</p>
                      
                      <p className="text-right text-gray-400">Email:</p>
                      <p className="text-left font-medium">{successData?.institution?.email || form.email}</p>
                      
                      <p className="text-right text-gray-400">Type:</p>
                      <p className="text-left font-medium capitalize">{successData?.institution?.type || form.type}</p>
                      
                      <p className="text-right text-gray-400">Subscription:</p>
                      <p className="text-left font-medium text-green-400">FREE TIER ACTIVE</p>
                    </div>
                  </div>
                </div>

                {/* Institution Code */}
                <div className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <FiShield className="w-5 h-5 text-yellow-400" />
                    <p className="text-gray-300 text-sm">YOUR INSTITUTION CODE</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <code className="text-2xl font-bold text-white font-mono tracking-wider bg-black/30 px-4 py-3 rounded-lg">
                      {institutionCode}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyToClipboard}
                      className="p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      <FiCopy className="w-5 h-5 text-gray-300" />
                    </motion.button>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-yellow-900/20 border border-yellow-500/30">
                    <p className="text-xs text-yellow-300">
                      ⚠️ <span className="font-semibold">Important:</span> Save this code securely. 
                      Teachers and students need this to register.
                    </p>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="space-y-4">
                  <p className="text-gray-300 font-semibold">
                    What would you like to do next?
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={handleContinue}
                      className="p-4 rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:bg-purple-600/10 transition-all flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">Register Teachers</span>
                      <span className="text-xs mt-2">Add teaching faculty to your institution</span>
                    </button>
                    <button
                      onClick={handleGoToDashboard}
                      className="p-4 rounded-xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 text-green-300 hover:border-green-400 hover:bg-green-600/10 transition-all flex flex-col items-center justify-center"
                    >
                      <span className="font-semibold">Go to Dashboard</span>
                      <span className="text-xs mt-2">Manage your institution settings</span>
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={handleContinue}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/20 transition-all flex-1"
                  >
                    CONTINUE TO TEACHER REGISTRATION
                  </button>
                  <button
                    onClick={handleLogin}
                    className="px-6 py-3 rounded-xl bg-gray-800 text-gray-300 border border-gray-700 hover:border-gray-600 transition-all flex-1"
                  >
                    GO TO LOGIN
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}