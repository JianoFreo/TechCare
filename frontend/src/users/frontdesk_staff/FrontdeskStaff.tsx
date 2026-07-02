

import { useCallback, useState } from "react";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import SideBar from "./components/SideBar";
import ServicePricingManagement from "./pages/ServicePricing";
import ActivityMonitoring from "./pages/ActivityMonitoring";
import api from "../../lib/axios";
import PatientRegistration from "./pages/PatientRegistration";
import PatientRecords from "./pages/PatientRecords";
import QueueManagement from "./pages/QueueManagement";
import Billing from "./pages/Billing";


function FrontdeskStaff() {
    const [patients, setPatients] = useState([]);
    const [billing, setBilling] = useState([]);
    const [labRequests, setLabRequests] = useState([]);
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState("dashboard");
    const loadData = useCallback(async () => {
        try {
            const patientsResponse = await api.get("/fdstaff/patients");
            const billingResponse = await api.get("/fdstaff/billing");

            setPatients(patientsResponse.data.patients);
            console.log("Patients data:", patientsResponse.data);

            setBilling(billingResponse.data.bills);
            console.log("Billing data:", billingResponse.data);
        } catch (error) {
            console.log("Error fetching billing data:", error);
        }
    }, []);

    return (
        <div className="flex min-h-screen">
            <SideBar
                open={open}
                page={page}
                setPage={setPage}
            />

            {page === "dashboard" && (
                <AdminDashboard
                    patients={patients}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "patient-registration" && (
                <PatientRegistration
                    users={users}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "patient-records" && (
                <PatientRecords
                    services={services}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "queue-management" && (
                <QueueManagement
                    activities={activities}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "Billing" && (
                <Billing
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