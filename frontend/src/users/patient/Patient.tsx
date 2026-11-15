import ErrorMessage from "../../components/ErrorMessage";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import {
  FileClock,
  FlaskConical,
  LayoutGrid,
  ListOrdered,
  Pill,
} from "lucide-react";
import Header from "../../components/Header";
import SideBar from "../../components/SideBar";
import { SidebarNavContext } from "../../components/sidebar/utils/sidebarNav";
import MedicalHistory from "./pages/MedicalHistory";
import Prescriptions from "./pages/Prescriptions";
import QueueTracking from "./pages/QueueTracking";
import PatientDashboard from "./pages/PatientDashboard";
import type { PatientSessionUser } from "../../interface/PatientPortal";

function readLoggedInPatient(): PatientSessionUser | null {
  const stored = sessionStorage.getItem("user");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as PatientSessionUser;
  } catch {
    return null;
  }
}

function Patient() {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => window.innerWidth >= 1024,
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const activePage = searchParams.get("page") ?? "dashboard";
  const consultationId = searchParams.get("consultation_id") ?? undefined;
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (
        document.visibilityState === "visible" &&
        !document.querySelector('[role="dialog"]')
      ) {
        setRefreshKey((current) => current + 1);
      }
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  const patient = useMemo(() => readLoggedInPatient(), []);
  const patientId = patient?.patient_id ?? patient?.user_id ?? "";

  const navItems = [
    { page: "dashboard", label: "Dashboard", icon: <LayoutGrid size={20} /> },
    {
      page: "queue-tracking",
      label: "Queue Tracking",
      icon: <ListOrdered size={20} />,
    },
    {
      page: "laboratory-results",
      label: "Laboratory Results",
      icon: <FlaskConical size={20} />,
    },
    {
      page: "medical-history",
      label: "Medical History",
      icon: <FileClock size={20} />,
    },
    { page: "prescriptions", label: "Prescriptions", icon: <Pill size={20} /> },
  ];

  // Changing pages drops page-specific params such as consultation_id.
  function setPage(page: string, params: Record<string, string> = {}) {
    if (!navItems.some((item) => item.page === page)) return;
    setSearchParams({ page, ...params });
    setLoading(false);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }

  if (!patient || !patientId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 sm:p-6">
        <ErrorMessage className="max-w-md">
          Patient account not found. Please sign in again to access your
          records.
        </ErrorMessage>
      </div>
    );
  }

  return (
    <SidebarNavContext.Provider value={{ navItems, page: activePage, setPage }}>
      <div className="flex min-h-screen bg-gray-50 text-gray-900">
        <SideBar
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          page={activePage}
          setPage={setPage}
          navItems={navItems}
        />

        <div className="min-w-0 flex-1">
          <Header
            page={
              navItems.find((item) => item.page === activePage)?.label ||
              "Dashboard"
            }
            loading={loading}
            open={sidebarOpen}
            setOpen={setSidebarOpen}
            loadData={() => setRefreshKey((current) => current + 1)}
          />
          <main className="space-y-6 px-4 pb-6 sm:px-6">
            {activePage === "dashboard" && (
              <PatientDashboard patient={patient} setPage={setPage} />
            )}
            {activePage === "queue-tracking" && (
              <QueueTracking
                refreshKey={refreshKey}
                onLoadingChange={setLoading}
              />
            )}
            {(activePage === "medical-history" ||
              activePage === "laboratory-results") && (
              <MedicalHistory
                key={activePage}
                patientId={patientId}
                refreshKey={refreshKey}
                onLoadingChange={setLoading}
                laboratoryOnly={activePage === "laboratory-results"}
                onPrescriptions={(id) =>
                  setPage("prescriptions", id ? { consultation_id: id } : {})
                }
              />
            )}
            {activePage === "prescriptions" && (
              <Prescriptions
                patient={patient}
                patientId={patientId}
                refreshKey={refreshKey}
                onLoadingChange={setLoading}
                consultationId={consultationId}
              />
            )}
            {!navItems.some((item) => item.page === activePage) && (
              <div className="rounded-md border border-gray-200 bg-white p-4 text-center sm:p-8">
                <h2 className="font-semibold text-gray-800">Page not found</h2>
                <button
                  type="button"
                  onClick={() => setPage("dashboard")}
                  className="mt-3 text-sm text-sky-600 hover:underline"
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarNavContext.Provider>
  );
}

export default Patient;
