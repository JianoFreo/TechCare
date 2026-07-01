

import { useCallback, useState } from "react";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import SideBar from "./components/SideBar";
import ServicePricingManagement from "./pages/ServicePricing";
import ActivityMonitoring from "./pages/ActivityMonitoring";
import api from "../../lib/axios";


function FrontdeskStaff() {
    const [queue, setQueue] = useState([]);

    return (
        <div className="flex min-h-screen">
            <SideBar
                open={open}
                page={page}
                setPage={setPage}
            />

            {page === "billing" && (
                <AdminDashboard
                    users={users}
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