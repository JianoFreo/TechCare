import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router";

function UserHeader() {
  const navigate = useNavigate();

  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
      >
        Login
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3 border-l border-gray-300 px-2">
      <img
        src={user?.profile_photo || "/assets/images.jpg"}
        alt="profile"
        className="w-12 h-12 rounded-full border"
      />

      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">
          {user.first_name}{" "}
          {user.middle_name ? `${user.middle_name} ` : ""}
          {user.last_name}
        </h1>

        <h2 className="text-gray-500">
          {user.email}
        </h2>
      </div>

      <ChevronDown
        size={20}
        strokeWidth={1}
        className="cursor-pointer"
      />
    </div>
  );
}

export default UserHeader;