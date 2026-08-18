import Header from "../../../components/Header";
import AddService from "../components/ServicePricing/AddService"
import { useEffect, useState } from 'react'

type Service = {
    id: number;
    service_id: string;
    service_name: string;
    service_type: string;
    price: number;
    active: boolean
};
type ServicePricingProps = {
    services: Service[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData(): Promise<void>;
    loading: boolean;
};


function ServicePricing({ services, open, setOpen, loadData, loading }: ServicePricingProps) {
    const [search, setSearch] = useState("")
    const [showAddService, setShowAddService] = useState(false)
    const filteredService = services.filter((service) =>
        service.service_name.toLowerCase().includes(search.toLowerCase()) ||
        service.service_id.toString().toLowerCase().includes(search.toLowerCase())
    )
    useEffect(() => {
        loadData()
    }, [loadData])

    return (
        <div className="flex-1 p-6">
            <Header
                page="Service Pricing"
                loading={loading}
                open={open}
                setOpen={setOpen}
                loadData={loadData}
            />
            {showAddService && (
                <AddService
                    onClose={() => setShowAddService(false)}
                    loadData={loadData}
                />
            )}
            <div className="overflow-x-auto">
                <div className="mb-3">
                    <input
                        placeholder="Search for services"
                        className="border p-2 mr-3"
                        onChange={(e) => setSearch(e.target.value)}
                        value={search}
                    />
                    <button
                        className="bg-gray-200 p-2 hover:bg-gray-300 cursor-pointer"
                        onClick={() => setShowAddService(true)}
                    > Add service
                    </button>
                </div>
                <table className="min-w-1/3">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Service Name</th>
                            <th className="px-4 py-3 text-left">Service Type</th>
                            <th className="px-4 py-3 text-left">Price</th>
                            <th className="px-4 py-3 text-left">is active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredService.map((service) => (
                            <tr key={service.service_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">{service.service_id}</td>
                                <td className="px-4 py-3">{service.service_name}</td>
                                <td className="px-4 py-3">{service.service_type}</td>
                                <td className="px-4 py-3">{service.price}</td>
                                <td className="px-4 py-3">{service.active ? "ACTIVE " : "NOT ACTIVE"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default ServicePricing