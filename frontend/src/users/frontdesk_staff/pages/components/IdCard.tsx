type IdCardProps = {
    patient_id?: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
    contact_number: string;
    email: string;
    address: string;
    emergency_contact: string;
};

function IdCard({
    patient_id,
    first_name,
    last_name,
    date_of_birth,
    sex,
    contact_number,
    email,
    address,
    emergency_contact,
}: IdCardProps) {
    return (
        <div
            className="w-72 h-44 shrink-0 border rounded-md text-xs bg-cover bg-center relative overflow-hidden"
            style={{
                backgroundImage:
                    "url('https://res.cloudinary.com/dulnrfnix/image/upload/v1783055549/Screenshot_2026-07-03_130459_mld24i.png')",
            }}
        >
            <div className="bg-blue-500 p-1.5">
                <h2 className="text-sm font-semibold text-white">
                    Patient ID Card
                </h2>
            </div>

            <div className="p-2 flex space-x-3 leading-tight">
                <div className="w-16 h-16 border bg-white/40"></div>

                <div className="space-y-1">
                    <p className="bg-white/70 px-1 rounded">
                        Patient ID: {patient_id}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        Name: {first_name} {last_name}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        DOB: {date_of_birth}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        Sex: {sex}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        Contact: {contact_number}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        Email: {email}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        Address: {address}
                    </p>

                    <p className="bg-white/70 px-1 rounded">
                        Emergency: {emergency_contact}
                    </p>
                </div>
            </div>
        </div>
    );
}
export default IdCard;