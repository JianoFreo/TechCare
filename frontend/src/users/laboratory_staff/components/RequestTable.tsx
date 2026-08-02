import React from "react";

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

type RequestTableProps = {
  setRequestIdCard: React.Dispatch<React.SetStateAction<string | null>>;
  setPatientIdCard: React.Dispatch<React.SetStateAction<string | null>>;
  setOpenInformationCard: React.Dispatch<React.SetStateAction<boolean>>;
  requests: LabRequest[];
  status: RequestStatus;
  loading: boolean;
  error: string | null;
};

type RequestStatus = "In Queue" | "In Progress" | "Completed";

function RequestTable({
  setRequestIdCard,
  setPatientIdCard,
  setOpenInformationCard,
  requests,
  status,
  loading,
  error,
}: RequestTableProps) {
  const buttonText: Record<RequestStatus, string> = {
    "In Queue": "Accept",
    "In Progress": "Mark as done",
    Completed: "Input Results",
  };
  const handleCardClick = (request_id: string, patient_id: string) => {
    setOpenInformationCard(true);
    setRequestIdCard(request_id);
    setPatientIdCard(patient_id);
  };
  const label = buttonText[status];

  return (
    <>
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-sm">
          Loading {status} laboratory requests...
        </div>
      ) : requests.filter((request) => request.status === status).length ===
        0 ? (
        <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-sm">
          No laboratory requests found.
        </div>
      ) : (
        <div className="overflow-y-auto rounded-md border border-gray-200">
          <table className="w-full table-fixed overflow-y-auto divide-y divide-gray-200">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-center text-sm bg-gray-100">
                  Request ID
                </th>
                <th className="px-3 py-2 text-center text-sm  bg-gray-100">
                  Patient ID
                </th>
                <th className="px-3 py-2 text-center text-sm  bg-gray-100">
                  Doctor ID
                </th>
                <th className="px-3 py-2 text-center text-sm  bg-gray-100">
                  Test Type
                </th>
                <th className="px-3 py-2 text-center text-sm  bg-gray-100">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {requests
                .filter((request) => request.status === status)
                .map((request) => (
                  <tr key={request.request_id} className="hover:bg-gray-50">
                    <td
                      className="px-4 py-3 text-center cursor-pointer"
                    >
                      {request.request_id}
                    </td>
                    <td
                      className="px-4 py-3 text-center cursor-pointer"
                    >
                      {request.patient_id}
                    </td>
                    <td
                      className="px-4 py-3 text-center cursor-pointer"
                    >
                      {request.doctor_id ?? "N/A"}
                    </td>
                    <td
                      className="px-4 py-3 text-center cursor-pointer"
                    >
                      {request.test_type}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button className="cursor-pointer px-2 py-1 border-[1px] border-gray-400 transition-all duration-300 hover:scale-105 hover:bg-gray-200"
                        onClick={() =>
                          handleCardClick(request.request_id, request.patient_id)
                        }
                      >
                        View
                      </button>
                      <button className="cursor-pointer px-2 py-1 border-[1px] border-gray-400 transition-all duration-300 hover:scale-105 hover:bg-gray-200">
                        {label}
                      </button>
                      {status === "In Queue" ? (
                        <button className="cursor-pointer px-2 py-1 border-[1px] border-gray-400 transition-all duration-300 hover:scale-105 hover:bg-gray-200">
                          Cancel
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default RequestTable;
