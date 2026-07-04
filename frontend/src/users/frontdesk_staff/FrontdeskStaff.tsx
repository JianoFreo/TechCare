import { useCallback, useState } from "react";
import api from "../../lib/axios";
import SideBar from "./components/SideBar";
import Billing from "./pages/Billing";
import FrontdeskDashboard from "./pages/FrontdeskDashboard";
import PatientRecords from "./pages/PatientRecords";
import PatientRegistration from "./pages/PatientRegistration";
import QueueManagement from "./pages/QueueManagement";


function FrontdeskStaff() {
    const [patients, setPatients] = useState([]);
    const [billing, setBilling] = useState([]);
    const [queue, setQueue] = useState([]);
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState("dashboard");
    const loadData = useCallback(async () => {
        try {
            const patientsResponse = await api.get("/api/fdstaff/patients");
            // const billingResponse = await api.get("/api/fdstaff/billing");
            // const queueEntriesResponse = await api.get("/api/fdstaff/queue");

            setPatients(patientsResponse.data.patients);
            console.log("Patients data:", patientsResponse.data);

            // setBilling(billingResponse.data.bills);
            // console.log("Billing data:", billingResponse.data);

            // setQueue(queueEntriesResponse.data.queueEntries);
            // console.log("Queue data:", queueEntriesResponse.data);
        } catch (error) {
            console.log("Error fetching queue entries data:", error);
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
                <FrontdeskDashboard
                    patients={patients}
                    billing={billing}
                    queue={queue}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "patient-registration" && (
                <PatientRegistration
                    // patients={patients}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "patient-records" && (
                <PatientRecords
                    patients={patients}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "queue-management" && (
                <QueueManagement
                    queue={queue}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "billing" && (
                <Billing
                    billing={billing}
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