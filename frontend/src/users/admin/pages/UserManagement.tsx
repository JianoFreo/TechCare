import { useEffect } from "react";
import Header from "../components/Header";

type User = {
    user_id: number;
    username: string;
    password: string;
    role: string;
    deleted: boolean;
    created_at: string;
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
    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    return (
        <main className="flex-1 p-6">
            <Header open={open} setOpen={setOpen} loadUsers={loadUsers} page="User Management" />

            <h2>Total Users: {users.length}</h2>

            {users.map((user) => (
                <div
                    key={user.user_id}
                    className="border p-10 mb-4 rounded shadow"
                >
                    <p>Username: {user.username}</p>
                    <p>Role: {user.role}</p>
                </div>
            ))}
        </main>
    );
}

export default UserManagement;