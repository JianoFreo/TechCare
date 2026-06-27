import { useEffect, useState } from "react";
import Header from "../components/Header";
import AddUserModal from "../components/AddUserModal";

type User = {
    user_id: number;
    username: string;
    password: string;
    role: string;
    created_at: string;
    contact_number: string;
    email: string;
};

type UserManagementProps = {
    users: User[];
    loadUsers: () => Promise<void>;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function UserManagement({
    users,
    loadUsers,
    open,
    setOpen,
}: UserManagementProps) {
    const [showAddUser, setShowAddUser] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    const filteredUsers = users.filter((user) =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <main className="flex-1 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadUsers={loadUsers}
                page="User Management"
            />

            <h2 className="text-2xl font-bold mb-4">
                Total Users: {filteredUsers.length}
            </h2>

            <div className="flex">
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
                        loadUsers={loadUsers}
                    />
                )}
            </div>

            <div className="overflow-x-auto">
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
                                        <button className="bg-gray-200 px-4 py-2 hover:bg-gray-400">
                                            Edit
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default UserManagement;