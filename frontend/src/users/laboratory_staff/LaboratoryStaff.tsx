import { useCallback, useEffect, useState } from "react";
import api from "../../lib/axios";
import LaboratoryRequests from "./pages/LaboratoryRequests";
import SideBar from "./components/SideBar";
import { useSearchParams } from "react-router";
import LabstaffDashboard from "./pages/LabstaffDashbaord";
import LaboratoryResults from "./pages/LaboratoryResults";

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

function LaboratoryStaff() {
  const [open, setOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const page = searchParams.get("page") ?? "dashboard";
  function setPage(newPage: string) {
    setSearchParams({ page: newPage });
  }

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/api/labstaff/laboratory-requests");

      setLabRequests(response.data ?? []);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to fetch laboratory requests.";
      setError(message);
      setLabRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  return (
    <div className="flex min-h-screen cursor-default">
      <SideBar open={open} page={page} setPage={setPage} />
      {page === "dashboard" && <LabstaffDashboard />}

      {page === "laboratory-requests" && (
        <LaboratoryRequests
          open={open}
          setOpen={setOpen}
          requests={labRequests}
          loading={loading}
          error={error}
          loadData={() => loadData()}
        />
      )}

      {page === "laboratory-results" && <LaboratoryResults />}
    </div>
  );
}

export default LaboratoryStaff;
