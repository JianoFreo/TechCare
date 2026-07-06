import { useEffect, useState } from "react";

import api from "../../../lib/axios";
import Header from "../components/Header";

type Queue = {
    queue_id: string;
    patient_id: number;
    patient_name: string;
    queue_number: number;
    service_name: string;
    service_id: number;
    status: string;
    created_at: string;
    updated_at: string;
}[];
type Service = {
    id: number;
    service_id: string;
    service_name: string;
    price: number;
}[];
type QueueManagementProps = {
    services: Service
    queues: Queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function QueueManagement({
    services,
    queues,
    open,
    setOpen,
    loadData,
}: QueueManagementProps) {

    const [patientId, setPatientId] = useState<number | null>(null)
    const [isPriority, setIsPriority] = useState(false)
    const [serviceId, setServiceId] = useState<number | null>(null)
    const [serviceName, setServiceName] = useState<string | null>(null)
    useEffect(() => {
        loadData();
    }, [loadData]);
    async function submitQueue(e: React.FormEvent<HTMLFormElement>) {
        try {
            e.preventDefault() // Prevent the default form submission behavior
            console.log("Submitting queue with data:", {
                patient_id: patientId,
                is_priority: isPriority,
                service_id: serviceId,
                service_name: serviceName
            });
            const response = await api.post("/api/fdstaff/queues", {
                patient_id: patientId,
                is_priority: isPriority,
                service_id: serviceId,
                service_name: serviceName
            });


            console.log("Queue submitted:", response.data);
            alert(response.data.message)
            setPatientId(null);
            setIsPriority(false);
            setServiceId(null);
            setServiceName(null);
            loadData();
        } catch (error) {
            alert((error as { response?: { data?: { message?: string } } }).response?.data?.message);
        }
    }
    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Queue Management"
            />


            <h1 className="text-2xl font-bold mb-4">Queue Management</h1>
            <form onSubmit={submitQueue}>
                <p>
                    if you have already been admitted before pleas einsert your pateint ID
                </p>
                <input
                    value={patientId ?? ""}
                    onChange={(e) => {
                        setPatientId(
                            e.target.value === "" ? null : Number(e.target.value)
                        );
                    }}
                />
                <input
                    type="checkbox"

                    checked={isPriority}
                    onChange={(e) => setIsPriority(e.target.checked)}
                />
                <select
                    value={serviceId ?? ""}
                    onChange={(e) => {
                        setServiceId(Number(e.target.value));
                        setServiceName(e.target.selectedOptions[0].text);
                    }}
                >
                    <option value="">Select a service</option>

                    {services.map((service) => (
                        <option
                            key={service.service_id}
                            value={service.service_id}

                        >
                            {service.service_name}
                        </option>
                    ))}
                </select>
                <button type="submit">
                    Submit
                </button>
            </form>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3">Queue Number</th>
                            <th className="px-6 py-3">Patient ID</th>
                            <th className="px-6 py-3">Patient Name</th>
                            <th className="px-6 py-3">Service Type</th>
                            <th className="px-6 py-3">Status</th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">
                        {queues.map((queueItem) => (
                            <tr key={queueItem.queue_id}>
                                <td className="px-6 py-4">{queueItem.queue_number}</td>
                                <td className="px-6 py-4">{queueItem.patient_id ? queueItem.patient_id : "not registered"}</td>
                                <td className="px-6 py-4">{queueItem.patient_name ? queueItem.patient_name : "not registered"}</td>
                                <td className="px-6 py-4">{queueItem.service_name}</td>
                                <td className="px-6 py-4">{queueItem.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default QueueManagement;