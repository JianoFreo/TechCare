import Header from "../components/Header";

type Bill = {
    bill_id: number;
    patient_id: number;
    discount_pct: number;
    total_amount: number;
    payment_method: string;
    status: string;
    receipt_id: string;
    billed_at: string;
}[];
type Patient = {
    patient_id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    contact_number: string;
    email: string;
    address: string;
    emergency_contact: string;
    created_at: string;
    updated_at: string;
}[];

type queue = {
    queue_id: number;
    patient_id: number;
    queue_number: number;
    doctor_id: number;
    service_type: string;
    status: string;
    created_at: string;
    updated_at: string;
}[];

type FrontdeskDashboardProps = {
    billing: Bill;
    patients: Patient;
    queue: queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function FrontdeskDashboard({ billing, patients, queue, open, setOpen, loadData }: FrontdeskDashboardProps) {
    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Frontdesk Dashboard"
            />
            <h1>Frontdesk Dashboard</h1>
            <h1>Frontdesk Staff Dashboard</h1>
        </main>
    )
}
export default FrontdeskDashboard;