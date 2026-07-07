type Service = {
    id: number;
    service_id: string;
    service_name: string;
    service_type: string;
    price: number;
}[];

type SubmitNewQueueProps = {
    patientId: string | null;
    setPatientId: React.Dispatch<React.SetStateAction<string | null>>;
    services: Service;
    submitQueue: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    setServeQueueId: React.Dispatch<React.SetStateAction<string | null>>;
    setServiceName: React.Dispatch<React.SetStateAction<string | null>>;
    serviceId: string | null;
    isPriority: boolean;
    setIsPriority: React.Dispatch<React.SetStateAction<boolean>>;
    setServiceId: React.Dispatch<React.SetStateAction<string | null>>;

};

function SubmitNewQueue({ patientId, setPatientId, services, submitQueue, setServiceId, setServiceName, serviceId, isPriority, setIsPriority }: SubmitNewQueueProps) {
    return (
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
    )
}

export default SubmitNewQueue;