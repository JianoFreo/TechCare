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
    const [queues, setQueues] = useState([]);
    const [services, setServices] = useState([])
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState("dashboard");
    const loadData = useCallback(async () => {
        try {
            const serviceResoponse = await api.get("/api/fdstaff/services");
            const patientsResponse = await api.get("/api/fdstaff/patients");
            const queuesResponse = await api.get("/api/fdstaff/queues");
            // const billingResponse = await api.get("/api/fdstaff/billing");
            // const queueEntriesResponse = await api.get("/api/fdstaff/queue");

            setServices(serviceResoponse.data.services)
            console.log("service data :", serviceResoponse.data)

            setPatients(patientsResponse.data.patients);
            console.log("Patients data:", patientsResponse.data);
            
            setQueues(queuesResponse.data.queueEntries)
            console.log("queue entries data:", queuesResponse.data)
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
                    queues={queues}
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
                    services={services}
                    queues={queues}
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