import { useCallback, useState } from "react";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import SideBar from "./components/SideBar";
import ServicePricingManagement from "./pages/ServicePricing";
import api from "../../lib/axios";

type User = {
    user_id: number;
    full_name:string
    username: string;
    password: string;
    role: string;
    created_at: string;
    contact_number: string;
    email: string;
};
type Service = {
    service_id: number;
    service_name: string;
    price: number;
};

function Admin() {
    const [users, setUsers] = useState<User[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [open, setOpen] = useState(true);
    const [page, setPage] = useState("dashboard");
    const loadData = useCallback(async () => {
        try{
            const serviceResponse = await api.get("/api/admin/services");
            const userResponse = await api.get("/api/admin/users");

            console.log("Services data:", serviceResponse.data);
            setServices(serviceResponse.data.services);
            console.log("Users data:", userResponse.data);
            setUsers(userResponse.data.users);
        } catch(error){ 
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

        </div>
    );
}

export default Admin;