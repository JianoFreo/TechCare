import type { User } from "../../../../interface/User";
import { Phone } from "lucide-react";

function UserCard({ user }: { user: User }) {
  const fullName = [
    user.first_name,
    user.middle_name,
    user.last_name,
    user.suffix,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = `${user.first_name?.charAt(0) || ""}${
    user.last_name?.charAt(0) || ""
  }`;

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-2 shadow-md">
      {/* Profile Image */}
      <div className="relative h-64 w-full overflow-hidden rounded-[1.4rem] bg-gray-100">
        {user.profile_photo ? (
          <img
            src={user.profile_photo}
            alt={fullName}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-5xl font-semibold text-gray-500">
            {initials}
          </div>
        )}

        {/* Online / Active indicator */}
        {!user.deleted && (
          <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
            <div className="h-3 w-3 rounded-full bg-green-500" />
          </div>
        )}
      </div>

      {/* Information */}
      <div className="px-3 pb-3 pt-4">
        {/* Name */}
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {fullName}
          </h2>

          {!user.deleted && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-xs text-white">
              ✓
            </span>
          )}
        </div>

        {/* Role */}
        <p className="mt-1 text-sm text-gray-500">
          {user.role}
          {user.department && ` • ${user.department}`}
        </p>

        {/* Description / Contact */}
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
          {user.email}
        </p>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-5 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <span><Phone /></span>
            <span>{user.contact_number}</span>
          </div>

          <div className="flex items-center gap-1">
            <span>●</span>
            <span>
              {user.employment_status || "Active"}
            </span>
          </div>
        </div>

        {/* Button */}
        <div className="mt-4 flex gap-2">
          <button
            className="flex-1 rounded-full bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-900 transition hover:bg-gray-200"
          >
            View Profile
          </button>

          <button
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserCard;