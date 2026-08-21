import Header from "../../../components/Header";
import type { Patient } from "../../../interface/Patient";

type Bill = {
    id: number;
    bill_id: string;
    patient_id: string;
    discount_pct: number;
    total_amount: number;
    payment_method: string;
    status: string;
    receipt_id: string;
    billed_at: string;
}[];

type Queue = {
    id: number;
    queue_id: string;
    patient_id: string;
    queue_number: number;
    doctor_id: string;
    service_type: string;
    status: string;
    created_at: string;
    updated_at: string;
}[];

type FrontdeskDashboardProps = {
    billing: Bill;
    loading: boolean;
    patients: Patient[];
    queues: Queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function FrontdeskDashboard({ 
    billing, 
    patients, 
    queues, 
    open, 
    setOpen, 
    loadData, 
    loading }: FrontdeskDashboardProps) {
    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Frontdesk Dashboard"
                loading={loading}
            />
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Patients in Queue</h2>
                    <p className="text-2xl">{queues.filter((q) => q.status === "Waiting").length}</p>
                </div>
                <div className="bg-white p-4  shadow">
                    <h2 className="text-lg font-semibold mb-2">Registered Today</h2>
                    <p className="text-2xl">{patients.filter((p) => p.created_at === new Date().toISOString().split('T')[0]).length}</p>
                </div>
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Queue</h2>
                    <p className="text-2xl">{queues.length}</p>
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
                        <p className="text-2xl">{queues.filter((q) => q.status === "Waiting").length}</p>
                    </div>
                    <div className="bg-white p-4  shadow">
                        <h2 className="text-lg font-semibold mb-2">Registered Today</h2>
                        <p className="text-2xl">{patients.filter((p) => p.created_at === new Date().toISOString().split('T')[0]).length}</p>
                    </div>
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Total Queue</h2>
                        <p className="text-2xl">{queues.length}</p>
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