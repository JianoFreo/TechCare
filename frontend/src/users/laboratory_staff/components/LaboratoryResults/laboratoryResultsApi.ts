import api from "../../../../lib/axios";
import type {
  AnalysisRequest,
  LaboratoryReportData,
  ReportTemplate,
  ResultEntryPayload,
  ResultReleasePayload,
  ResultReleaseResponse,
} from "../../../../interface/LaboratoryAnalysis";
import type { Service } from "../../../../interface/Service";
import type { LaboratoryRequestDetail } from "../../../../interface/LabRequestDetail";
import { matchingTest, toReportTemplate } from "./reportTemplates";
import { normalizeAnalysisRequests } from "./laboratoryAnalysis";
export {
  collectionDay,
  normalizeAnalysisRequests,
  patientAge,
} from "./laboratoryAnalysis";
export const LABORATORY_REQUESTS_ENDPOINT =
  "/api/labstaff/laboratory-requests/items/";
export const LABORATORY_TEMPLATES_ENDPOINT =
  "/api/labstaff/laboratory-results/form-templates/";

type AnalysisReadyItem = {
  lab_item_id: string;
  request_id: string;
  service_id: string;
  room: string;
  queue_id: string | null;
  status: string;
};

function isCollected(status: string) {
  return status.trim().toLowerCase() === "specimen collected";
}

export async function fetchAnalysisRequests(
  room: string,
  signal?: AbortSignal,
): Promise<AnalysisRequest[]> {
  const response = await api.get(LABORATORY_REQUESTS_ENDPOINT, {
    params: { room },
    signal,
  });
  if (!Array.isArray(response.data)) {
    throw new Error("The analysis-ready response was not a list.");
  }
  const items: AnalysisReadyItem[] = response.data.filter(
    (item) =>
      item?.room === room &&
      typeof item.status === "string" &&
      isCollected(item.status),
  );
  if (!items.length) return [];
  if (
    items.some(
      (item) =>
        !item.lab_item_id ||
        !item.request_id ||
        !item.service_id ||
        typeof item.queue_id !== "string" ||
        !item.queue_id.trim(),
    )
  ) {
    throw new Error(
      "Some collected samples are missing request or queue details. Please reload laboratory requests.",
    );
  }

  const queueIds = [...new Set(items.map((item) => item.queue_id!))];
  const details = await Promise.all(
    queueIds.map(async (queueId) => {
      const response = await api.get<LaboratoryRequestDetail>(
        "/api/labstaff/laboratory-queues/" +
          encodeURIComponent(queueId) +
          "/request",
        { params: { room }, signal },
      );
      if (
        !response.data?.request?.request_id ||
        !response.data.request.patient_id ||
        !Array.isArray(response.data.items)
      ) {
        throw new Error(
          "Patient and request details could not be read for a collected sample.",
        );
      }
      return [queueId, response.data] as const;
    }),
  );
  const byQueue = new Map(details);
  const rows = items.flatMap((item) => {
    const detail = byQueue.get(item.queue_id!)!;
    const collectedItem = detail.items.find(
      (candidate) => candidate.lab_item_id === item.lab_item_id,
    );
    if (
      detail.request.request_id !== item.request_id ||
      !collectedItem ||
      collectedItem.queue_id !== item.queue_id ||
      collectedItem.service?.service_id !== item.service_id
    ) {
      throw new Error(
        "A collected sample no longer matches its request details. Please reload laboratory requests.",
      );
    }
    // Request details include tests from other rooms and collection stages. Only
    // the exact ready item belongs in this analysis list. Queue completion is
    // collection completion; it does not mean an analysis result is completed.
    if (
      collectedItem.service.room !== room ||
      !isCollected(collectedItem.status)
    )
      return [];
    return [
      {
        ...detail.request,
        request_status: detail.request.status,
        analysis_status: "Ready for Analysis",
        sample_status: collectedItem.status,
        queue_id: item.queue_id,
        room,
        items: [collectedItem],
      },
    ];
  });
  if (signal?.aborted)
    throw new Error("Loading laboratory requests was cancelled.");
  return normalizeAnalysisRequests(rows, room);
}

