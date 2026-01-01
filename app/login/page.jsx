"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiCheck, FiKey, FiUserPlus, FiAlertCircle } from "react-icons/fi";
import { RiFingerprintLine } from "react-icons/ri";
import { TbLockAccess } from "react-icons/tb";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institutionCode, setInstitutionCode] = useState("");
  const [userType, setUserType] = useState("student"); // "student", "teacher", "institution"
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ 
    email: false, 
    password: false, 
    institutionCode: false 
  });
  const [error, setError] = useState("");
  const [particles, setParticles] = useState([]);
  const router = useRouter();

  // Generate floating cyber particles
  useEffect(() => {
    const particlesArray = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
    }));
    setParticles(particlesArray);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (userType !== "institution" && !institutionCode) {
      setError("Institution code is required for students and teachers");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      let endpoint = "";
      let payload = {};

      // Determine API endpoint based on user type
      switch (userType) {
        case "institution":
          endpoint = "http://localhost:5000/api/auth/institution/login";
          payload = { email, password };
          break;
        case "teacher":
          endpoint = "http://localhost:5000/api/auth/teacher/login";
          payload = { email, password, institutionCode };
          break;
        case "student":
          endpoint = "http://localhost:5000/api/auth/student/login";
          payload = { email, password, institutionCode };
          break;
        default:
          throw new Error("Invalid user type");
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (!data.success) {
        throw new Error(data.message || "Authentication failed");
      }

      // ✅ Save auth data
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userType", userType);
      localStorage.setItem("userId", data.data[userType]?.id || "");
      localStorage.setItem("institutionCode", data.data[userType]?.institutionCode || "");
      localStorage.setItem("userData", JSON.stringify(data.data[userType] || {}));

      // Show success animation
      setTimeout(() => {
        // Redirect based on user type
        switch (userType) {
          case "institution":
            router.push("/admin");
            break;
          case "teacher":
            router.push("/teacher");
            break;
          case "student":
            router.push("/student");
            break;
          default:
            router.push("/");
        }
      }, 1500);

    } catch (error) {
      setError(error.message || "Server error. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && email && password) {
      if (userType === "institution" || institutionCode) {
        handleLogin();
      }
    }
  };

  // Clear error when user starts typing
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleInstitutionCodeChange = (e) => {
    setInstitutionCode(e.target.value.toUpperCase());
    if (error) setError("");
  };

  const handleUserTypeChange = (type) => {
    setUserType(type);
    setError("");
    // Clear institution code when switching to institution
    if (type === "institution") {
      setInstitutionCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900">
      
      {/* --- DARK AESTHETIC BACKGROUND --- */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        
        {/* Animated Grid Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.1),transparent_50%)]" />
        
        {/* Floating Cyber Particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10"
            style={{
              left: `${particle.x}vw`,
              top: `${particle.y}vh`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.sin(particle.id) * 50, 0],
              opacity: [0, 0.3, 0],
            }}
            transition={{
              duration: 8 + Math.random() * 10,
              repeat: Infinity,
              delay: particle.id * 0.2,
              ease: "linear",
            }}
          />
        ))}

        {/* Dark Nebula Effects */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            background: [
              "radial-gradient(circle at 20% 30%, rgba(88, 28, 135, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 70%, rgba(88, 28, 135, 0.15) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 30%, rgba(88, 28, 135, 0.15) 0%, transparent 50%)",
            ],
          }}
          transition={{ duration: 20, repeat: Infinity }}
        />

        {/* Cyber Scan Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_95%,rgba(64,224,208,0.03)_100%)] bg-[length:100%_4px]" />
        
        {/* Glowing Orbs */}
        <motion.div
          className="absolute top-1/4 -left-48 w-[600px] h-[600px] rounded-full"
          animate={{
            background: [
              "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        
        <motion.div
          className="absolute -bottom-48 -right-48 w-[500px] h-[500px] rounded-full"
          animate={{
            background: [
              "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
              "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            ],
            scale: [1.2, 1, 1.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        />
      </div>

      {/* --- DARK CYBER LOGIN CARD --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Outer Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600/30 via-blue-600/30 to-purple-600/30 rounded-3xl blur-xl opacity-50" />

        <div className="relative bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 shadow-2xl overflow-hidden">
          
          {/* Animated Border Glow */}
          <motion.div
            className="absolute inset-0 rounded-3xl border border-transparent"
            animate={{
              borderImage: [
                "linear-gradient(45deg, rgba(124,58,237,0.3), rgba(59,130,246,0.3), rgba(124,58,237,0.3)) 1",
                "linear-gradient(45deg, rgba(59,130,246,0.3), rgba(124,58,237,0.3), rgba(59,130,246,0.3)) 1",
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Header with Cyber Animation */}
          <div className="text-center mb-10 relative">
            {/* Animated Background Icon */}
            <motion.div 
              animate={{ 
                rotate: 360,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity }
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 opacity-10"
            >
              <RiFingerprintLine className="w-full h-full text-purple-400" />
            </motion.div>

            {/* Main Icon */}
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 group"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 to-blue-600/30 rounded-2xl blur-md" />
              <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-500/10">
                <TbLockAccess className="w-8 h-8 text-purple-400" />
              </div>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl font-bold bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 bg-clip-text text-transparent mb-2 tracking-tight"
            >
              ACCESS CONTROL
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-400 text-sm tracking-wider"
            >
              // ENTER CREDENTIALS FOR VERIFICATION
            </motion.p>
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

          {/* User Type Selector - FIXED VERSION */}
          <div className="mb-6">
            <p className="text-gray-400 text-sm mb-3 tracking-wide">// SELECT USER TYPE</p>
            <div className="grid grid-cols-3 gap-2">
              {["student", "teacher", "institution"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleUserTypeChange(type)}
                  className={`relative py-3 rounded-lg text-sm font-medium tracking-wider transition-all duration-300 cursor-pointer border ${
                    userType === type
                      ? type === "institution"
                        ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 border-purple-500/50 text-white shadow-lg shadow-purple-500/20"
                        : type === "teacher"
                        ? "bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-500/50 text-white shadow-lg shadow-green-500/20"
                        : "bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border-blue-500/50 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-900/40 border-gray-800 text-gray-400 hover:text-gray-300 hover:border-gray-700 hover:bg-gray-800/40"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <motion.div 
              animate={{ 
                borderColor: isFocused.email ? "rgba(124,58,237,0.5)" : "rgba(255,255,255,0.1)",
                boxShadow: isFocused.email ? "0 0 20px rgba(124,58,237,0.2)" : "none"
              }}
              className="relative group"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <FiMail className={`w-5 h-5 transition-colors duration-300 ${isFocused.email ? "text-purple-400" : "text-gray-500"}`} />
              </div>
              <input
                type="email"
                placeholder="USER@DOMAIN.COM"
                value={email}
                onChange={handleEmailChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(prev => ({...prev, email: true}))}
                onBlur={() => setIsFocused(prev => ({...prev, email: false}))}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 tracking-wide"
              />
              <AnimatePresence>
                {email && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute right-4 top-1/2 -translate-y-1/2"
                  >
                    <FiCheck className="w-5 h-5 text-green-400" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Password Field */}
            <motion.div 
              animate={{ 
                borderColor: isFocused.password ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)",
                boxShadow: isFocused.password ? "0 0 20px rgba(59,130,246,0.2)" : "none"
              }}
              className="relative group"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <FiKey className={`w-5 h-5 transition-colors duration-300 ${isFocused.password ? "text-blue-400" : "text-gray-500"}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={handlePasswordChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(prev => ({...prev, password: true}))}
                onBlur={() => setIsFocused(prev => ({...prev, password: false}))}
                className="w-full pl-12 pr-12 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 tracking-wider"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
              >
                {showPassword ? 
                  <FiEyeOff className="w-4 h-4 text-gray-400" /> : 
                  <FiEye className="w-4 h-4 text-gray-400" />
                }
              </button>
            </motion.div>

            {/* Institution Code (for students & teachers) */}
            {userType !== "institution" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ 
                  borderColor: isFocused.institutionCode ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.1)",
                  boxShadow: isFocused.institutionCode ? "0 0 20px rgba(59,130,246,0.2)" : "none"
                }}
                className="relative group"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <span className="text-xs text-gray-500 font-mono">INST</span>
                  </div>
                </div>
                <input
                  type="text"
                  placeholder="INST-XXXXXX"
                  value={institutionCode}
                  onChange={handleInstitutionCodeChange}
                  onKeyPress={handleKeyPress}
                  onFocus={() => setIsFocused(prev => ({...prev, institutionCode: true}))}
                  onBlur={() => setIsFocused(prev => ({...prev, institutionCode: false}))}
                  className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-900/40 border border-gray-800 text-gray-200 placeholder-gray-500 outline-none transition-all duration-300 tracking-wide font-mono uppercase"
                />
                <AnimatePresence>
                  {institutionCode && institutionCode.startsWith('INST-') && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-4 top-1/2 -translate-y-1/2"
                    >
                      <FiCheck className="w-5 h-5 text-green-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* Security Status */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2 text-gray-400">
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-green-500/20 rounded-full blur-sm"
                  />
                  <FiShield className="w-4 h-4 text-green-400 relative" />
                </div>
                <span className="tracking-wide">SECURE CONNECTION</span>
              </div>
              <span className="px-2 py-1 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-gray-300 text-[10px] tracking-widest">
                {userType.toUpperCase()}
              </span>
            </motion.div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoading || !email || !password || (userType !== "institution" && !institutionCode)}
              className="w-full relative overflow-hidden group"
            >
              {/* Glow Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"
              />
              
              {/* Button Content */}
              <div className={`relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                userType === "institution" 
                  ? "bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 text-gray-200 group-hover:border-purple-500/50"
                  : userType === "teacher"
                  ? "bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 text-gray-200 group-hover:border-green-500/50"
                  : "bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-500/30 text-gray-200 group-hover:border-blue-500/50"
              }`}>
                <motion.div
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
                >
                  <RiFingerprintLine className="w-5 h-5" />
                </motion.div>
                <span className="tracking-wider">
                  {isLoading ? "VERIFYING IDENTITY..." : `LOGIN AS ${userType.toUpperCase()}`}
                </span>
              </div>

              {/* Scan Animation */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/10 to-transparent rounded-xl"
                initial={{ x: "-100%" }}
                animate={isLoading ? { x: "100%" } : {}}
                transition={isLoading ? { duration: 2, repeat: Infinity } : {}}
              />
            </motion.button>

            {/* Register Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="pt-4 border-t border-gray-800/30"
            >
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-4 tracking-wide">
                  // NEW TO THE SYSTEM?
                </p>
                
                <Link href="/register">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full relative overflow-hidden group"
                  >
                    {/* Outer Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gray-700/30 via-gray-600/30 to-gray-700/30 rounded-xl blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                    
                    {/* Button Content */}
                    <div className="relative flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-700 text-gray-300 font-medium tracking-wider transition-all duration-300 group-hover:border-gray-600 group-hover:text-gray-200">
                      <FiUserPlus className="w-5 h-5" />
                      <span>CREATE NEW ACCOUNT</span>
                    </div>

                    {/* Hover Animation */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/10 to-transparent rounded-xl"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.8 }}
                    />
                  </motion.button>
                </Link>

                {/* Registration Options Hint */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-xs text-gray-500 mt-3"
                >
                  Choose from: Institution • Teacher • Student registration
                </motion.p>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-6 border-t border-gray-800/50"
          >
            <div className="flex items-center justify-center gap-3 text-[10px] text-gray-500 tracking-widest">
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span>SYSTEM: ONLINE</span>
              </div>
              <span className="text-gray-700">•</span>
              <span>v2.7.1</span>
              <span className="text-gray-700">•</span>
              <span>QR ATTENDANCE SYSTEM</span>
            </div>
            
            {/* Quick Links */}
            <div className="flex justify-center gap-4 mt-3">
              <Link 
                href="/register/institution" 
                className="text-[10px] text-orange-400 hover:text-orange-300 transition-colors tracking-wider"
              >
                INSTITUTION
              </Link>
              <Link 
                href="/register/teacher" 
                className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors tracking-wider"
              >
                TEACHER
              </Link>
              <Link 
                href="/register/student" 
                className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors tracking-wider"
              >
                STUDENT
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* --- AUTHENTICATION OVERLAY --- */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }} 
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 10, opacity: 0 }}
              className="relative bg-gradient-to-br from-gray-900 to-black border border-gray-800 p-10 rounded-3xl text-center max-w-sm"
            >
              {/* Orbital Animation */}
              <motion.div 
                className="absolute inset-8 border border-purple-500/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              />
              
              <div className="relative">
                {/* Spinning Icon */}
                <motion.div
                  animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                  transition={{ 
                    rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                  className="w-20 h-20 mx-auto mb-6 relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-full blur-md" />
                  <div className="relative w-16 h-16 rounded-full bg-gray-900 border border-purple-500/30 flex items-center justify-center mx-auto">
                    <RiFingerprintLine className="w-10 h-10 text-purple-400" />
                  </div>
                </motion.div>

                <h3 className="text-xl font-bold text-gray-200 mb-2 tracking-wider">AUTHENTICATING</h3>
                <p className="text-gray-400 text-sm mb-6 tracking-wide">
                  // VERIFYING {userType.toUpperCase()} CREDENTIALS
                </p>

                {/* Progress Bar */}
                <div className="w-48 h-1 bg-gray-800 rounded-full overflow-hidden mx-auto">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.8, ease: "easeInOut" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DEBUG INFO (optional) --- */}
      <div className="absolute bottom-4 right-4 text-[8px] text-gray-600 tracking-widest opacity-30">
        QR_ATTENDANCE_SYSTEM v2.0 MADE BY SAGAR
      </div>
    </div>
  ); 
}