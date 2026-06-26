import { useEffect } from "react";

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
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => setOpen(!open)}
                    className="text-2xl"
                >
                    ☰
                </button>

                <h1 className="text-3xl font-bold">
                    User Management
                </h1>

                <div
                    onClick={loadUsers}
                    className="ml-auto bg-red-800 text-white py-2 px-4 cursor-pointer"
                >
                    Load Users
                </div>
            </div>

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