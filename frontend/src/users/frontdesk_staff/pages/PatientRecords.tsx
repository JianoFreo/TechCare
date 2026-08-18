// import { useState } from "react";
import { useState } from "react";

import api from "../../../lib/axios";
import EditPatientRecord from "../components/PatientRecords/EditPatientRecord";
import Header from "../../../components/Header";

// adjust path to wherever the file lives

type Patient = {
    id: number;
    patient_id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    sex: string;
    contact_number: string;
    email: string;
    address: string;
    emergency_contact: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
}[];

type PatientRecordProps = {
    patients: Patient;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
    loading: boolean;
};

function PatientRecords({
    patients,
    open,
    setOpen,
    loadData,
    loading
}: PatientRecordProps) {
    const [selectedPatient, setSelectedPatient] = useState<Patient[number] | null>(null);
    const [showEditPatient, setShowEditPatient] = useState(false);
    function calculateAge(dateOfBirth: string): number {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const hasHadBirthdayThisYear =
            today.getMonth() > birthDate.getMonth() ||
            (today.getMonth() === birthDate.getMonth() &&
                today.getDate() >= birthDate.getDate());

        if (!hasHadBirthdayThisYear) {
            age--;
        }

        return age;
    }
    async function handleDelete(patientId: string) {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this patient record?"
        );

        if (confirmDelete) {
            try {
                const response = await api.delete(`/api/fdstaff/patients/${patientId}`);
                alert(response.data.message);
                loadData(); // Refresh the data after deletion
            } catch (error) {
                console.error("Error deleting patient record:", error);
            }
        }
    }
    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                loading={loading}
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Patient Records"
            />

            <h1 className="text-2xl font-bold mb-6">Patient Records</h1>

            <div className="overflow-x-auto rounded-lg border shadow-sm">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-3 text-left">Patient IMAGE</th>
                            <th className="px-4 py-3 text-left">Patient ID</th>
                            <th className="px-4 py-3 text-left">Name</th>
                            <th className="px-4 py-3 text-left">Age</th>
                            <th className="px-4 py-3 text-left">Sex</th>
                            <th className="px-4 py-3 text-left">Contact</th>
                            <th className="px-4 py-3 text-left">Email</th>
                            <th className="px-4 py-3 text-left">Address</th>
                            <th className="px-4 py-3 text-left">
                                Emergency Contact
                            </th>
                            <th className="px-4 py-3 text-left">Actions</th>

                        </tr>
                    </thead>

                    <tbody>
                        {patients.map((patient) => (
                            <tr
                                key={patient.patient_id}
                                className="border-t hover:bg-gray-50"
                            >
                                <td className="px-4 py-3">
                                    <img
                                        src={patient.image_url}
                                        alt={`${patient.first_name} ${patient.last_name}`}
                                        className="w-16 h-16 object-cover"
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    {patient.patient_id}
                                </td>

                                <td className="px-4 py-3">
                                    {patient.first_name}{" "}
                                    {patient.last_name}
                                </td>

                                <td className="px-4 py-3">
                                    {calculateAge(patient.date_of_birth)}
                                </td>

                                <td className="px-4 py-3">{patient.sex}</td>

                                <td className="px-4 py-3">
                                    {patient.contact_number}
                                </td>

                                <td className="px-4 py-3">
                                    {patient.email}
                                </td>

                                <td className="px-4 py-3">
                                    {patient.address}
                                </td>

                                <td className="px-4 py-3">
                                    {patient.emergency_contact}
                                </td>
                                <td className="px-4 py-3 flex gap-2">
                                    <button
                                        className="border-2 p-1 cursor-pointer hover:bg-gray-200"
                                        onClick={() => {
                                            setSelectedPatient(patient);
                                            setShowEditPatient(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(patient.patient_id)}
                                        className="border-2 p-1 cursor-pointer hover:bg-gray-200">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}

                        {patients.length === 0 && (
                            <tr>
                                <td
                                    colSpan={8}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    No patient records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showEditPatient && (
                <EditPatientRecord
                    selectedPatient={selectedPatient}
                    onClose={() => setShowEditPatient(false)}
                    loadData={loadData}
                />
            )}
        </main>
    );
}

export default PatientRecords;