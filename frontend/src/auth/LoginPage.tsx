import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import LeftSideBackground from "./components/LeftSideBackground";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const login = async () => {
    if (!username || !password) {
      alert("Please fill in all fields.");
      return;
    }

    try {
     const response = await axios.post("/api/auth/login", {
        username,
        password,
      });
      if (!response.data) {
        alert("Login failed. Please check your credentials.");
        setUsername("");
        setPassword("");}
      else{
      navigate(`/${response.data}`);
      }
    } catch {
      alert("Login failed. Please check your credentials.",);
      setUsername("");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex">
      <LeftSideBackground />

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <div className="w-[420px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              Welcome Back
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Login to TechCare System
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
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200
             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
             outline-none transition"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm text-indigo-500 hover:text-indigo-600"
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
            <button
              onClick={login}
              className="w-full py-3 rounded-md font-semibold text-white
                         bg-sky-500 hover:bg-sky-600
                         active:scale-[0.98]
                         transition shadow-md"
            >
              Login
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-5">
            forgot password?{" "}
            <span className="text-indigo-500 cursor-pointer">
              Reset
            </span>
          </p>
          <p className="text-xs text-center text-gray-400 mt-5">
            No account yet? {" "}
            <span className="text-indigo-500 cursor-pointer" onClick={() =>navigate("/sign-up")}>
              Sign Up
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;