import { useEffect, useState } from "react";
import Header from "../../../components/Header";
import AddUserModal from "../components/UserManagement/AddUserModal";
import UpdateUserModal from "../components/UserManagement/UpdateUserModal"
import { User } from "lucide-react";
import UserCardSquare from "../components/UserManagement/UserCardSquare";
import UserProfile from "./UserProfile";

type User = {
    user_id: string;
    username: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string;
    email: string;
    contact_number: string;
    emergency_contact_name: string | null;
    emergency_contact: string | null;
    address: string;
    birthdate: string;
    role: string;
    department: string | null;
    employment_status: string | null;
    date_hired: string;
    shift_start: string;
    shift_end: string;
    profile_photo: string | null;
    deleted: boolean;
    created_at: string;
    updated_at: string;
};
type UserManagementProps = {
    users: User[];
    loadData: () => Promise<void>;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loading: boolean;
};

function UserManagement({
    users,
    loadData,
    open,
    setOpen,
    loading
}: UserManagementProps) {
    const [showAddUser, setShowAddUser] = useState(false);
    const [showUpdateUser, setShowUpdateUser] = useState(false);
    const [showUserProfile, setShowUserProfile] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState<User>(users[0]);
    useEffect(() => {
        loadData();
    }, [loadData]);

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                loading={loading}
                setOpen={setOpen}
                loadData={loadData}
                page="User Management"
            />

            <h2 className="text-2xl font-bold mb-4">
                Total Users: {filteredUsers.length}
            </h2>

            <div className="flex items-center gap-3 mb-4">
                <p className="p-2 mb-4 text-4xl">🔎︎</p>

                <input
                    placeholder="Search users..."
                    className="p-2 mb-4 border w-100"
                    onChange={(e) => setSearch(e.target.value)}
                />

                <button
                    onClick={() => setShowAddUser(true)}
                    className="ml-3 p-4 mb-4 bg-gray-200 hover:bg-gray-400"
                >
                    Add User
                </button>

                {showAddUser && (
                    <AddUserModal
                        onClose={() => setShowAddUser(false)}
                        loadData={loadData}
                    />
                )}
                {showUpdateUser && (
                    <UpdateUserModal
                        selectedUser={selectedUser}
                        onClose={() => setShowUpdateUser(false)}
                        loadData={loadData}
                    />
                )}
                {showUserProfile && (
                    <UserProfile
                        user={selectedUser}
                        onBack={() => setShowUserProfile(false)}
                    />
                )}

            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
                {users.map((user) => (
                    <UserCardSquare
                        key={user.user_id}
                        user={user}
                        setSelectedUser={setSelectedUser}
                        setShowUserProfile={setShowUserProfile}
                    />
                ))}
            </div>
            {/* <div className="w-full overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-3 text-left">ID</th>
                            <th className="border p-3 text-left">Username</th>
                            <th className="border p-3 text-left">Role</th>
                            <th className="border p-3 text-left">Contact Number</th>
                            <th className="border p-3 text-left">Email</th>
                            <th className="border p-3 text-left">Created At</th>
                            <th className="border p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.user_id} className="hover:bg-gray-100">
                                <td className="border p-3">{user.user_id}</td>
                                <td className="border p-3">{user.username}</td>
                                <td className="border p-3">{user.role}</td>
                                <td className="border p-3">{user.contact_number}</td>
                                <td className="border p-3">{user.email}</td>
                                <td className="border p-3">
                                    {new Date(user.created_at).toLocaleString()} PHT
                                </td>
                                <td className="border p-3">
                                    <div className="flex justify-center items-center gap-2">
                                        <button className="bg-gray-200 px-4 py-2 hover:bg-gray-400"
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowUpdateUser(true)
                                            }}>
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div> */}

        </main>
    );
}

export default UserManagement;