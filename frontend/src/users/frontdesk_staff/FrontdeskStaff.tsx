

import { useCallback, useState } from "react";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import SideBar from "./components/SideBar";
import ServicePricingManagement from "./pages/ServicePricing";
import ActivityMonitoring from "./pages/ActivityMonitoring";
import api from "../../lib/axios";


function FrontdeskStaff() {
    const [patients, setpatients] = useState([]);
    const [billing, setBilling] = useState([]);
    const [labRequests, setLabRequests] = useState([]);
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState("dashboard");
    const loadData = useCallback(async () => {
        try {
            const serviceResponse = await api.get("/api/admin/services");
            const userResponse = await api.get("/api/admin/users");
            const activityResponse = await api.get("/api/admin/activities")


            setPatients(activityResponse.data.activities)
            console.log("Services data:", serviceResponse.data);

            setServices(serviceResponse.data.services);
            console.log("services data:", userResponse.data);

            setUsers(userResponse.data.users);
            console.log("Users data:", userResponse.data.users);
        } catch (error) {
            console.log("Error fetching services:", error);
        }
    }, []);

    return (
        <div className="flex min-h-screen">
            <SideBar
                open={open}
                page={page}
                setPage={setPage}
            />

            {page === "billing" && (
                <AdminDashboard
                    patients={patients}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "frontdesk-dashboard" && (
                <UserManagement
                    users={users}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "patient-records" && (
                <ServicePricingManagement
                    services={services}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "queue-management" && (
                <ActivityMonitoring
                    activities={activities}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}

        </div>
    );
}

export default FrontdeskStaff;
// function FrontdeskStaff() {
//   return (
//     <div>
//       <h1>Front Desk Staff Dashboard</h1>
//       {/* Add your front desk staff dashboard components here */}
//     </div>
//   );
// }
// export default FrontdeskStaff;