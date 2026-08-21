import { ChevronDown } from "lucide-react";

function UserHeader() {
  const storedUser = sessionStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  return (
    <div className="flex items-center gap-3 border-l border-gray-300 px-2">
      <img
        src={user?.profile_photo || "/assets/images.jpg"}
        alt="Profile"
        className="w-12 h-12 rounded-full border"
      />

      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">
          {user?.first_name}{" "}
          {user?.middle_name ? `${user.middle_name} ` : ""}
          {user?.last_name}
        </h1>

        <h2 className="text-gray-500">
          {user?.email}
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