export async function fetchPublishedReportTemplates(
  request: AnalysisRequest,
  signal?: AbortSignal,
): Promise<ReportTemplate[]> {
  try {
    const [templateResponse, serviceResponse] = await Promise.all([
      api.get(LABORATORY_TEMPLATES_ENDPOINT, { signal }),
      api.get("/api/labstaff/services/" + encodeURIComponent(request.room), {
        signal,
      }),
    ]);
    const rows: unknown = templateResponse.data;
    const services: Service[] = serviceResponse.data;
    if (!Array.isArray(rows) || !Array.isArray(services)) {
      throw new Error("Unable to read published templates and their services.");
    }
    return (
      rows
        // Older published-template responses omitted the status column.
        .filter(
          (row) =>
            row && (row.status === undefined || row.status === "Published"),
        )
        .map((row) => ({
          ...toReportTemplate({ ...row, status: "Published" }, services),
          fieldsAvailable: Array.isArray(row.components),
        }))
        .filter((template) => matchingTest(request, template))
    );
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 401 || status === 403) {
      throw new Error(
        "Published report templates are unavailable for this laboratory account. Please sign in again or contact an administrator.",
        { cause: error },
      );
    }
    throw error;
  }
}

export const resultEntryApi: {
  loadTemplates:
    | null
    | ((
        request: AnalysisRequest,
        signal?: AbortSignal,
      ) => Promise<ReportTemplate[]>);
  saveResult:
    | null
    | ((payload: ResultEntryPayload) => Promise<{
        result_id: string;
      }>);
} = {
  loadTemplates: fetchPublishedReportTemplates,
  saveResult: null,
};

export async function submitResultEntry(payload: ResultEntryPayload): Promise<{
  result_id: string;
}> {
  if (!resultEntryApi.saveResult) {
    throw new Error("Result saving is not available yet.");
  }

  const result = await resultEntryApi.saveResult(payload);

  if (
    !result ||
    typeof result.result_id !== "string" ||
    !result.result_id.trim()
  ) {
    throw new Error(
      "The server did not confirm a saved result. Your entries have been kept.",
    );
  }

  return result;
}

export const resultPrintApi: {
  loadResults:
    | null
    | ((
        request: AnalysisRequest,
        signal?: AbortSignal,
      ) => Promise<LaboratoryReportData[]>);
} = {
  loadResults: null,
};

export async function fetchPrintableResults(
  request: AnalysisRequest,
  signal?: AbortSignal,
): Promise<LaboratoryReportData[]> {
  if (!resultPrintApi.loadResults) {
    throw new Error(
      "Saved results are not available for preview yet. The result-reading service has not been connected.",
    );
  }

  const reports = await resultPrintApi.loadResults(request, signal);

  if (!Array.isArray(reports) || !reports.length) {
    throw new Error("No saved results are available for this request.");
  }

  if (
    reports.some(
      (report) =>
        !report?.resultId?.trim() ||
        report.request?.requestId !== request.requestId ||
        report.request?.patientId !== request.patientId ||
        !report.template?.form_id ||
        !Array.isArray(report.template.components) ||
        !matchingTest(request, report.template) ||
        !report.values ||
        typeof report.values !== "object" ||
        Array.isArray(report.values),
    )
  ) {
    throw new Error(
      "The saved result or its original report template is incomplete. Unable to prepare a printable report.",
    );
  }

  return reports;
}

// Connect the release endpoint here when it exists. Status changes alone do not
// confirm that the patient can access a result online.
export const resultReleaseApi: {
  releaseResult:
    | null
    | ((
        payload: ResultReleasePayload,
        signal?: AbortSignal,
      ) => Promise<ResultReleaseResponse>);
} = { releaseResult: null };

export async function releaseLaboratoryResult(
  payload: ResultReleasePayload,
  signal?: AbortSignal,
): Promise<ResultReleaseResponse> {
  if (signal?.aborted) throw new Error("The release request was cancelled.");
  if (
    ![payload.result_id, payload.request_id, payload.patient_id].every(
      (value) => typeof value === "string" && value.trim(),
    )
  ) {
    throw new Error(
      "A saved result, request, and patient are required before releasing.",
    );
  }
  if (!resultReleaseApi.releaseResult) {
    throw new Error(
      "Releasing is not available yet. This result has not been made available online.",
    );
  }
  const result = await resultReleaseApi.releaseResult(payload, signal);
  if (signal?.aborted) throw new Error("The release request was cancelled.");
  if (
    !result ||
    result.result_id !== payload.result_id ||
    result.online_available !== true ||
    typeof result.released_at !== "string" ||
    !result.released_at.trim() ||
    !Number.isFinite(new Date(result.released_at).getTime())
  ) {
    throw new Error(
      "The server did not confirm online availability. Reload the result to check its release status before retrying.",
    );
  }
  return result;
}

export function apiMessage(error: unknown, fallback: string) {
  const cause = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    cause?.response?.data?.message ||
    cause?.response?.data?.error ||
    cause?.message ||
    fallback
  );
}
