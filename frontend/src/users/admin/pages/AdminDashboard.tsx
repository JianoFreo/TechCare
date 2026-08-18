import { useEffect } from "react";
import Header from "../../../components/Header";
import type { User } from "../../../../interface/User";

type AdminDashboardProps = {
    users: User[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
    loading: boolean;
};

function AdminDashboard({
    users,
    open,
    setOpen,
    loadData,
    loading,
}: AdminDashboardProps) {
    useEffect(() => {
        loadData();
    }, [loadData]);

    return (

        <main className="flex-1 min-w-0 p-6">
            <Header
            loading={loading}
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Admin Dashboard"
            />
            <div className="overflow-x-auto">
                <div className="flex py-6 gap-4 justify-between">
                    <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                        <h2>
                            Total Users: {users.length}
                        </h2>
                    </div>
                    <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                        <h2>
                            Active Users
                        </h2>
                    </div>
                    <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                        <h2>
                            Today's Activity:
                        </h2>
                    </div>
                    <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                        <h2>
                            System status:
                        </h2>
                    </div>
                </div>
                <div className="border p-6">
                    <p className="pb-5 text-2xl">
                        SYSTEM OVERVIEW
                    </p>

                    <div className="flex gap-3">
                        <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                            <h2>
                                Doctors active: {users.filter(user => user.role === "doctor").length}
                            </h2>

                        </div>
                        <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                            <h2>
                                Labstaff active: {users.filter(user => user.role === "laboratory-staff").length}
                            </h2>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                            <h2>
                                Front Desk staffs active: {users.filter(user => user.role === "frontdesk-staff").length}
                            </h2>

                        </div>
                        <div className="flex-1 border mb-4 shadow p-10 text-center text-2xl">
                            <h2>
                                Registered patients: {users.filter(user => user.role === "patient").length}
                            </h2>
                        </div>
                    </div>
                </div>
            </div>

        </main>
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
//                             loadUsers();
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