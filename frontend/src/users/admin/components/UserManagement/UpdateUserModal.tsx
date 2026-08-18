import { useState } from "react";
import type { User } from "../../../../interface/User";
import api from "../../../../lib/axios";

type Props = {
  onClose: () => void;
  loadData: () => void;
  selectedUser: User;
};

function UpdateUserModal({ selectedUser, onClose, loadData }: Props) {
  const [username, setUsername] = useState(selectedUser.username);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [firstName, setFirstName] = useState(selectedUser.first_name);
  const [middleName, setMiddleName] = useState(selectedUser.middle_name || "");
  const [lastName, setLastName] = useState(selectedUser.last_name);
  const [suffix, setSuffix] = useState(selectedUser.suffix || "");

  const [contactNumber, setContactNumber] = useState(
    selectedUser.contact_number
  );
  const [email, setEmail] = useState(selectedUser.email);
  const [role, setRole] = useState(selectedUser.role);

  const [hiddenPassword, setHiddenPassword] = useState(true);

  const editUser = async () => {
    if (password && password !== confirmPassword) {
      alert("Your passwords do not match.");
      return;
    }

    try {
      const data: Record<string, string> = {};

      if (username.trim()) data.username = username;
      if (password.trim()) data.password = password;

      if (firstName.trim()) data.first_name = firstName;
      if (middleName.trim()) data.middle_name = middleName;
      if (lastName.trim()) data.last_name = lastName;
      if (suffix.trim()) data.suffix = suffix;

      if (role.trim()) data.role = role;
      if (email.trim()) data.email = email;
      if (contactNumber.trim()) {
        data.contact_number = contactNumber;
      }

      const response = await api.patch(
        `/api/admin/users/${selectedUser.user_id}`,
        data
      );

      alert(response.data.message);

      onClose();
      loadData();
    } catch (error) {
      console.error("UPDATE USER ERROR:", error);
      alert("Failed to update user.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 flex justify-between text-2xl font-bold">
          Update User

          <button
            onClick={onClose}
            className="border px-4 py-2"
          >
            X
          </button>
        </h2>

        <div className="space-y-4">

          {/* Username */}
          <input
            type="text"
            placeholder="Username"
            className="w-full border p-2"
            onChange={(e) => setUsername(e.target.value)}
            value={username}
          />

          {/* Password */}
          <div className="flex border">
            <input
              type={hiddenPassword ? "password" : "text"}
              placeholder="New Password"
              className="w-full p-2 outline-none"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
            />

            <button
              type="button"
              className="p-2"
              onClick={() => setHiddenPassword(!hiddenPassword)}
            >
              {hiddenPassword ? "Show" : "Hide"}
            </button>
          </div>

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Repeat Password"
            className="w-full border p-2"
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
          />

          {/* First Name */}
          <input
            type="text"
            placeholder="First Name"
            className="w-full border p-2"
            onChange={(e) => setFirstName(e.target.value)}
            value={firstName}
          />

          {/* Middle Name */}
          <input
            type="text"
            placeholder="Middle Name"
            className="w-full border p-2"
            onChange={(e) => setMiddleName(e.target.value)}
            value={middleName}
          />

          {/* Last Name */}
          <input
            type="text"
            placeholder="Last Name"
            className="w-full border p-2"
            onChange={(e) => setLastName(e.target.value)}
            value={lastName}
          />

          {/* Suffix */}
          <input
            type="text"
            placeholder="Suffix"
            className="w-full border p-2"
            onChange={(e) => setSuffix(e.target.value)}
            value={suffix}
          />

          {/* Contact Number */}
          <input
            type="text"
            placeholder="Contact Number"
            className="w-full border p-2"
            onChange={(e) => setContactNumber(e.target.value)}
            value={contactNumber}
          />

          {/* Email */}
          <input
            type="text"
            placeholder="Email"
            className="w-full border p-2"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
          />

          {/* Role */}
          <select
            className="w-full border p-2"
            onChange={(e) => setRole(e.target.value)}
            value={role}
          >
            <option value="">Select Role</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="laboratory-staff">
              Laboratory Staff
            </option>
            <option value="frontdesk-staff">
              Front Desk Staff
            </option>
            <option value="patient">Patient</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="bg-gray-200 px-4 py-2 hover:cursor-pointer hover:bg-gray-400"
            onClick={editUser}
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
  );
}

export default UpdateUserModal;