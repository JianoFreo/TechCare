import { ChevronDown } from "lucide-react";
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

// type RequestItem = {
//   lab_item_id: string;
//   request_id: string;
//   service_id: string;
//   queue_id: string | null;
//   status: string;
//   created_at: string;
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

type MainFilter =
  | "All"
  | "Waiting"
  | "Priority"
  | "In Progress"
  | "Completed"
  | "Skipped";

type RequestTableProps = {
  // setRequestIdCard: React.Dispatch<React.SetStateAction<string | null>>;
  // setPatientIdCard: React.Dispatch<React.SetStateAction<string | null>>;
  // setOpenInformationCard: React.Dispatch<React.SetStateAction<boolean>>;
  queues: Queue[];
  loading: boolean;
  error: string | null;
};

function LaboratoryRequestTable({ queues, loading, error }: RequestTableProps) {
  const [activeMainFilter, setActiveMainFilter] = useState<MainFilter>("All");

  const mainFilters: {
    label: string;
    value: MainFilter;
  }[] = [
    { label: "All", value: "All" },
    { label: "Waiting", value: "Waiting" },
    { label: "In Progress", value: "In Progress" },
    { label: "Completed", value: "Completed" },
    { label: "Skipped", value: "Skipped" },
  ];

  const filterQueues = queues.filter((queue) => {
    const matchesActiveMainFilter =
      activeMainFilter === "All" ||
      (activeMainFilter === "Waiting" && queue.status === "Waiting") ||
      (activeMainFilter === "In Progress" && queue.status === "In Progress") ||
      (activeMainFilter === "Completed" && queue.status === "Completed") ||
      (activeMainFilter === "Skipped" && queue.status === "Skipped");

    return matchesActiveMainFilter;
  });

  const mainFilterCounts = queues.reduce(
    (counts, queue) => {
      counts.All += 1;

      if (queue.is_priority) {
        counts.Priority += 1;
      }

      if (queue.status === "Waiting") {
        counts.Waiting += 1;
      }

      if (queue.status === "In Progress") {
        counts["In Progress"] += 1;
      }

      if (queue.status === "Completed") {
        counts.Completed += 1;
      }

      if (queue.status === "Skipped") {
        counts.Skipped += 1;
      }

      return counts;
    },
    {
      All: 0,
      Waiting: 0,
      Priority: 0,
      "In Progress": 0,
      Completed: 0,
      Skipped: 0,
    },
  );

  return (
    <div className="w-full min-h-20 border rounded-3xl border-gray-300 flex flex-col gap-5 items-center justify-around">
      {/* MAIN FILTERS */}
      <div className="flex w-full justify-around h-10 items-end border-b border-gray-300">
        {mainFilters.map((mainFilter) => (
          <button
            key={mainFilter.value}
            type="button"
            onClick={() => setActiveMainFilter(mainFilter.value)}
            className={`px-5 py-1 text-sm ${
              activeMainFilter === mainFilter.value
                ? "text-blue-600 border-blue-600 border-b"
                : "text-gray-900"
            }`}
          >
            {mainFilter.label} ({mainFilterCounts[mainFilter.value]})
          </button>
        ))}
      </div>
      {/* SEARCH BAR AND ADDITIONAL FILTERS */}
      <div className="flex w-full items-center justify-start gap-3 px-5">
        <input
          type="text"
          placeholder="Search..."
          className="w-full max-w-56 border rounded-lg px-3 py-1"
        />
        <div className="flex border rounded-lg px-3 py-1 items-center justify-around">
          <h2>Priority</h2>
          <ChevronDown size={20} />
        </div>
        <div className="flex border min-w-36 rounded-lg px-3 py-1 items-center justify-around">
          <h2>Services: All</h2>
          <ChevronDown size={20} />
        </div>
        <div className="flex border min-w-44 rounded-lg px-3 py-1 items-center justify-around">
          <h2>Sort By: Newest</h2>
          <ChevronDown size={20} />
        </div>
      </div>
      {/* TABLE HEADERS */}
      {error ? (
        <div className=" border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className=" border border-gray-200 bg-gray-100 p-4 text-sm">
          Loading {activeMainFilter} laboratory queues...
        </div>
      ) : filterQueues.length === 0 ? (
        <div className="w-full text-center mb-8 border-gray-200 bg-gray-100 p-4 text-sm">
          No laboratory requests found.
        </div>
      ) : (
        <div className="mb-8">
          <table className="w-full table-fixed">
            <colgroup>
              <col className="w-1/40" />
              <col className="w-4/40" />
              <col className="w-8/40" />
              <col className="w-5/40" />
              <col className="w-5/40" />
              <col className="w-5/40" />
              <col className="w-12/40" />
            </colgroup>
            <thead className=" bg-gray-100">
              <tr>
                <th className="px-1 py-2"></th>
                <th className="px-1 py-2">Queue ID</th>
                <th className="px-1 py-2">Patient ID</th>
                <th className="px-1 py-2">Priority</th>
                <th className="px-1 py-2">Requested At</th>
                <th className="px-1 py-2">Status</th>
                <th className="px-1 py-2">Action</th>
              </tr>
            </thead>
            <tbody className="">
              {filterQueues.map((queue) => (
                <tr key={queue.id} className="border-b border-gray-300">
                  <td className="px-1 py-3  ">
                    <ChevronDown size={20} />
                  </td>
                  <td className="px-1 py-3 text-sm text-center ">
                    {queue.queue_id}
                  </td>
                  <td className="px-1 py-3 text-sm text-center ">
                    {queue.patient_id}
                  </td>
                  <td className="px-1 py-3 text-sm text-center ">
                    {queue.is_priority ? "Priority" : "Non-priority"}
                  </td>
                  <td className="px-1 py-3 text-sm text-center ">
                    {(() => {
                      const date = new Date(queue.created_at);
                      const h24 = date.getHours();
                      const m = date.getMinutes().toString().padStart(2, "0");
                      const suffix = h24 >= 12 ? "PM" : "AM";
                      const h12 = h24 % 12 || 12;
                      return `${h12}:${m} ${suffix}`;
                    })()}
                  </td>
                  <td className="px-1 py-3 text-sm text-center">
                    {queue.status}
                  </td>
                  <td className="px-1 py-3 flex items-center justify-center gap-3 ">
                    <button className="cursor-pointer px-4 py-2 text-xs rounded-sm border-2 border-blue-500 text-blue-500 transition-all duration-300 hover:scale-105 hover:bg-blue-100">
                      View
                    </button>
                    <button className="cursor-pointer px-4 py-2 text-xs  rounded-sm border-2 border-green-500 text-green-500 transition-all duration-300 hover:scale-105 hover:bg-green-100">
                      Accept
                    </button>
                    <button className="cursor-pointer px-4 py-2 text-xs rounded-sm border-2 border-yellow-500 text-yellow-500 transition-all duration-300 hover:scale-105 hover:bg-yellow-100">
                      Skip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default LaboratoryRequestTable;
