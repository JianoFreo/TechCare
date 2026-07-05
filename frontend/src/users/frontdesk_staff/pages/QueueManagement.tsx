import Header from "../components/Header";

type Queue = {
    queue_id: number;
    patient_id: number;
    queue_number: number;
    doctor_id: number;
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
    const today = new Date();

    const date = `${String(today.getMonth() + 1).padStart(2, "0")}-${String(
        today.getDate()
    ).padStart(2, "0")}`;

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Queue Management"
            />

            <h1 className="text-2xl font-bold mb-4">Queue Management</h1>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Queue Number
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Patient ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Service Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                Date
                            </th>
                        </tr>
                    </thead>

                    <tbody className="bg-white divide-y divide-gray-200">

                            <tr>
                                <td className="px-6 py-4">{}</td>
                                <td className="px-6 py-4">{}</td>
                                <td className="px-6 py-4">{}</td>
                                <td className="px-6 py-4">{}</td>
                                <td className="px-6 py-4">{}</td>
                            </tr>
                    </tbody>
                </table>
            </div>
        </main>
    );
}

export default QueueManagement;