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

type RequestSummaryProps = {
  queues: Queue[];
  loading: boolean;
  error: string | null;
};

function RequestSummary({ queues, loading, error }: RequestSummaryProps) {
  const room = "Laboratory Room 1";
  const active = true;

  return (
    <div className="w-full h-52 border rounded-3xl border-gray-300 flex items-center justify-around">
      <div className="flex gap-7">
        <div className="w-24 h-24 bg-blue-100 rounded-full"></div>
        <div>
          <h3 className="text-lg text-gray-500">You are in</h3>
          <h1 className="text-3xl font-bold">{room}</h1>
          <div className="flex items-end gap-2 mt-2">
            <div
              className={`flex items-center rounded-sm px-5 py-1 text-xs border-2  ${
                active
                  ? "text-green-600 bg-green-100 border border-green-600"
                  : "text-red-600 bg-red-100 border border-red-600"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </div>
            <h6 className="text-xs text-gray-500">
              Last Update:{" "}
              {new Date().toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}{" "}
              {new Date().toLocaleDateString()}
            </h6>
          </div>
        </div>
      </div>
      <div className="border-l border-r border-gray-300 flex flex-col gap-5 px-5">
        <div className="flex gap-2">
          <h3>Services Offered in this Room:</h3>
          <h3 className="underline text-blue-400">View All Services</h3>
        </div>
        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <div className="text-blue-600 bg-blue-100 border border-blue-600 font-semibold px-9 py-1 rounded-sm">
              53
            </div>
            <h3 className="text-xs text-blue-600">All</h3>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-green-600 bg-green-100 border border-green-600 font-semibold px-9 py-1 rounded-sm">
              48
            </div>
            <h3 className="text-xs text-green-600">Active</h3>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="text-yellow-600 bg-yellow-100 border border-yellow-600 font-semibold px-9 py-1 rounded-sm">
              5
            </div>
            <h3 className="text-xs text-yellow-600">Inactive</h3>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-gray-600">Queue Summary</h3>
        <div className="flex items-center justify-around w-80">
          <div className="text-red-600 bg-red-100 border border-red-600 font-semibold w-16 h-16 rounded-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-red-600">1</h3>
            <h3 className="text-[10px]  font-light text-red-600">Priority</h3>
          </div>
          <div className="text-yellow-600 bg-yellow-100 border border-yellow-600 font-semibold w-16 h-16 rounded-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-yellow-600">3</h3>
            <h3 className="text-[10px] font-light text-yellow-600">
              In Progress
            </h3>
          </div>
          <div className="text-blue-600 bg-blue-100 border border-blue-600 font-semibold w-16 h-16 rounded-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-blue-600">7</h3>
            <h3 className="text-[10px]  font-light text-blue-600">Waiting</h3>
          </div>
          <div className="text-green-600 bg-green-100 border border-green-600 font-semibold w-16 h-16 rounded-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-green-600">10</h3>
            <h3 className="text-[10px]  font-light text-green-600">
              Completed
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestSummary;
