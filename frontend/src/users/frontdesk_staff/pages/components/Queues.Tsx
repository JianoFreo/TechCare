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
};
function Queues({ queues, queuesType }: QueuesProps) {
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