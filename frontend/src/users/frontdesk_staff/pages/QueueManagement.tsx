import { useEffect, useState } from "react";

import api from "../../../lib/axios";
import Header from "../components/Header";

type Queue = {
    queue_id: string;
    patient_id: string;
    patient_name: string;
    queue_number: number;
    service_name: string;
    service_id: string;
    service_type: string;
    status: string;
    created_at: string;
    updated_at: string;
}[];
type Service = {
    id: number;
    service_id: string;
    service_name: string;
    service_type: string;
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

    const [patientId, setPatientId] = useState<string | null>(null)
    const [isPriority, setIsPriority] = useState(false)
    const [serviceId, setServiceId] = useState<string | null>(null)
    // const [serviceType, setServiceType] = useState<string | null>(null)
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
                // service_type: serviceType
            });
            const response = await api.post("/api/fdstaff/queues", {
                patient_id: patientId,
                is_priority: isPriority,
                service_id: serviceId,
                // service_type: serviceType,
                service_name: serviceName

            });


            console.log("Queue submitted:", response.data);
            setPatientId(null);
            setIsPriority(false);
            setServiceId(null);
            // setServiceType(null);
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
                            e.target.value === "" ? null : e.target.value
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
                        setServiceId(e.target.value);
                        setServiceName(e.target.selectedOptions[0].text);
                        // setServiceType(e.target.selectedOptions[0].getAttribute("data-service-type"));
                    }}
                >
                    <option value="">Select a service</option>

                    {services.map((service) => (
                        <option
                            key={service.service_id}
                            value={service.service_id}

                        >
                            {service.service_name} {service.service_type}
                        </option>
                    ))}
                </select>
                <button type="submit">
                    Submit
                </button>
            </form>
            <div className="mt-6 flex gap-6">
                {/* Consultation Queue */}
                <div className="w-1/2">
                    <h1 className="mb-2 text-xl font-bold">Consultation Queue</h1>

                    <div className="overflow-x-auto border rounded-lg shadow">
                        <table className="w-full table-auto divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-sm">Queue #</th>
                                    <th className="px-3 py-2 text-left text-sm">Patient ID</th>
                                    <th className="px-3 py-2 text-left text-sm">Patient Name</th>
                                    <th className="px-3 py-2 text-left text-sm">Service</th>
                                    <th className="px-3 py-2 text-left text-sm">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">
                                {queues.map(
                                    (queueItem) =>
                                        queueItem.service_type === "consultation" && (
                                            <tr key={queueItem.queue_id}>
                                                <td className="px-3 py-2 text-sm">{queueItem.queue_number}</td>
                                                <td className="px-3 py-2 text-sm">
                                                    {queueItem.patient_id || "Not registered"}
                                                </td>
                                                <td className="px-3 py-2 text-sm">
                                                    {queueItem.patient_name || "Not registered"}
                                                </td>
                                                <td className="px-3 py-2 text-sm">{queueItem.service_name}</td>
                                                <td className="px-3 py-2 text-sm">{queueItem.status}</td>
                                            </tr>
                                        )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Laboratory Queue */}
                <div className="w-1/2">
                    <h1 className="mb-2 text-xl font-bold">Laboratory Queue</h1>

                    <div className="overflow-x-auto border rounded-lg shadow">
                        <table className="w-full table-auto divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-2 text-left text-sm">Queue #</th>
                                    <th className="px-3 py-2 text-left text-sm">Patient ID</th>
                                    <th className="px-3 py-2 text-left text-sm">Patient Name</th>
                                    <th className="px-3 py-2 text-left text-sm">Service</th>
                                    <th className="px-3 py-2 text-left text-sm">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200 bg-white">
                                {queues.map(
                                    (queueItem) =>
                                        queueItem.service_type === "laboratory" && (
                                            <tr key={queueItem.queue_id}>
                                                <td className="px-3 py-2 text-sm">{queueItem.queue_number}</td>
                                                <td className="px-3 py-2 text-sm">
                                                    {queueItem.patient_id || "Not registered"}
                                                </td>
                                                <td className="px-3 py-2 text-sm">
                                                    {queueItem.patient_name || "Not registered"}
                                                </td>
                                                <td className="px-3 py-2 text-sm">{queueItem.service_name}</td>
                                                <td className="px-3 py-2 text-sm">{queueItem.status}</td>
                                            </tr>
                                        )
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default QueueManagement;