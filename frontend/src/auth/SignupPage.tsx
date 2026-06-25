import { useState } from "react";
import LeftSideBackground from "./components/LeftSideBackground";
import axios from "axios";

function SignupPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const signup = async () => {
    if (!username || !password || !role) {
      alert("Please fill in all fields.");
      return;
    }

    await axios.post("/api/signup", {
      username,
      password,
      role,
    });
  };

  return (
    <div className="min-h-screen flex">
      <LeftSideBackground />

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="w-[420px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Create Account
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Sign up to get started
            </p>
          </div>

          <div className="space-y-4">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                         outline-none transition"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                         outline-none transition"
            />

            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                         outline-none transition bg-white"
            >
              <option value="">Select Role</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
              <option value="front_desk">Front Desk Staff</option>
            </select>

            <button
              onClick={signup}
              className="w-full py-3 rounded-md font-semibold text-white
                         bg-sky-500 hover:bg-sky-600
                         active:scale-[0.98]
                         transition shadow-md"
            >
              Sign Up
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-5">
            forgot password?{" "}
            <span className="text-indigo-500 cursor-pointer">
              Reset
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;