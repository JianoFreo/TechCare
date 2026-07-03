import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import Header from "../components/Header";
import api from "../../../lib/axios";
import IdCard from "./components/IdCard";

type Patient = {
    patient_id: string;         // VARCHAR(30) e.g. P-2026-0513-001
    first_name: string;
    last_name: string;
    middle_initial?: string;
    date_of_birth: string;
    sex: string;
    contact_number: string;
    email: string;
    address: string;
    emergency_contact: string;
    qr_code?: string;
    created_at: string;
    updated_at: string;
}[];

type PatientRegistrationProps = {
    patients: Patient[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function PatientRegistration({ patients, open, setOpen, loadData }: PatientRegistrationProps) {
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [middle_initial, setMiddle_initial] = useState("");
    const [date_of_birth, setDate_of_birth] = useState("");
    const [sex, setSex] = useState("");
    const [contact_number, setContact_number] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [emergency_contact, setEmergency_contact] = useState("");


    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Patient Registration"
            />
            <h1>Patient Registration</h1>
            <div className="flex justify-between">
                <IdCard
                    first_name={first_name}
                    last_name={last_name}
                    date_of_birth={date_of_birth}
                    sex={sex}
                    contact_number={contact_number}
                    email={email}
                    address={address}
                    emergency_contact={emergency_contact}
                />
                <form className="flex flex-col space-y-4">
                    <input
                        className="border border-gray-300 p-2"
                        type="text"
                        placeholder="First Name"
                        value={first_name}
                        onChange={(e) => setFirst_name(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-2"
                        type="text"
                        placeholder="Last Name"
                        value={last_name}
                        onChange={(e) => setLast_name(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-2"
                        type="text"
                        placeholder="Middle Initial"
                        value={middle_initial}
                        onChange={(e) => setMiddle_initial(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-2"
                        type="date"
                        placeholder="Date of Birth"
                        value={date_of_birth}
                        onChange={(e) => setDate_of_birth(e.target.value)}
                    />
                    <select
                        className="border border-gray-300 p-2"
                        value={sex}
                        onChange={(e) => setSex(e.target.value)}
                    >
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <input
                        className="border border-gray-300 p-2"
                        type="text"
                        placeholder="Contact Number"
                        value={contact_number}
                        onChange={(e) => setContact_number(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-2"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-2"
                        type="text"
                        placeholder="Address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                    <input
                        className="border border-gray-300 p-2"
                        type="text"
                        placeholder="Emergency Contact"
                        value={emergency_contact}
                        onChange={(e) => setEmergency_contact(e.target.value)}
                    />
                </form>
            </div>
        </main>

    )
}
export default PatientRegistration;
