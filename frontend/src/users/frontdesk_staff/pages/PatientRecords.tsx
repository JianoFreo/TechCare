import Header from "../components/Header"
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
type PatientRecordProps = {
    patients: Patient[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};
function PatientRecords({ patients, open, setOpen, loadData }: PatientRecordProps) {

    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Patient Records"
            />
            <h1>Patient Records</h1>
        </main>
    )
}
export default PatientRecords