import { useState } from "react";
import axios from "axios";
import LoginCard from "./components/LoginCard";

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const login = async () => {
    if (!username || !password || !role) {
      alert("Please fill in all fields.");
      return;
    }
    await axios.post("/api/products", {
      username,
      password,
      role,
    });
  };

  return (
    <div className="min-h-screen flex">


      <div className="hidden md:flex w-1/2 relative items-center justify-center p-10 text-white">

        {/* background image */}
        <img
          src="../../assets/image.png"
          alt="TechCare"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* content on top */}
        <div className="relative z-10 text-center">
          <h1 className="text-4xl font-bold mb-4">TechCare System</h1>
          <p className="text-white/80">
            Secure hospital management platform for doctors, staff, and patients.
          </p>
        </div>

      </div>

      {/* RIGHT SIDE (login area) */}
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-100">
        <LoginCard
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          role={role}
          setRole={setRole}
          onLogin={login}
        />
      </div>

    </div>
  );
}

export default LoginPage;