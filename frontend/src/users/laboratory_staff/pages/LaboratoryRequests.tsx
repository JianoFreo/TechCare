import { useState } from "react";
import Header from "../components/Header";
import RequestTable from "../components/RequestTable";
import InformationCard from "../components/InformationCard";

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
    <main className="flex-1 min-w-0 p-6 bg-gray-100">
      <Header
        page="Laboratory Requests"
        loading={loading}
        open={open}
        setOpen={setOpen}
        loadData={loadData}
      />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Request List
            </h2>
            <h4 className="text-gray-500">
              Click laboratory request for more information
            </h4>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">
            Date: {new Date().toLocaleDateString()}
          </h2>
        </div>
      </div>
      <div className="overflow-x-auto flex flex-col space-y-6 z-0">
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
