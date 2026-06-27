import Header from "../components/Header";


type Service = {
    service_id: number;
    service_name: string;
    price: number;
};
type ServicePricingProps = {
    services: Service[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadServices: () => Promise<void>;
};

function ServicePricing({ services, open, setOpen, loadServices }: ServicePricingProps) {
    return  (
        <div className="flex-1 p-6">
            <Header
                page="Service Pricing"
                open={open}
                setOpen={setOpen}
                loadUsers={loadServices}
            />
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">ID</th>
                            <th className="px-4 py-3 text-left">Service Name</th>
                            <th className="px-4 py-3 text-left">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.service_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">{service.service_id}</td>
                                <td className="px-4 py-3">{service.service_name}</td>
                                <td className="px-4 py-3">{service.price}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
export default ServicePricing