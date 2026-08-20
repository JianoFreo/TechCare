// import { useState } from "react";
import Header from "../../../components/Header";
// import InformationCard from "../components/LaboratoryRequests/InformationCard";
import RequestSummary from "../components/LaboratoryRequests/RequestSummary";
import LaboratoryQueuePanel from "../components/LaboratoryRequests/LaboratoryQueuePanel";
import { useState } from "react";

// type LabRequest = {
//   request_id: string;
//   consultation_id: string | null;
//   patient_id: string;
//   doctor_id: string | null;
//   test_type: string;
//   results: Record<string, unknown> | null;
//   status: string;
//   requested_at: string;
//   updated_at: string;
// };

type Queue = {
  id: number;
  queue_id: string;
  patient_id: string;
  queue_number: number;
  service_id: string;
  is_priority: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

type Service = {
  id: number;
  service_id: string;
  service_name: string;
  service_type: string;
  price: number;
  active: boolean;
  room: string;
};

type LaboratoryRequestsProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  queues: Queue[];
  services: Service[];
  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>;
  room: string;
};

function LaboratoryRequests({
  open,
  setOpen,
  queues,
  services,
  loading,
  error,
  loadData,
  room,
}: LaboratoryRequestsProps) {
  // const [openInformationCard, setOpenInformationCard] = useState(false);
  // const [requestIdCard, setRequestIdCard] = useState<string | null>(null);
  // const [patientIdCard, setPatientIdCard] = useState<string | null>(null);
  const [openQueueID, setOpenQueueID] = useState<string | null>(null);

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
        <RequestSummary queues={queues} services={services} room={room} />
        <LaboratoryQueuePanel
          queues={queues}
          services={services}
          loading={loading}
          error={error}
          setOpenQueueID={setOpenQueueID}
          openQueueID={openQueueID}
        />
        {/* {openInformationCard && (
          // <InformationCard
          //   onClose={() => setOpenInformationCard(false)}
          //   // requestIdCard={requestIdCard}
          //   // patientIdCard={patientIdCard}
          // />
        )} */}
      </div>
    </main>
  );
}

export default LaboratoryRequests;
