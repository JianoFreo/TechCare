import Header from "../components/Header";

type Bill = {
    bill_id: number;
    patient_id: number;
    discount_pct: number;
    total_amount: number;
    payment_method: string;
    status: string;
    receipt_id: string;
    billed_at: string;
}[];
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

type queue = {
    queue_id: number;
    patient_id: number;
    queue_number: number;
    doctor_id: number;
    service_type: string;
    status: string;
    created_at: string;
    updated_at: string;
}[];

type FrontdeskDashboardProps = {
    billing: Bill;
    patients: Patient;
    queue: queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function FrontdeskDashboard({ billing, patients, queue, open, setOpen, loadData }: FrontdeskDashboardProps) {
    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Frontdesk Dashboard"
            />
            <div className="grid grid-cols-4 gap-4">
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Patients in Queue</h2>
                    <p className="text-2xl">{queue.filter((q) => q.status === "Waiting").length}</p>
                </div>
                <div className="bg-white p-4  shadow">
                    <h2 className="text-lg font-semibold mb-2">Registered Today</h2>
                    <p className="text-2xl">{patients.filter((p) => p.created_at === new Date().toISOString().split('T')[0]).length}</p>
                </div>
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Total Queue</h2>
                    <p className="text-2xl">{queue.length}</p>
                </div>
                <div className="bg-white p-4 shadow">
                    <h2 className="text-lg font-semibold mb-2">Pending Bill</h2>
                    <p className="text-2xl">{billing.filter((bill) => bill.status === "unpaid").length}</p>
                </div>
            </div>
            <div className="mt-4 border">
                <h1 className="flex justify-center mt-7 text-3xl">
                    <strong>Queue Status Overview</strong>
                </h1>                <div className="border grid grid-cols-4 gap-4 m-7 p-3">
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Patients in Queue</h2>
                        <p className="text-2xl">{queue.filter((q) => q.status === "Waiting").length}</p>
                    </div>
                    <div className="bg-white p-4  shadow">
                        <h2 className="text-lg font-semibold mb-2">Registered Today</h2>
                        <p className="text-2xl">{patients.filter((p) => p.created_at === new Date().toISOString().split('T')[0]).length}</p>
                    </div>
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Total Queue</h2>
                        <p className="text-2xl">{queue.length}</p>
                    </div>
                    <div className="bg-white p-4 shadow">
                        <h2 className="text-lg font-semibold mb-2">Pending Bill</h2>
                        <p className="text-2xl">{billing.filter((bill) => bill.status === "unpaid").length}</p>
                    </div>
                </div>
            </div>

        </main>
    )
}
export default FrontdeskDashboard;

// import { useRef, useState } from "react";
// import html2canvas from "html2canvas";
// import Header from "../components/Header";
// import api from "../../../lib/axios";

// type Patient = {
//     patient_id: string;         // VARCHAR(30) e.g. P-2026-0513-001
//     first_name: string;
//     last_name: string;
//     middle_initial?: string;
//     date_of_birth: string;
//     sex: string;
//     contact_number: string;
//     email: string;
//     address: string;
//     emergency_contact: string;
//     qr_code?: string;
//     created_at: string;
//     updated_at: string;
// }[];

// type PatientRegistrationProps = {
//     patients: Patient[];
//     open: boolean;
//     setOpen: React.Dispatch<React.SetStateAction<boolean>>;
//     loadData: () => Promise<void>;
// };

// function PatientRegistration({ patients, open, setOpen, loadData }: PatientRegistrationProps) {
//     const [first_name, setFirst_name] = useState("");
//     const [last_name, setLast_name] = useState("");
//     const [middle_initial, setMiddle_initial] = useState("");
//     const [date_of_birth, setDate_of_birth] = useState("");
//     const [sex, setSex] = useState("");
//     const [contact_number, setContact_number] = useState("");
//     const [email, setEmail] = useState("");
//     const [address, setAddress] = useState("");
//     const [emergency_contact, setEmergency_contact] = useState("");
//     const [preview, setPreview] = useState("");
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     const cardRef = useRef<HTMLDivElement>(null);

