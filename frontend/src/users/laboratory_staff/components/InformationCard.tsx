import React, { useEffect, useState } from "react";

type Patient = {
  id: number;
  patient_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  sex: string;
  contact_number: string;
  email: string;
  address: string;
  emergency_contact: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
};

type LabRequest = {
  id: number;
  request_id: string;
  consultation_id: string | null;
  patient_id: string;
  doctor_id: string | null;
  test_type: string;
  results: Record<string, unknown> | null;
  status: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
};

type InformationCardProps = {
  onClose: () => void;
  request_id: string | null;
  patient_id: string | null;
};

function InformationCard({
  onClose,
  request_id,
  patient_id,
}: InformationCardProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [labRequest, setLabRequest] = useState<LabRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log(request_id);
    console.log(patient_id);

    if (!request_id) return;

    let ignore = false;

    async function fetchData() {
      setLoading(true);
      try {
        if (!patient_id) {
          throw new Error("Missing patient id");
        }

        const [patientRes, labRes] = await Promise.all([
          fetch(`/api/labstaff/patients/${patient_id}`),
          fetch(`/api/labstaff/laboratory-requests/${request_id}`),
        ]);

        if (!patientRes.ok) {
          const body = await patientRes.json();
          throw new Error(
            body?.message || "Unable to fetch patient information.",
          );
        }
        if (!labRes.ok) {
          const body = await labRes.json();
          throw new Error(
            body?.message || "Unable to fetch laboratory request details.",
          );
        }

        const [patientData, labData] = await Promise.all([
          patientRes.json(),
          labRes.json(),
        ]);

        if (!ignore) {
          setPatient(patientData);
          setLabRequest(labData);
        }
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "Unable to fetch laboratory request details.";
        setError(message);
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      ignore = true;
    };
  }, [request_id, patient_id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* shadow/backdrop behind the card */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <main className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="fixed flex flex-col gap-5 h-full max-h-2/3 w-full max-w-6xl top-1/2 right-1/2 z-50 px-10 py-7 rounded-lg border bg-white p-4 shadow-xl translate-x-1/2 -translate-y-1/2">
          <div className="flex justify-between w-full">
            <h1 className="text-2xl font-bold">Information Card</h1>
            <div onClick={onClose}>
              {" "}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-7 w-7"
              >
                <path d="M6 6L18 18" />
                <path d="M18 6L6 18" />
              </svg>
            </div>
          </div>
          <div>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
            {loading ? (
              <div className="rounded-xl border border-gray-200 bg-gray-100 p-4 text-sm">
                Loading laboratory requests...
              </div>
            ) : patient && labRequest ? (
              <div className="flex w-full gap-6">
                <div className="w-1/3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <h1 className="text-lg font-semibold mb-3">
                    Patient Information
                  </h1>
                  <div className="space-y-2 text-sm text-slate-700">
                    <div>
                      <p className="font-semibold">Patient Name</p>
                      <p>
                        {patient.last_name} {patient.first_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">Patient ID</p>
                      <p>{patient.patient_id}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Date of Birth</p>
                      <p>{patient.date_of_birth}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Sex</p>
                      <p>{patient.sex}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Contact</p>
                      <p>{patient.contact_number}</p>
                    </div>
                    <div>
                      <p className="font-semibold">Email</p>
                      <p>{patient.email}</p>
                    </div>
                  </div>
                </div>
                <div className="w-2/3 rounded-xl border border-slate-200 bg-slate-50 p-4">
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
                </div>
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
