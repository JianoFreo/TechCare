import { useState } from "react";
import Header from "../components/Header";
import RequestTable from "../components/RequestTable";
import InformationCard from "../components/InformationCard";
import RequestSummary from "../components/RequestSummary";

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
    <main className="flex-1 min-w-0 bg-white">
      <Header
        page="Laboratory Requests"
        loading={loading}
        open={open}
        setOpen={setOpen}
        loadData={loadData}
      />
      <div className="px-6 mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <RequestSummary requests={requests} loading={loading} error={error} />
      </div>
      <div className="px-6 overflow-x-auto flex flex-col space-y-6 z-0">
        <div className="px-4 py-3 rounded-lg shadow-md bg-white">
          <h1 className="text-xl font-semibold mb-2">In Progress</h1>
          <RequestTable
            setOpenInformationCard={setOpenInformationCard}
            setPatientIdCard={setPatientIdCard}
            setRequestIdCard={setRequestIdCard}
            requests={requests}
            status="In Progress"
            error={error}
            loading={loading}
          />
        </div>
        <div className="px-4 py-3 rounded-lg shadow-md bg-white">
          <h1 className="text-xl font-semibold mb-2">In Queue</h1>
          <RequestTable
            setOpenInformationCard={setOpenInformationCard}
            setPatientIdCard={setPatientIdCard}
            setRequestIdCard={setRequestIdCard}
            requests={requests}
            status="In Queue"
            error={error}
            loading={loading}
          />
        </div>
        <div className="px-4 py-3 rounded-lg shadow-md bg-white">
          <h1 className="text-xl font-semibold mb-2">Completed</h1>
          <RequestTable
            setOpenInformationCard={setOpenInformationCard}
            setPatientIdCard={setPatientIdCard}
            setRequestIdCard={setRequestIdCard}
            requests={requests}
            status="Completed"
            error={error}
            loading={loading}
          />
        </div>
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