//     function resetForm() {
//         setFirst_name("");
//         setLast_name("");
//         setMiddle_initial("");
//         setDate_of_birth("");
//         setSex("");
//         setContact_number("");
//         setEmail("");
//         setAddress("");
//         setEmergency_contact("");
//         setPreview("");
//         setError("");
//     }

//     async function handleSubmit(e: React.FormEvent) {
//         e.preventDefault();
//         setError("");

//         if (!cardRef.current) return;

//         setLoading(true);
//         try {
//             // Screenshot the ID card and send it as qr_code / patient photo
//             const canvas = await html2canvas(cardRef.current);
//             const blob = await new Promise<Blob | null>((resolve) =>
//                 canvas.toBlob(resolve, "image/png")
//             );
//             if (!blob) throw new Error("Failed to generate ID card image");

//             const idImage = new File([blob], "patient-id.png", { type: "image/png" });

//             const formData = new FormData();
//             formData.append("first_name", first_name);
//             formData.append("last_name", last_name);
//             formData.append("middle_initial", middle_initial);
//             formData.append("date_of_birth", date_of_birth);
//             formData.append("sex", sex);
//             formData.append("contact_number", contact_number);
//             formData.append("email", email);
//             formData.append("address", address);
//             formData.append("emergency_contact", emergency_contact);
//             formData.append("image", idImage);

//             const response = await api("/api/fdstaff", {
//                 method: "POST",
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const data = await response.json();
//                 throw new Error(data?.message ?? "Registration failed");
//             }

//             resetForm();
//             await loadData();
//         } catch (err: any) {
//             setError(err.message ?? "Something went wrong");
//         } finally {
//             setLoading(false);
//         }
//     }

//     // Derive the next patient ID for preview from the current patients list
//     const nextId = `P-${new Date().getFullYear()}-${String(patients.length + 1).padStart(3, "0")}`;

//     return (
//         <main className="flex-1 min-w-0 p-6">
//             <Header
//                 open={open}
//                 setOpen={setOpen}
//                 loadData={loadData}
//                 page="Patient Registration"
//             />

//             <h1 className="text-3xl font-bold mb-8">Patient Registration</h1>

//             <div className="flex justify-center items-start gap-10">

//                 <form
//                     onSubmit={handleSubmit}
//                     className="flex flex-col gap-4 w-112.5 border rounded-lg p-6 shadow-md"
//                 >
//                     <h2 className="text-2xl font-semibold mb-2">Patient Registration</h2>

//                     {error && (
//                         <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded p-2">
//                             {error}
//                         </p>
//                     )}

//                     <p className="font-medium">First Name</p>
//                     <input
//                         required
//                         className="border p-2"
//                         placeholder="First name"
//                         type="text"
//                         onChange={(e) => setFirst_name(e.target.value)}
//                         value={first_name}
//                     />

//                     <p className="font-medium">Last Name</p>
//                     <input
//                         required
//                         className="border p-2"
//                         placeholder="Last name"
//                         type="text"
//                         onChange={(e) => setLast_name(e.target.value)}
//                         value={last_name}
//                     />

//                     <p className="font-medium">Middle Initial</p>
//                     <input
//                         className="border p-2"
//                         placeholder="M"
//                         maxLength={1}
//                         type="text"
//                         onChange={(e) => setMiddle_initial(e.target.value)}
//                         value={middle_initial}
//                     />

//                     <p className="font-medium">Date of Birth</p>
//                     <input
//                         required
//                         className="border p-2"
//                         type="date"
//                         onChange={(e) => setDate_of_birth(e.target.value)}
//                         value={date_of_birth}
//                     />

//                     <p className="font-medium">Sex</p>
//                     <select
//                         required
//                         className="border p-2"
//                         onChange={(e) => setSex(e.target.value)}
//                         value={sex}
//                     >
//                         <option value="" disabled>Select sex</option>
//                         <option value="Male">Male</option>
//                         <option value="Female">Female</option>
//                         <option value="Other">Other</option>
//                     </select>

