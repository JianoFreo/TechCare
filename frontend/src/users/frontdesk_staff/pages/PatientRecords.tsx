import { useState } from "react";
import Header from "../components/Header";

type Patient = {
    patient_id: string;
    first_name: string;
    last_name: string;
    middle_initial?: string;
    date_of_birth: string;
    sex: string;
    contact_number: string;
    email: string;
    address: string;
    emergency_contact: string;
    image_url?: string;
    created_at: string;
    updated_at: string;
};

type PatientRecordProps = {
    patients: Patient[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};

function PatientRecords({
    patients,
    open,
    setOpen,
    loadData,
}: PatientRecordProps) {
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

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
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
                                    {patient.middle_initial
                                        ? `${patient.middle_initial}. `
                                        : ""}
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
        </main>
    );
}

export default PatientRecords;
