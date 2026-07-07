import { useState } from "react";
import api from "../../../../lib/axios";

type QueueItem = {
    id: number;
    queue_id: string;
    patient_id: string;
    patient_name: string;
    queue_number: number;
    service_name: string;
    service_type: string;
    is_priority: boolean;
    status: string;
    created_at: string;
    updated_at: string;
}[];
type QueuesProps = {
    queues: QueueItem;
    queuesType: "consultation" | "laboratory";
    loadData: () => Promise<void>;
};
function Queues({ queues, queuesType, loadData }: QueuesProps) {
    const [queueIdToServe, setQueueIdToServe] = useState<string | null>(null)
    const [queueNumberToServe, setQueueNumberToServe] = useState<number | null>(null)
    const [queueServiceTypeToServe, setQueueServiceTypeToServe] = useState<string | null>(null)
    // function updateQueueStatusToServe(){
    //     const response = api.put(`/fdstaff/queues/`, {
    //         queue_id: queueIdToServe,
    //         queue_number: queueNumberToServe,
    //         service_type: queueServiceTypeToServe
    //     });
    // }

    async function handleServeQueue(
        queueId: string,
        queueNumber: number,
        serviceType: string
    ) {
        try {
            const response = await api.put("/api/fdstaff/queues", {
                queue_id: queueId,
                queue_number: queueNumber,
                service_type: serviceType,
            });

            console.log(
                "Queue served:",
                queueId,
                queueNumber,
                serviceType
            );
            console.log("Response:", response.data);

            await loadData();
            alert("Queue served successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to serve queue.");
        }
    }
    return (
        <div className="rounded-xl bg-white p-4 shadow-md">
            <h1 className="mb-4 text-xl font-bold">
                Consultation Queue
            </h1>

            <div className="max-h-80 overflow-y-auto rounded-lg border">
                <table className="w-full table-auto divide-y divide-gray-200">
                    <thead className="sticky top-0 bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-sm">
                                Queue #
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                Queue ID
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                Patient ID
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                Patient Name
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                Service
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                Patient status
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                Status
                            </th>
                            <th className="px-3 py-2 text-left text-sm">
                                ACTIONS
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">
                        {queues.map(
                            (queueItem) =>
                                queueItem.service_type ===
                                queuesType && (
                                    <tr
                                        key={queueItem.queue_id}
                                        className="hover:bg-gray-50"
                                    >
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.queue_number}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.queue_id}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.patient_id ||
                                                "Not registered"}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.patient_name ||
                                                "Not registered"}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.service_name}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.is_priority ? "Priority" : "Regular"}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.status}
                                        </td>
                                        <td className="px-3 py-2 text-sm">
                                            {queueItem.status === "serving" ? (
                                                <button>service done</button>
                                            ) :
                                                <div className="flex gap-2">
                                                    <button
                                                        className="border"
                                                        onClick={() => {
                                                            handleServeQueue(
                                                                queueItem.queue_id,
                                                                queueItem.queue_number,
                                                                queueItem.service_type
                                                            );
                                                        }}
                                                    >
                                                        serve
                                                    </button>
                                                    <button
                                                        className="border"

                                                        onClick={() => setQueueIdToServe(queueItem.queue_id)}
                                                    >
                                                        skip
                                                    </button>
                                                </div>
                                            }
                                        </td>
                                    </tr>
                                )
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default Queues;