//                     <p className="font-medium">Contact Number</p>
//                     <input
//                         required
//                         className="border p-2"
//                         placeholder="Contact number"
//                         type="text"
//                         onChange={(e) => setContact_number(e.target.value)}
//                         value={contact_number}
//                     />

//                     <p className="font-medium">Email</p>
//                     <input
//                         className="border p-2"
//                         placeholder="Email"
//                         type="email"
//                         onChange={(e) => setEmail(e.target.value)}
//                         value={email}
//                     />

//                     <p className="font-medium">Address</p>
//                     <input
//                         className="border p-2"
//                         placeholder="Address"
//                         type="text"
//                         onChange={(e) => setAddress(e.target.value)}
//                         value={address}
//                     />

//                     <p className="font-medium">Emergency Contact</p>
//                     <input
//                         className="border p-2"
//                         placeholder="Emergency contact"
//                         type="text"
//                         onChange={(e) => setEmergency_contact(e.target.value)}
//                         value={emergency_contact}
//                     />

//                     <p className="font-medium">Patient Photo</p>
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={(e) => {
//                             const file = e.target.files?.[0];
//                             if (!file) return;
//                             setPreview(URL.createObjectURL(file));
//                         }}
//                     />

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="bg-gray-200 p-2 mt-4 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
//                     >
//                         {loading ? "Registering..." : "Register Patient"}
//                     </button>
//                 </form>

//                 {/* ID Card Preview */}
//                 <div
//                     ref={cardRef}
//                     className="w-[500px] rounded-2xl overflow-hidden shadow-xl border bg-white"
//                 >
//                     <div className="bg-blue-700 text-white px-5 py-3 flex justify-between items-center">
//                         <div>
//                             <h2 className="text-lg font-bold">TECHCARE</h2>
//                             <p className="text-xs tracking-wider">PATIENT IDENTIFICATION CARD</p>
//                         </div>
//                         <div className="text-right text-[10px]">
//                             <p>ReynaG Clinic</p>
//                             <p>Since 2026</p>
//                         </div>
//                     </div>

//                     <div className="flex p-5 gap-5">
//                         <div className="w-32 flex flex-col items-center">
//                             {preview ? (
//                                 <img
//                                     src={preview}
//                                     alt="Patient"
//                                     className="w-28 h-36 rounded-lg border object-cover"
//                                 />
//                             ) : (
//                                 <div className="w-28 h-36 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-400">
//                                     PHOTO
//                                 </div>
//                             )}
//                             <p className="text-xs mt-2 text-gray-500">Patient Photo</p>
//                         </div>

//                         <div className="flex-1 text-sm">
//                             <div className="mb-3">
//                                 <p className="text-gray-500 text-xs">FULL NAME</p>
//                                 <p className="font-bold text-xl">
//                                     {first_name || "—"}{" "}
//                                     {middle_initial ? `${middle_initial}. ` : ""}
//                                     {last_name}
//                                 </p>
//                             </div>

//                             <div className="grid grid-cols-2 gap-y-2 gap-x-4">
//                                 <div>
//                                     <p className="text-gray-500 text-xs">Birth Date</p>
//                                     <p>{date_of_birth || "—"}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 text-xs">Sex</p>
//                                     <p>{sex || "—"}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 text-xs">Contact</p>
//                                     <p>{contact_number || "—"}</p>
//                                 </div>
//                                 <div>
//                                     <p className="text-gray-500 text-xs">Emergency</p>
//                                     <p>{emergency_contact || "—"}</p>
//                                 </div>
//                                 <div className="col-span-2">
//                                     <p className="text-gray-500 text-xs">Email</p>
//                                     <p className="truncate">{email || "—"}</p>
//                                 </div>
//                                 <div className="col-span-2">
//                                     <p className="text-gray-500 text-xs">Address</p>
//                                     <p className="truncate">{address || "—"}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-gray-100 border-t px-5 py-2 flex justify-between items-center text-xs">
//                         <span className="font-semibold">ID #: {nextId}</span>
//                         <span className="text-gray-500">VALID PATIENT CARD</span>
//                     </div>
//                 </div>

//             </div>
//         </main>
//     );
// }

// export default PatientRegistration;
