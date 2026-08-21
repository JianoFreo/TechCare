import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import api from "../lib/axios";
import LeftSideBackground from "./components/LeftSideBackground";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const triggerServerWakeUp = async () => {
      try {
        const response = await api.get('/api/test/ping');
        if (response.data.message) {
          console.log('Server is awake and responding.');
        } else {
          console.error('Server responded with an error:', response.status);
        }
      } catch (error) {
        console.error('Error while trying to wake up the server:', error);
      }
    };
    triggerServerWakeUp();
  }, []);
const login = async () => {
  if (!username || !password) {
    alert("Please fill in all fields.");
    return;
  }

  setLoading(true);

  try {
    const response = await api.post("/api/auth/login", {
      username,
      password,
    });

    console.log("RESPONSE:", response);
    console.log("DATA:", response.data);

    if (response.data.message !== "Login successful") {
      alert(response.data.message);
      return;
    }

    const token = response.data.token;
    const role = response.data.user.role;
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    navigate(`/${role}`);
  } catch (error) {
    console.error("ACTUAL ERROR:", error);
    alert("Login failed.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      <LeftSideBackground />
      <div className="w-full md:w-1/2 flex items-center justify-center ">
        <div className="w-105 border-2 p-10">
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
              className="w-full  p-3 border-2 rounded"
            />

            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full  p-3 border-2 rounded"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-sm hover:underline"
            >
              {showPassword ? "Hide Password" : "Show Password"}
            </button>
            <button
              onClick={login}
              className="w-full bg-gray-200 p-3 rounded hover:bg-gray-300 cursor-pointer"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="text-xs text-center text-gray-400 mt-5">
            forgot password?{" "}
            <span className="text-indigo-500 cursor-pointer">
              Send a request
            </span>
          </p>
          {/* <p className="text-xs text-center text-gray-400 mt-5">
            No account yet? {" "}
            <span className="text-indigo-500 cursor-pointer" onClick={() =>navigate("/sign-up")}>
              Sign Up
            </span>
          </p> */}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;