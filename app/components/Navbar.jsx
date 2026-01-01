"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [role, setRole] = useState(null);
  const [isClient, setIsClient] = useState(false);

  // This runs only on the client side
  useEffect(() => {
    setIsClient(true);
    const userRole = localStorage.getItem("role");
    setRole(userRole);
  }, []);

  const logout = () => {
    localStorage.clear();
    setRole(null);
    router.push("/login");
  };

  // Show loading state during SSR or before client-side hydration
  if (!isClient) {
    return (
      <nav className="flex justify-between items-center px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
        <h1 className="text-xl font-bold text-indigo-400">
          QR Attendance
        </h1>
        <div className="flex gap-6 items-center">
          <Link href="/login">Login</Link>
        </div>
      </nav>
    );
  }

  return (
    <nav className="flex justify-between items-center px-4 sm:px-8 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
      <Link href="/" className="text-xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
        QR Attendance
      </Link>

      <div className="flex gap-4 sm:gap-6 items-center">
        {!role ? (
          <Link href="/login" className="text-white hover:text-indigo-300 transition-colors">
            Login
          </Link>
        ) : (
          <>
            {role === "teacher" && (
              <Link href="/teacher" className="text-white hover:text-indigo-300 transition-colors">
                Teacher Dashboard
              </Link>
            )}
            {role === "student" && (
              <Link href="/student" className="text-white hover:text-indigo-300 transition-colors">
                Student Portal
              </Link>
            )}
            {role === "admin" && (
              <Link href="/report" className="text-white hover:text-indigo-300 transition-colors">
                Admin Reports
              </Link>
            )}
            
            <button
              onClick={logout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}