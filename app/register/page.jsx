"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiUser, FiUsers, FiHome, FiArrowRight, FiShield } from "react-icons/fi";
import { RiGovernmentLine } from "react-icons/ri";
import Link from "next/link";

export default function RegisterPage() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const registerOptions = [
    {
      id: "student",
      title: "STUDENT REGISTRATION",
      description: "Join as a student to mark attendance via QR codes",
      icon: <FiUser className="w-8 h-8" />,
      color: "from-blue-500 to-cyan-500",
      route: "/register/student",
      delay: 0.1
    },
    {
      id: "teacher",
      title: "TEACHER REGISTRATION",
      description: "Register as faculty to generate and manage attendance",
      icon: <FiUsers className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      route: "/register/teacher",
      delay: 0.2
    },
    {
      id: "institution",
      title: "INSTITUTION REGISTRATION",
      description: "Create your institution and get unique access code",
      icon: <RiGovernmentLine className="w-8 h-8" />,
      color: "from-orange-500 to-yellow-500",
      route: "/register/institution",
      delay: 0.3
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-950 via-black to-gray-900">
      
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-5xl mx-4"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-200 via-purple-200 to-gray-200 bg-clip-text text-transparent mb-4"
          >
            ACCESS REGISTRATION
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 text-lg tracking-wider"
          >
            // SELECT YOUR REGISTRATION TYPE
          </motion.p>
        </div>

        {/* Registration Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {registerOptions.map((option, index) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: option.delay }}
              onHoverStart={() => setHoveredCard(option.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Link href={option.route}>
                <div className="relative group cursor-pointer">
                  {/* Glow Effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${option.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500`} />

                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-2xl border border-gray-800/50 rounded-3xl p-8 h-full transition-all duration-300 group-hover:border-gray-700">
                    {/* Icon */}
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 bg-gradient-to-r ${option.color} rounded-2xl blur-md opacity-20`} />
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                        {option.icon}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-gray-200 mb-3 tracking-wider">
                      {option.title}
                    </h3>
                    <p className="text-gray-400 text-sm mb-6">
                      {option.description}
                    </p>

                    {/* CTA */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 tracking-widest">
                        CLICK TO REGISTER
                      </span>
                      <motion.div
                        animate={{ x: hoveredCard === option.id ? 5 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiArrowRight className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Back to Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <p className="text-gray-500 mb-4">Already have an account?</p>
          <Link href="/login">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-gray-900 to-black border border-gray-800 text-gray-300 font-semibold tracking-wider hover:border-purple-500/50 transition-all duration-300"
            >
              RETURN TO LOGIN
            </motion.button>
          </Link>
        </motion.div>

        {/* Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-12 flex items-center justify-center gap-4 text-xs text-gray-500 tracking-widest"
        >
          <div className="flex items-center gap-2">
            <FiShield className="w-3 h-3" />
            <span>ENCRYPTED REGISTRATION</span>
          </div>
          <span>•</span>
          <span>DEVICE VERIFIED</span>
          <span>•</span>
          <span>SECURE PROTOCOL</span>
        </motion.div>
      </motion.div>
    </div>
  );
}