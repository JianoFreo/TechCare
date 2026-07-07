import { useEffect, useState } from "react";

import api from "../../../lib/axios";
import Header from "../components/Header";
import Queues from "./components/Queues";

type Queue = {
    id: number;
    queue_id: string;
    patient_id: string;
    patient_name: string;
    queue_number: number;
    service_name: string;
    service_id: string;
    service_type: string;
    is_priority: boolean;
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
        <main className="flex-1 min-w-0 bg-gray-100 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Queue Management"
            />

            <h1 className="mb-6 text-3xl font-bold text-gray-800">
                Queue Management
            </h1>

            <div className="rounded-xl bg-white p-6 shadow-md">
                <form onSubmit={submitQueue} className="space-y-4">
                    <p className="text-sm text-gray-600">
                        if you have already been admitted before pleas einsert your
                        pateint ID
                    </p>

                    <div className="grid gap-4 md:grid-cols-3">
                        <input
                            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                            placeholder="Patient ID"
                            value={patientId ?? ""}
                            onChange={(e) => {
                                setPatientId(
                                    e.target.value === "" ? null : e.target.value
                                );
                            }}
                        />

                        <select
                            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
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

                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isPriority}
                                onChange={(e) => setIsPriority(e.target.checked)}
                            />
                            <span>Priority Patient</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="rounded-lg bg-red-800 px-5 py-2 font-medium text-white transition cursor-pointer hover:bg-red-900"
                    >
                        Submit
                    </button>
                </form>
            </div>

            <div className="mt-8 flex flex-col gap-6">
                <Queues
                    queues={queues}
                    queuesType="consultation"
                />

                <Queues
                    queues={queues}
                    queuesType="laboratory"
                />
            </div>
        </main>
    );
}

export default QueueManagement;