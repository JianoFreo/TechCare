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
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Patients in Queue</h2>
                    <p className="text-2xl">{queue.filter((q) => q.status === "Waiting").length}</p>
                </div>
                <div className="bg-white p-4  shadow">
                    <h2 className="text-lg font-semibold mb-2">Registered Today</h2>
                    <p className="text-2xl">{patients.filter((p) => p.created_at === new Date().toISOString().split('T')[0]).length}</p>
                </div>
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Queue</h2>
                    <p className="text-2xl">{queue.length}</p>
                </div>
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Pending Bill</h2>
                    <p className="text-2xl">{billing.filter((bill) => bill.status === "unpaid").length}</p>
                </div>
            </div>
            <div className="mt-4 border">
                <h1 className="flex justify-center mt-7 text-3xl">
                    <strong>Queue Status Overview</strong>
                </h1>                <div className="border grid grid-cols-4 gap-4 m-7 p-3">
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Patients in Queue</h2>
                        <p className="text-2xl">{queue.filter((q) => q.status === "Waiting").length}</p>
                    </div>
                    <div className="bg-white p-4  shadow">
                        <h2 className="text-lg font-semibold mb-2">Registered Today</h2>
                        <p className="text-2xl">{patients.filter((p) => p.created_at === new Date().toISOString().split('T')[0]).length}</p>
                    </div>
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Total Queue</h2>
                        <p className="text-2xl">{queue.length}</p>
                    </div>
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Pending Bill</h2>
                        <p className="text-2xl">{billing.filter((bill) => bill.status === "unpaid").length}</p>
                    </div>
                </div>
            </div>

        </main>
    )
}
export default FrontdeskDashboard;