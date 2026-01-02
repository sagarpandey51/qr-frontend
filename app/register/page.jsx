"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiUser, FiUsers, FiArrowRight, FiShield } from "react-icons/fi";
import { RiGovernmentLine } from "react-icons/ri";

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
      delay: 0.1,
    },
    {
      id: "teacher",
      title: "TEACHER REGISTRATION",
      description: "Register as faculty to manage attendance",
      icon: <FiUsers className="w-8 h-8" />,
      color: "from-purple-500 to-pink-500",
      route: "/register/teacher",
      delay: 0.2,
    },
    {
      id: "institution",
      title: "INSTITUTION REGISTRATION",
      description: "Create your institution and get access code",
      icon: <RiGovernmentLine className="w-8 h-8" />,
      color: "from-orange-500 to-yellow-500",
      route: "/register/institution",
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-black to-gray-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-5xl"
      >
        {/* HEADER */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
            CREATE ACCOUNT
          </h1>
          <p className="text-gray-400 tracking-wider">
            SELECT REGISTRATION TYPE
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {registerOptions.map((option) => (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: option.delay }}
              onHoverStart={() => setHoveredCard(option.id)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Link href={option.route}>
                <div className="relative cursor-pointer group">
                  {/* Glow */}
                  <div
                    className={`absolute -inset-0.5 bg-gradient-to-r ${option.color} rounded-3xl blur-xl opacity-0 group-hover:opacity-40 transition`}
                  />

                  {/* Card */}
                  <div className="relative bg-gray-900/70 border border-gray-800 rounded-3xl p-8 h-full">
                    <div
                      className={`w-16 h-16 mb-6 rounded-2xl bg-gradient-to-r ${option.color} flex items-center justify-center`}
                    >
                      {option.icon}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-gray-400 mb-6 text-sm">
                      {option.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 tracking-widest">
                        REGISTER
                      </span>
                      <FiArrowRight
                        className={`w-5 h-5 text-gray-400 transition ${
                          hoveredCard === option.id ? "translate-x-1" : ""
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* BACK TO LOGIN */}
        <div className="text-center mt-12">
          <p className="text-gray-400 mb-4">Already have an account?</p>
          <Link href="/login">
            <button className="px-8 py-3 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:border-purple-500 transition">
              BACK TO LOGIN
            </button>
          </Link>
        </div>

        {/* FOOTER */}
        <div className="mt-10 flex justify-center items-center gap-2 text-xs text-gray-500 tracking-widest">
          <FiShield className="w-3 h-3" />
          <span>SECURE REGISTRATION</span>
        </div>
      </motion.div>
    </div>
  );
}
