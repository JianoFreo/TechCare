
import axios from "axios";
import { useState, useEffect } from "react";
import SideBar from "./components/SideBar";
type User = {
    user_id: number;
    username: string;
    password: string;
    role: string;
    deleted: boolean;
    created_at: string;
};


function AdminDashboard() {
    const [users, setUsers] = useState<User[]>([]);
    const [open, setOpen] = useState(false);

    const loadAdminDashboard = async () => {
        try {
            const response = await axios.get("/api/admin");
            console.log("Admin dashboard data:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            await loadAdminDashboard();
        };

        fetchData();
    }, []);

    return (
        <div className="flex min-h-screen">
            <SideBar open={open} settings="dashboard" />

            <main className="flex-1 p-6">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={() => setOpen(!open)}
                        className="text-2xl"
                    >
                        ☰
                    </button>

                    <h1 className="text-3xl font-bold">
                        Admin Dashboard
                    </h1>
                    <div
                        onClick={loadAdminDashboard}
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
        </div>
    );
}

export default AdminDashboard;

// import axios from "axios";
// import { useState } from "react";

// function AdminDashboard() {

//     const [totalUsers, setTotalUsers] = useState(0);
//     const loadadminDashboard = async () => {
//         try {
//             const response = await axios.get("/admin");
//             setTotalUsers(response.data.totalUsers);
//             console.log("Total Users:", response.data);
//         } catch (error) {
//             console.error("Error fetching admin dashboard data:", error);
//         }
//     };
// useEffect(() => {
//     const fetchData = async () => {
//         await loadAdminDashboard();
//     };

//     fetchData();
// }, []);
//     return (
//         <>
//             <div className="status">
//                 <div>
//                     <h1>Admin Dashboard</h1>
//                     <button
//                         onClick={() => {
//                             console.log("clicked");
//                             loadadminDashboard();
//                         }}
//                         className="reload-button"
//                     >
//                         reload page
//                     </button>
//                     <div className="total-users">
//                         Total Users: {totalUsers}
//                     </div>
//                 </div>
//             </div>
//         </>
//     )
// }

// export default AdminDashboard