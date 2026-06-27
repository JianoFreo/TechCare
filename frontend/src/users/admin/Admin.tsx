import { useCallback, useState } from "react";
import axios from "axios";
import UserManagement from "./pages/UserManagement";
import AdminDashboard from "./pages/AdminDashboard";
import SideBar from "./components/SideBar";
import ServicePricingManagement from "./pages/ServicePricing";

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
    const loadServices = useCallback(async () => {
        try{
            const response = await axios.get("/api/admin/services");
            console.log("Services data:", response.data);
            setServices(response.data);
        } catch(error){ 
            console.log("Error fetching services:", error);
        }
    }, []);
    const loadUsers = useCallback(async () => {
        try {
            const response = await axios.get("/api/admin/users");
            console.log("Admin dashboard data:", response.data);
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching admin dashboard data:", error);
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
                    loadUsers={loadUsers}
                />
            )}
            {page === "user-management" && (
                <UserManagement
                    users={users}
                    open={open}
                    setOpen={setOpen}
                    loadUsers={loadUsers}
                />
            )}
            {page === "service-pricing" && (
                <ServicePricingManagement   
                    services={services}
                    open={open}
                    setOpen={setOpen}
                    loadServices={loadServices}
                />
            )}

        </div>
    );
}

export default Admin;