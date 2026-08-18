import { useCallback, useEffect, useState } from "react";
import { LayoutGrid, ClipboardList, FileCheck } from "lucide-react";
import api from "../../lib/axios";
import LaboratoryRequests from "./pages/LaboratoryRequests";
import SideBar from "../../components/SideBar";
import { useSearchParams } from "react-router";
import LabstaffDashboard from "./pages/LabstaffDashbaord";
import LaboratoryResults from "./pages/LaboratoryResults";

type LabRequest = {
  id: number;
  request_id: string;
  consultation_id: string | null;
  patient_id: string;
  doctor_id: string | null;
  status: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
};

type RequestItem = {
  lab_item_id: string;
  request_id: string;
  service_id: string;
  queue_id: string | null;
  status: string;
  created_at: string;
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

function LaboratoryStaff() {
  const [open, setOpen] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
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
      const response = await api.get("/api/labstaff/queues");
      setQueues(response.data ?? []);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Unable to fetch laboratory queue.";
      setError(message);
      setQueues([]);
    } finally {
      setLoading(false);
    }
  }, []);
  const navItems = [
    {
      page: "dashboard",
      label: "Dashboard",
      icon: <LayoutGrid size={20} />,
    },
    {
      page: "laboratory-requests",
      label: "Laboratory Requests",
      icon: <ClipboardList size={20} />,
    },
    {
      page: "laboratory-results",
      label: "Laboratory Results",
      icon: <FileCheck size={20} />,
    },
  ];

  useEffect(() => {
    (async () => {
      await loadData();
    })();
  }, [loadData]);

  return (
    <div className="flex min-h-screen cursor-default">
      <SideBar open={open} page={page} setPage={setPage} navItems={navItems} />
      {page === "dashboard" && <LabstaffDashboard />}

      {page === "laboratory-requests" && (
        <LaboratoryRequests
          open={open}
          setOpen={setOpen}
          queues={queues}
          loading={loading}
          error={error}
          loadData={() => loadData()}
        />
      )}

      {page === "laboratory-results" && (
        <LaboratoryResults
          open={open}
          setOpen={setOpen}
          requests={labRequests}
          loading={loading}
          error={error}
          loadData={() => loadData()}
        />
      )}
    </div>
  );
}

export default LaboratoryStaff;
