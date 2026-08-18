import { useState } from "react";

export type LaboratoryResult = {
  parameter: string;
  result: string;
  referenceRange: string;
  status: string;
};

type LaboratoryResultTableProps = {
  results: LaboratoryResult[];
  onChange: (parameter: string, field: "result" | "referenceRange" | "status", value: string) => void;
  onRelease: () => Promise<void>;
  onPrint: () => void;
  onSendToDoctor: () => Promise<void>;
  saving: boolean;
};

function LaboratoryResultTable({
  results,
  onChange,
  onRelease,
  onPrint,
  onSendToDoctor,
  saving,
}: LaboratoryResultTableProps) {
  const [message, setMessage] = useState<string | null>(null);

  const handleRelease = async () => {
    setMessage(null);

    try {
      await onRelease();
      setMessage("Laboratory results released successfully.");
    } catch {
      setMessage("Unable to release laboratory results.");
    }
  };

  const handleSendToDoctor = async () => {
    setMessage(null);

    try {
      await onSendToDoctor();
      setMessage("Laboratory results sent to doctor successfully.");
    } catch {
      setMessage("Unable to send laboratory results to doctor.");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-300 bg-white shadow-sm overflow-hidden">
      {/* Table title */}
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            Input Laboratory Result
          </h2>
          <p className="text-sm text-gray-500">
            Enter the laboratory findings for the selected patient.
          </p>
        </div>
      </div>

      {/* Feedback */}
      {message && (
        <div className="mx-5 mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {message}
        </div>
      )}

      {/* Result table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr className="bg-gray-100 border-b border-gray-200">
              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                Parameter
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                Result
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                Reference Range
              </th>

              <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {results.map((item) => (
              <tr key={item.parameter} className="hover:bg-gray-50">
                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  {item.parameter}
                </td>

                <td className="px-5 py-4">
                  <input
                    type="text"
                    value={item.result}
                    onChange={(event) =>
                      onChange(
                        item.parameter,
                        "result",
                        event.target.value,
                      )
                    }
                    placeholder="Enter result"
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-5 py-4">
                  <input
                    type="text"
                    value={item.referenceRange}
                    onChange={(event) =>
                      onChange(
                        item.parameter,
                        "referenceRange",
                        event.target.value,
                      )
                    }
                    placeholder="Reference range"
                    className="h-10 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </td>

                <td className="px-5 py-4">
                  <select
                    value={item.status}
                    onChange={(event) =>
                      onChange(
                        item.parameter,
                        "status",
                        event.target.value,
                      )
                    }
                    className="h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select</option>
                    <option value="Normal">Normal</option>
                    <option value="High">High</option>
                    <option value="Low">Low</option>
                    <option value="Critical">Critical</option>
                  </select>
                </td>
              </tr>
            ))}

            {results.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-10 text-center text-sm text-gray-500"
                >
                  No laboratory parameters available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 px-5 py-4">
        <button
          type="button"
          disabled={saving}
          onClick={handleRelease}
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Releasing..." : "Release"}
        </button>

        <button
          type="button"
          onClick={onPrint}
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600"
        >
          Print
        </button>

        <button
          type="button"
          disabled={saving}
          onClick={handleSendToDoctor}
          className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Sending..." : "Send To Doctor"}
        </button>
      </div>
    </div>
  );
}

export default LaboratoryResultTable;