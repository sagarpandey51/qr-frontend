"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import API_BASE_URL from "../api";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/${role}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      localStorage.setItem("token", data.data.token);
      localStorage.setItem("userId", data.data.user._id);
      localStorage.setItem("userType", role);
      localStorage.setItem("institutionCode", data.data.user.institutionCode);

      router.push(`/${role}/dashboard`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <form
        onSubmit={handleLogin}
        className="bg-gray-900 p-6 rounded-xl w-80"
      >
        <h2 className="text-xl text-white font-bold mb-4 text-center">
          Login
        </h2>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="institution">Institution</option>
        </select>

        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 mb-2 rounded bg-gray-800 text-white"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-3 rounded bg-gray-800 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-red-400 text-sm mb-2">{error}</p>
        )}

        <button
          disabled={loading}
          className="w-full bg-purple-600 py-2 rounded text-white"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}
