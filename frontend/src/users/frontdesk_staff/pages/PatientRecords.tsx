type FrontdeskDashboardProps = {
    billing: Bill;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData(): Promise<void>;
};
function PatientRecords() {
    return (
        <main className="flex-1 min-w-0 p-6">
            <h1>Patient Records</h1>
        </main>
    )
}
export default PatientRecords