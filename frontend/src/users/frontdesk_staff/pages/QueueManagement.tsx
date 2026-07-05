import { useState } from "react";
import Header from "../components/Header";

type Queue = {
    queue_id: number;
    patient_id: number;
    queue_number: number;
    service_type: string;
    status: string;
    created_at: string;
    updated_at: string;
}[];

type QueueManagementProps = {
    queue: Queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function QueueManagement({
    queue,
    open,
    setOpen,
    loadData,
}: QueueManagementProps) {

    const [patientId, setPatientId] = useState<number | null>(null)
    const [isPriority, setIsPriority] = useState(false)
    const [serviceType, setServiceeType] = useState()

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Queue Management"
            />


            <h1 className="text-2xl font-bold mb-4">Queue Management</h1>
            <div>
                <p>
                    if you have already been admitted before pleas einsert your pateint ID
                </p>                <input
                    onChange={(e) => {
                        setPatientId(Number(e.target.value));
                    }}
                    value={patientId ?? ""}
                    placeholder="patient ID"
                />
                <input
                    type="checkbox"

                    checked={isPriority}
                    onChange={(e) => setIsPriority(e.target.checked)}
                />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Queue Number</th>
                            <th className="px-6 py-3">Patient ID</th>
                            <th className="px-6 py-3">Service Type</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {queue.map((queueItem) => (
                            <tr>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4"></td>
                                <td className="px-6 py-4"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default QueueManagement;