import Header from "../components/Header"
type PatientRecordProps = {
    patients:number
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