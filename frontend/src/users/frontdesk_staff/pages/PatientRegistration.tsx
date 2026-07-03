import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import Header from "../components/Header";
import api from "../../../lib/axios";
type Patient = {
    patient_id: number;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    contact_number: string;
    email: string;
    address: string;
    emergency_contact: string;
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
    const [date_of_birth, setDate_of_birth] = useState("");
    const [contact_number, setContact_number] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [emergency_contact, setEmergency_contact] = useState("");
    const [image, setImage] = useState<File>();
    const [preview, setPreview] = useState("")
    const cardRef = useRef<HTMLDivElement>(null);
    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!cardRef.current) return;

        // Take a screenshot of the ID card
        const canvas = await html2canvas(cardRef.current);

        // Convert the canvas into a Blob
        const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, "image/png");
        });

        if (!blob) return;

        // Turn the Blob into a File
        const idImage = new File([blob], "patient-id.png", {
            type: "image/png",
        });

        const formData = new FormData();

        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("date_of_birth", date_of_birth);
        formData.append("contact_number", contact_number);
        formData.append("email", email);
        formData.append("address", address);
        formData.append("emergency_contact", emergency_contact);

        // Upload the generated ID card
        formData.append("image", idImage);

        const response = await api("/api/fdstaff", {
            method: "POST",
            body: formData,
        });

        const data = await response.json();
        console.log(data);
    }

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Patient Registration"
            />

            <h1 className="text-3xl font-bold mb-8">Patient Registration</h1>

            <div className="flex justify-center items-start gap-10">

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-4 w-112.5 border rounded-lg p-6 shadow-md"
                >
                    <h2 className="text-2xl font-semibold mb-2">Patient Registration</h2>

                    <p className="font-medium">First Name</p>
                    <input
                        className="border p-2"
                        placeholder="First name"
                        type="text"
                        onChange={(e) => setFirst_name(e.target.value)}
                        value={first_name}
                    />

                    <p className="font-medium">Last Name</p>
                    <input
                        className="border p-2"
                        placeholder="Last name"
                        type="text"
                        onChange={(e) => setLast_name(e.target.value)}
                        value={last_name}
                    />

                    <p className="font-medium">Date of Birth</p>
                    <input
                        className="border p-2"
                        type="date"
                        onChange={(e) => setDate_of_birth(e.target.value)}
                        value={date_of_birth}
                    />

                    <p className="font-medium">Contact Number</p>
                    <input
                        className="border p-2"
                        placeholder="Contact number"
                        type="text"
                        onChange={(e) => setContact_number(e.target.value)}
                        value={contact_number}
                    />

                    <p className="font-medium">Email</p>
                    <input
                        className="border p-2"
                        placeholder="Email"
                        type="text"
                        onChange={(e) => setEmail(e.target.value)}
                        value={email}
                    />

                    <p className="font-medium">Address</p>
                    <input
                        className="border p-2"
                        placeholder="Address"
                        type="text"
                        onChange={(e) => setAddress(e.target.value)}
                        value={address}
                    />

                    <p className="font-medium">Emergency Contact</p>
                    <input
                        className="border p-2"
                        placeholder="Emergency contact"
                        type="text"
                        onChange={(e) => setEmergency_contact(e.target.value)}
                        value={emergency_contact}
                    />

                    <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => {
                            if (!event.target.files) return;

                            const file = event.target.files[0];

                            // Save the file for uploading later
                            setImage(file);

                            // Create a temporary URL for previewing
                            setPreview(URL.createObjectURL(file));
                        }}
                    />
                    <button
                        type="submit"
                        className="bg-gray-200 p-2 mt-4 hover:bg-gray-300"
                    >
                        Register Patient
                    </button>
                </form>

                <div
                    ref={cardRef}
                    className="w-[500px] rounded-2xl overflow-hidden shadow-xl border bg-white"
                >

                    <div className="bg-blue-700 text-white px-5 py-3 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold">TECHCARE</h2>
                            <p className="text-xs tracking-wider">
                                PATIENT IDENTIFICATION CARD
                            </p>
                        </div>

                        <div className="text-right text-[10px]">
                            <p>ReynaG clinc</p>
                            <p>Since 2026</p>
                        </div>
                    </div>

                    <div className="flex p-5 gap-5">

                        <div className="w-32 flex flex-col items-center">

                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Patient"
                                    className="w-28 h-36 rounded-lg border object-cover"
                                />
                            ) : (
                                <div className="w-28 h-36 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400">
                                    PHOTO
                                </div>
                            )}

                            <p className="text-xs mt-2 text-gray-500">
                                Patient Photo
                            </p>

                        </div>

                        <div className="flex-1 text-sm">

                            <div className="mb-3">
                                <p className="text-gray-500 text-xs">FULL NAME</p>
                                <p className="font-bold text-xl">
                                    {first_name} {last_name}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 gap-x-4">

                                <div>
                                    <p className="text-gray-500 text-xs">Birth Date</p>
                                    <p>{date_of_birth || "-"}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-xs">Contact</p>
                                    <p>{contact_number || "-"}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-xs">Email</p>
                                    <p className="truncate">{email || "-"}</p>
                                </div>

                                <div>
                                    <p className="text-gray-500 text-xs">Emergency</p>
                                    <p>{emergency_contact || "-"}</p>
                                </div>

                            </div>

                            <div className="mt-3">
                                <p className="text-gray-500 text-xs">Address</p>
                                <p className="truncate">{address || "-"}</p>
                            </div>

                        </div>

                    </div>

                    <div className="bg-gray-100 border-t px-5 py-2 flex justify-between items-center text-xs">
                        <span className="font-semibold">
                            ID #: TC-000001
                        </span>

                        <span className="text-gray-500">
                            VALID PATIENT CARD
                        </span>
                    </div>

                </div>
            </div>
        </main>
    );
}

export default PatientRegistration;