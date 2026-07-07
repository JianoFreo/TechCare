import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";

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
    const [services, setServices] = useState([]);
    const [open, setOpen] = useState(true);

    const [searchParams, setSearchParams] = useSearchParams();

    const page = searchParams.get("page") ?? "dashboard"; // this  looks at the URL
    // "Look at the URL and check if there is a page value. 
    // If there is one, use it. If there is no page value, use dashboard as the default."

    // searchParams.get("page")       // Get the value of "page"
    // searchParams.has("page")       // Check if "page" exists
    // searchParams.set("page", "billing") // Set a value (used internally)
    // searchParams.delete("page")    // Remove a parameter
    // searchParams.entries()         // Get all key-value pairs

    function setPage(newPage: string) {
        setSearchParams({ page: newPage });
    }

    const loadData = useCallback(async () => {
        try {
            const serviceResoponse = await api.get("/api/fdstaff/services");
            const patientsResponse = await api.get("/api/fdstaff/patients");
            const queuesResponse = await api.get("/api/fdstaff/queues");

            setServices(serviceResoponse.data.services);
            setPatients(patientsResponse.data.patients);
            setQueues(queuesResponse.data.queueEntries);
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