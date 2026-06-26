import { useEffect, useState } from "react";
import Header from "../components/Header";
import axios from 'axios'

type User = {
    user_id: number;
    username: string;
    full_name: string
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
    const [filteredUsers, setFilteredUsers] = useState<User[]>(users);
    const [newUserEdit, setNewUserEdit] = useState(true)
    const [fullName, setFullName] = useState("")
    const [addRole, setAddRole] = useState("")
    const [addUsername, setAddUsername] = useState("")
    const [addContactNumber, setAddContactNumber] = useState("")
    const [addEmail, setAddEmail] = useState("")
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    async function addUser(){
await axios.post("/api/auth/sign-up",{
    user: newUserEdit,
    role: addRole,
    full_name, fullName,
    password,


})
    }
    function handleSearch(event: React.ChangeEvent<HTMLInputElement>) {
        const searchTerm = event.target.value.toLowerCase();
        const filteredUsers = users.filter((user) =>
            user.username.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        setFilteredUsers(filteredUsers);
    }
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
                    onChange={handleSearch}
                />
            </div>


            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                    <thead className="bg-gray-200">
                        <tr>
                            <th className="border p-3 text-left">ID</th>
                            <th className="border p-3 text-left">Username</th>
                            <th className="border p-3 text-left">full name</th>
                            <th className="border p-3 text-left">Role</th>
                            <th className="border p-3 text-left">Contact Number</th>
                            <th className="border p-3 text-left">Email</th>
                            <th className="border p-3 text-left">Created At</th>
                            <th className="border p-3 text-left">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {newUserEdit && (
                            <tr>
                                <th className="border bg-gray-200 p-3 text-left">
                                </th>
                                <th className="border p-3 text-left">
                                    <input className="border p-2" onChange={(e) => setAddUsername(e.target.value)} />
                                </th>
                                <th className="border p-3 text-left">
                                    <input className="border p-2" onChange={(e) => setFullName(e.target.value)} />
                                </th>

                                <th className="border p-3 text-left">
                                    <select className="border p-2 w-full" onChange={(e) => setAddRole(e.target.value)}>
                                        <option value="admin">Admin</option>
                                        <option value="doctor">Doctor</option>
                                        <option value="laboratory-staff">Laboratory Staff</option>
                                        <option value="frontdesk-staff">Front Desk Staff</option>
                                        <option value="patient">Patient</option>
                                    </select>
                                </th>
                                <th className="border p-3 text-left">
                                    <input className="border p-2" onChange={(e) => setAddContactNumber(e.target.value)} />
                                </th>
                                <th className="border p-3 text-left">
                                    <input className="border p-2" onChange={(e) => setAddEmail(e.target.value)} />
                                </th>
                                <th className="border p-3 text-left">
                                    {Date()}
                                </th>
                                <th className="border p-3 text-left">
                                    <button className="bg-gray-200 p-2 hover:bg-gray-400 ">
                                        Add user
                                    </button>
                                </th>
                            </tr>
                        )
                        }
                        {filteredUsers.map((user) => (
                            <tr key={user.user_id} className="hover:bg-gray-100">
                                <td className="border p-3">{user.user_id}</td>
                                <td className="border p-3">{user.username}</td>
                                <td className="border p-3">{user.full_name}</td>
                                <td className="border p-3">{user.role}</td>
                                <td className="border p-3">{user.contact_number}</td>
                                <td className="border p-3">{user.email}</td>
                                <td className="border p-3">
                                    {new Date(user.created_at).toLocaleString()} PHT
                                </td>
                                <td className="border p-3">
                                    <div className="flex justify-center items-center gap-2">
                                        <button
                                            className="bg-gray-200 px-4 py-2 hover:bg-gray-400"
                                            onClick={() => { }}
                                        >
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