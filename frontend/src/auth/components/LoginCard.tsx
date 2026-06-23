type Props = {
  username: string;
  setUsername: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  role: string;
  setRole: (v: string) => void;
  onLogin: () => void;
};

function LoginCard({
  username,
  setUsername,
  password,
  setPassword,
  role,
  setRole,
  onLogin,
}: Props) {
  return (
    <div className="w-[420px] bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/40">

      {/* header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Welcome Back
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Login to TechCare System
        </p>
      </div>

      {/* inputs */}
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
          onClick={onLogin}
          className="w-full py-3 rounded-md font-semibold text-white
           bg-sky-500
           hover:bg-sky-600
           active:scale-[0.98]
           transition shadow-md"
        >
          Login
        </button>
      </div>

      {/* footer */}
      <p className="text-xs text-center text-gray-400 mt-5">
        forgot password? <span className="text-indigo-500 cursor-pointer">Reset</span>
      </p>
    </div>
  );
}

export default LoginCard;