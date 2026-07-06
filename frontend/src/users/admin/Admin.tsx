import { useCallback, useState } from "react";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import SideBar from "./components/SideBar";
import ServicePricingManagement from "./pages/ServicePricing";
import ActivityMonitoring from "./pages/ActivityMonitoring";
import api from "../../lib/axios";

type User = {
    id: number;
    user_id: string;
    full_name: string
    username: string;
    password: string;
    role: string;
    created_at: string;
    contact_number: string;
    email: string;
};
type Service = {
    id: number;
    service_id: string;
    service_name: string;
    price: number;
    active: boolean,
    service_type: string
};
type Activities = {
    id: number;
    activity_id: string;
    user_id: number;
    username: string;
    service_name: string;
    details: Record<string, unknown>;
    created_at: string;
};
// each element must be either:

// No object at all (the array is empty)
// A complete Activity object

function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [activities, setActivities] = useState<Activities[]>([])  // Acitivities[] this means that this object structure can be a lot of objects // array
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState("dashboard");
    const loadData = useCallback(async () => {
        try {
            const serviceResponse = await api.get("/api/admin/services");
            const userResponse = await api.get("/api/admin/users");
            const activityResponse = await api.get("/api/admin/activities")


            setActivities(activityResponse.data.activities)
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

            {page === "dashboard" && (
                <AdminDashboard
                    users={users}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "user-management" && (
                <UserManagement
                    users={users}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "service-pricing" && (
                <ServicePricingManagement
                    services={services}
                    open={open}
                    setOpen={setOpen}
                    loadData={loadData}
                />
            )}
            {page === "activity-monitoring" && (
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

export default Admin;