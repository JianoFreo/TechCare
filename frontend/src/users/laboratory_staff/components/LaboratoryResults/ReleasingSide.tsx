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

type ReleasingSideProps = {
  requests: LabRequest[];
  selectedRequestId: string | null;
  onSelect: (request: LabRequest) => void;
};

function ReleasingSide({
  requests,
  selectedRequestId,
  onSelect,
}: ReleasingSideProps) {
  
  const releasingRequests = requests.filter(
    (request) =>
      request.status === "Completed" ||
      request.status === "Lab Result",
  );

  return (
    <div className="w-full rounded-2xl border border-gray-300 bg-white shadow-sm lg:w-[300px]">
      {}
      <div className="border-b border-gray-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-700">
          RELEASING QUEUE ({releasingRequests.length})
        </h2>
      </div>

      {/* Queue */}
      <div className="max-h-[520px] overflow-y-auto p-3">
        {releasingRequests.length === 0 ? (
          <div className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500">
            No laboratory results ready for releasing.
          </div>
        ) : (
          <div className="space-y-2">
            {releasingRequests.map((request) => {
              const selected =
                selectedRequestId === request.request_id;

              return (
                <button
                  key={request.request_id}
                  type="button"
                  onClick={() => onSelect(request)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    selected
                      ? "border-sky-400 bg-sky-50 shadow-sm"
                      : "border-transparent bg-gray-50 hover:border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {request.patient_id}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {request.test_type}
                      </p>

                      <p className="mt-1 text-[11px] text-gray-400">
                        {new Date(
                          request.updated_at,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-semibold text-white">
                      Ready
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ReleasingSide;