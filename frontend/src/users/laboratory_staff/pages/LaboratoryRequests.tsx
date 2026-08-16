import { useState } from "react";
import Header from "../../../components/Header";
import InformationCard from "../components/InformationCard";
import RequestSummary from "../components/RequestSummary";
import LaboratoryRequestTable from "../components/LaboratoryRequestTable";

type LabRequest = {
  request_id: string;
  consultation_id: string | null;
  patient_id: string;
  doctor_id: string | null;
  test_type: string;
  results: Record<string, unknown> | null;
  status: string;
  requested_at: string;
  updated_at: string;
};

type LaboratoryRequestsProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  requests: LabRequest[];
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
};

function LaboratoryRequests({
  open,
  setOpen,
  requests,
  loading,
  error,
  loadData,
}: LaboratoryRequestsProps) {
  const [openInformationCard, setOpenInformationCard] = useState(false);
  const [requestIdCard, setRequestIdCard] = useState<string | null>(null);
  const [patientIdCard, setPatientIdCard] = useState<string | null>(null);

  return (
    <main className="flex-1 min-w-0 bg-white border-l border-gray-300">
      <Header
        page="Laboratory Requests"
        loading={loading}
        open={open}
        setOpen={setOpen}
        loadData={loadData}
      />
      <div className="px-6 overflow-x-auto flex flex-col space-y-6 z-0">
        <RequestSummary requests={requests} loading={loading} error={error} />
        <LaboratoryRequestTable />
        {openInformationCard && (
          <InformationCard
            onClose={() => setOpenInformationCard(false)}
            requestIdCard={requestIdCard}
            patientIdCard={patientIdCard}
          />
        )}
      </div>
    </main>
  );
}

export default LaboratoryRequests;
