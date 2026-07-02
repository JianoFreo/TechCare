import Header from "../components/Header";
type Bill = {
    billing_id: number;
    patient_id: number;
    discount_pct: number;
    total_amount: number;
    payment_method: string;
    status: string;
    receipt_id: string;
    billed_at: string;
}[];

type BillingProps = {
    billing: Bill;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    loadData(): Promise<void>;
};
function Billing({ billing, open, setOpen, loadData }: BillingProps) {
    return (
        <main className="flex-1 min-w-0 p-6">
            <Header
                open={open}
                setOpen={setOpen}
                loadData={loadData}
                page="Billing"
            />
        </main>

    )
}
export default Billing