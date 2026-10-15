import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../../../components/Header";
import type { AnalysisRequest } from "../../../interface/LaboratoryAnalysis";
import AnalysisList from "../components/LaboratoryResults/AnalysisList";
import ResultEntry from "../components/LaboratoryResults/ResultEntry";
import { apiMessage, fetchAnalysisRequests } from "../components/LaboratoryResults/laboratoryResultsApi";

type LaboratoryResultsProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  room: string;
};

export default function LaboratoryResults({ open, setOpen, room }: LaboratoryResultsProps) {
  const [requests, setRequests] = useState<AnalysisRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AnalysisRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pendingRequest = useRef<AbortController | null>(null);

  const loadRequests = useCallback(async () => {
    pendingRequest.current?.abort();
    const controller = new AbortController();
    pendingRequest.current = controller;
    setLoading(true);
    setError(null);
    try {
      const items = await fetchAnalysisRequests(room, controller.signal);
      if (!controller.signal.aborted) setRequests(items);
    } catch (cause) {
      if (!controller.signal.aborted) {
        setRequests([]);
        setError(apiMessage(cause, "Unable to load laboratory requests."));
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [room]);

  useEffect(() => {
    void loadRequests();
    return () => pendingRequest.current?.abort();
  }, [loadRequests]);

  function returnToList() {
    setSelectedRequest(null);
    requestAnimationFrame(() => document.getElementById("analysis-heading")?.focus());
  }

  return <main className="min-w-0 flex-1 bg-white">
    <Header page="Laboratory Results" loading={loading} open={open} setOpen={setOpen} loadData={() => { void loadRequests(); }} />
    <div className="px-3 pb-9 sm:px-6 xl:px-7">
      <div hidden={Boolean(selectedRequest)}>
        <AnalysisList requests={requests} loading={loading} error={error} room={room}
          onEnter={setSelectedRequest} onRetry={() => { void loadRequests(); }} />
      </div>
      {selectedRequest && <ResultEntry key={`${selectedRequest.requestId}:${selectedRequest.status}`} request={selectedRequest} onCancel={returnToList} onSaved={() => { void loadRequests(); }} />}
    </div>
  </main>;
}
