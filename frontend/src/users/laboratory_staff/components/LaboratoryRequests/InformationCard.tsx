import { useEffect, useState } from "react";
import { X, UserRound } from "lucide-react";
import api from "../../../../lib/axios";

type LaboratoryRequestDetail = {
  request: {
    request_id: string;
    consultation_record_id: string | null;
    doctor_id: string | null;
    is_paid: boolean;
    is_priority: boolean;
    status: string;
    patient_id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    sex: string;
    email: string;
    contact_number: string;
    civil_status: string;
    blood_type: string | null;
    birthdate: string;
    emergency_contact_name: string | null;
    emergency_contact: string | null;
    requested_at: string;
    updated_at: string;
  };
  items: {
    lab_item_id: string;
    status: string;
    created_at: string;
    updated_at: string;
    service: {
      service_id: string;
      service_name: string;
      service_type: string;
      price: string;
      room: string;
    };
  }[];
};

type InformationCardProps = {
  onClose: () => void;
  queueIdCard: string | null;
};

function InformationCard({ onClose, queueIdCard }: InformationCardProps) {
  const [requestDetail, setRequestDetail] =
    useState<LaboratoryRequestDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    if (!queueIdCard) return;

    async function fetchLabRequestDetail() {
      setDetailLoading(true);
      setDetailError("");

      try {
        const labRequestDetailResponse = await api.get(
          `api/labstaff/laboratory-requests/${queueIdCard}`,
        );
        setRequestDetail(labRequestDetailResponse.data);
      } catch (err) {
        const message =
          (err as { response?: { data?: { message?: string } } })?.response
            ?.data?.message || "Unable to fetch data.";
        setDetailError(message);
        setRequestDetail(null);
      } finally {
        setDetailLoading(false);
      }
    }

    fetchLabRequestDetail();
  }, [queueIdCard]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* shadow/backdrop behind the card */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <main className="relative rounded-lg shadow-lg w-full max-w-lg">
        <div className="fixed flex flex-col h-full max-h-4/5 w-full max-w-6xl rounded-lg border bg-gray-300 shadow-xl top-1/2 right-1/2 z-50 translate-x-1/2 -translate-y-1/2 overflow-hidden">
          <div className="flex justify-between items-center w-full px-8 py-6 bg-white shadow-xs">
            <div className="flex items-center gap-5">
              <h1 className="text-2xl font-semibold">
                Laboratory Request -{requestDetail?.request.request_id}
              </h1>
              <div
                className={`border rounded-xl px-3 py-1 text-sm ${
                  requestDetail?.request.status === "Completed"
                    ? "text-green-600 bg-green-100 border-green-600"
                    : requestDetail?.request.status === "In Progress"
                      ? "text-yellow-600 bg-yellow-100 border-yellow-600"
                      : "text-blue-600 bg-blue-100 border-blue-600"
                } `}
              >
                {requestDetail?.request.status}
              </div>
              <div
                className={`border rounded-xl px-3 py-1 text-sm ${requestDetail?.request.is_priority ? "text-red-600 bg-red-100 border-red-600" : "text-blue-600 bg-blue-100 border-blue-600"}`}
              >
                {requestDetail?.request.is_priority
                  ? "Priority"
                  : "Non-priority"}
              </div>
            </div>
            <X size={20} onClick={onClose} className="cursor-pointer" />
          </div>
          <div className="px-5 py-3">
            {detailError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {detailError}
              </div>
            ) : null}
            {detailLoading ? (
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-sm">
                Loading laboratory requests...
              </div>
            ) : requestDetail ? (
              <div className="flex w-full gap-6">
                <div className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <UserRound size={20} />
                  <h1 className="text-lg font-semibold mb-3">
                    Patient Information
                  </h1>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div>
                      <p className="font-semibold">Patient Name</p>
                      <p>
                        {requestDetail.request.last_name}
                        {requestDetail.request.first_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Patient ID</p>
                      <p>{requestDetail.request.patient_id}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Date of Birth</p>
                      <p>{requestDetail.request.birthdate}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Sex</p>
                      <p>{requestDetail.request.sex}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Contact</p>
                      <p>{requestDetail.request.contact_number}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p>{requestDetail.request.email}</p>
                    </div>
                  </div>
                </div>
                {/* <div className="w-2/3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h1 className="text-lg font-semibold mb-3">
                    Laboratory Request Information
                  </h1>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div>
                      <p className="font-semibold">Request ID</p>
                      <p>{labRequest.request_id}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Test Type</p>
                      <p>{labRequest.test_type}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Status</p>
                      <p>{labRequest.status}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Requested At</p>
                      <p>
                        {new Date(labRequest.requested_at).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Doctor ID</p>
                      <p>{labRequest.doctor_id ?? "N/A"}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Results</p>
                      <p>
                        {labRequest.results
                          ? JSON.stringify(labRequest.results)
                          : "No results yet."}
                      </p>
                    </div>
                  </div>
                </div> */}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-sm text-slate-700">
                Select a request to view its patient and laboratory details.
              </div>
            )}
          </div>
        </div>
        <div></div>
      </main>
    </div>
  );
}

export default InformationCard;
