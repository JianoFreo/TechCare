
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
type PatientRegistrationProps = {
    patients: Patient[];
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};
function PatientRegistration({ patients, open, setOpen, loadData }: PatientRegistrationProps) {
    return (
        <div>
            patient registry
        </div>
    )
}
export default PatientRegistration