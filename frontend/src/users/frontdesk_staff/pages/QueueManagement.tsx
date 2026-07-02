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
type QueueManagementProps = {
    queue: queue;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData: () => Promise<void>;
};
function QueueManagement({ queue, open, setOpen, loadData }: QueueManagementProps) {
    return (
        <div>
            queue management    
            </div>
    )
}
export default QueueManagement