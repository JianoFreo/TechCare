import { useState } from 'react'
import api from '../../../lib/axios'
type Props = {
    onClose: () => void;
    loadData: () => void;
};
function AddService({ loadData, onClose }: Props) {
    const [serviceName, setServiceName] = useState<string>("")
    // const [serviceId, setServiceId] = useState<string>("")
    const [price, setPrice] = useState<number>(0)
    const addService = async () => {
        const response = await api.post("/api/admin/services", {

            service_name: serviceName,
            price
        })
        loadData()
        alert(response.data.message)
        onClose()
    }
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md -lg bg-white p-6 shadow-xl">
                <h2 className="text-2xl font-bold mb-4 flex justify-between">
                    Add new service
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border "
                    >
                        X
                    </button>
                </h2>

                <div className="space-y-4">
                    <input
                        type="text"
                        placeholder="service name"
                        className="w-full border p-2"
                        onChange={(e) => setServiceName(e.target.value)}
                        value={serviceName}
                    />

                    {/* <input
                        type="text"
                        placeholder="Full name"
                        className="w-full border p-2"
                        onChange={(e) => setServiceId(e.target.value)}
                        value={serviceId}


                    /> */}
                    <input
                        type="text"
                        placeholder="Contact Number"
                        className="w-full border p-2"
                        onChange={(e) => setPrice(Number(e.target.value))}
                        value={price}

                    />

                    <button className="px-4 py-2 bg-gray-200 hover:cursor-pointer hover:bg-gray-400"
                        onClick={() => addService()}>
                        {/* onClick={addService}> */}
                        add service
                    </button>
                </div>
            </div>
        </div>

    )


}
export default AddService