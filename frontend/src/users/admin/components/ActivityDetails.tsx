type Props = {
    onClose: () => void;
    details: Record<string, unknown>;
};

function ActivityDetails({ onClose, details }: Props) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md -lg bg-white p-6 shadow-xl">
                <button
                    onClick={onClose}
                >
                            close
                </button>
                <table>
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">Time stamps</th>
                            <th className="px-4 py-3 text-left">User</th>

                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(details).map(([key, value]) => (
                            <tr>
                                <th className="px-4 py-3 text-center">{key}</th>
                                <th className="px-4 py-3 text-center">{String(value)}</th>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default ActivityDetails
