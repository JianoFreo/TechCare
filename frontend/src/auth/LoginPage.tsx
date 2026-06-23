import { useState } from "react";
import axios from "axios";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const login = async () => {
    try {
      if (!username || !password || !role) {
        alert("Please fill in all fields");
        return;
      }

      await axios.post("/api/products", {
        username,
        password,
        role,
      });
    } catch (error) {
      console.error("Error uploading product:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md space-y-4">
        
        <h1 className="text-2xl font-bold text-center">Login</h1>

        <div>
          <p className="mb-1 text-sm font-medium">Username</p>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Password</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <p className="mb-1 text-sm font-medium">Role</p>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="patient">Patient</option>
            <option value="front-desk-staff">Front Desk Staff</option>
            <option value="laboratory-staff">Laboratory staff</option>
          </select>
        </div>

        <button
          onClick={login}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default LoginPage;