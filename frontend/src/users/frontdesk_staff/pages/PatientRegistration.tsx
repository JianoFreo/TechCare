import { useEffect, useState } from "react";
import Header from "../components/Header";
import api from "../../../lib/axios";
import IdCard from "./components/IdCard";
// type Patient = {
//     patient_id: string;
//     first_name: string;
//     last_name: string;
//     middle_initial?: string;
//     date_of_birth: string;
//     sex: string;
//     contact_number: string;
//     email: string;
//     address: string;
//     emergency_contact: string;
//     image_url?: string;
//     created_at: string;
//     updated_at: string;
// }[];

type PatientRegistrationProps = {
    // patients: Patient[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function PatientRegistration({
    // patients,
    open,
    setOpen,
    loadData,
}: PatientRegistrationProps) {
    const [first_name, setFirst_name] = useState("");
    const [last_name, setLast_name] = useState("");
    const [date_of_birth, setDate_of_birth] = useState("");
    const [sex, setSex] = useState("");
    const [contact_number, setContact_number] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [emergency_contact, setEmergency_contact] = useState("");
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>("");

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];

        if (!file) return;

        // If there was an old preview, free its memory before creating a new one.
        // This DOES NOT delete the user's file.
        if (preview) {
            URL.revokeObjectURL(preview);
        }

        // Save the file for uploading later.
        setImage(file);

        // Create a temporary blob URL so <img> can display the image immediately.
        setPreview(URL.createObjectURL(file));
    }
    useEffect(() => {
        // This cleanup runs when:
        // 1. The component is removed from the page, OR
        // 2. The effect runs again because 'preview' changed.
        //
        // It revokes the PREVIOUS blob URL, not the current one being displayed.
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    // const [images, setImages] = useState<File[]>([]);  // iif you are going to upload multiple files

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const formData = new FormData();

        formData.append("first_name", first_name);
        formData.append("last_name", last_name);
        formData.append("date_of_birth", date_of_birth);
        formData.append("sex", sex);
        formData.append("contact_number", contact_number);
        formData.append("email", email);
        formData.append("address", address);
        formData.append("emergency_contact", emergency_contact);

        if (image) {
            formData.append("image", image); // Must match upload.single("image")
        }
        // images.forEach((image) => {  // if you are going to upload multiple files
        //     formData.append("images", image); // Must match upload.array("images")
        // });

        try {
            const response = await api.post(
                "/api/fdstaff/patients",
                formData
            );
            alert("Patient registered successfully!" + response.data.message);
            // Reset form fields
            setFirst_name("");
            setLast_name("");
            setDate_of_birth("");
            setSex("");
            setContact_number("");
            setEmail("");
            setAddress("");
            setEmergency_contact("");
            setImage(null);
            // setImages([]);  // if you are going to upload multiple files
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Patient Registration"
            />

            <h1>Patient Registration</h1>

            <div className="flex justify-around">
                {/* FORM */}
                <form
                    className="flex flex-col w-100 space-y-4"
                    onSubmit={handleSubmit}
                >
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
                        type="date"
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

                    {/* FILE */}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                    />
                    {/* If you are going to upload multiple files */}
                    {/* <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                            if (e.target.files) {
                                setImages(Array.from(e.target.files));
                            }
                        }}
                    /> */}

                    <button
                        type="submit"
                        className="bg-blue-500 text-white p-2 rounded"
                    >
                        Register Patient
                    </button>
                </form>

                {/* PREVIEW CARD */}
                <IdCard
                    preview={preview}
                    first_name={first_name}
                    last_name={last_name}
                    date_of_birth={date_of_birth}
                    sex={sex}
                    contact_number={contact_number}
                    emergency_contact={emergency_contact}
                    email={email}
                    address={address}
                />
            </div>
        </main>
    );
}
export default PatientRegistration;