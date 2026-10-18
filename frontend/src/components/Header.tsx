
import { Bell, LogOut } from "lucide-react";
import { useState, type Dispatch, type SetStateAction } from "react";

import UserHeader from "./Header/UserHeader";
import api from "../lib/axios";

type HeaderProps = {
  page: string;
  loading: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  loadData: () => void | Promise<void>;
};

function Header({
  page,
  loading,
  open,
  setOpen,
  loadData,
}: HeaderProps) {
  const role = sessionStorage.getItem("role") ?? "";
  const [logoutStatus, setLogoutStatus] = useState("Logout");
  async function handleLogout() {
    try {
      setLogoutStatus("Logging out...");
      const user = JSON.parse(
        sessionStorage.getItem("user") || "{}",
      );

      if (user.user_id) {
        await api.patch("/api/auth/logout", {
          user_id: user.user_id,
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      sessionStorage.clear();
      window.location.href = "/login";
      setLogoutStatus("Logout");
    }
  }

  return (
    <header className="flex items-center justify-between h-24 gap-4 mb-6 px-6 border-b border-gray-300">
      <div className="flex items-center gap-5 min-w-0">
        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={open ? "Close sidebar" : "Open sidebar"}
          aria-expanded={open}
          className="text-2xl cursor-pointer hover:scale-105 active:scale-95"
        >
          ☰
        </button>

        <div className="flex flex-col min-w-0">
          <h1 className="text-lg font-semibold truncate">
            {page}
          </h1>
          <h2 className="text-sm text-gray-500 capitalize">
            {role}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="bg-sky-500 rounded-lg text-white py-2 px-4 w-28 h-10 text-sm font-medium transition-colors hover:bg-sky-600 active:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Loading..." : "Load Data"}
        </button>

        <button
          type="button"
          aria-label="Notifications"
          className="flex items-center border p-2 rounded-md text-gray-400 border-gray-300 cursor-pointer hover:bg-gray-50"
        >
          <Bell size={20} strokeWidth={1} />
        </button>

        <UserHeader />

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 border border-red-300 text-red-700 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-red-50"
        >
          <LogOut size={18} strokeWidth={1.5} />
          <span>{logoutStatus}</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
