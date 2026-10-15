import api from "../../../../lib/axios";
import type {
  AnalysisRequest,
  LaboratoryReportData,
  ReportTemplate,
  ResultEntryPayload,
} from "../../../../interface/LaboratoryAnalysis";
import type { Service } from "../../../../interface/Service";
import { matchingTest, toReportTemplate } from "./reportTemplates";
import { normalizeAnalysisRequests } from "./laboratoryAnalysis";
export {
  collectionDay,
  normalizeAnalysisRequests,
  patientAge,
} from "./laboratoryAnalysis";
export const LABORATORY_REQUESTS_ENDPOINT = "/api/labstaff/laboratory-requests";

export async function fetchAnalysisRequests(
  room: string,
  signal?: AbortSignal,
) {
  const response = await api.get(LABORATORY_REQUESTS_ENDPOINT, {
    params: {
      room,
    },

    signal,
  });

  return normalizeAnalysisRequests(response.data, room);
}

export async function fetchPublishedReportTemplates(
  request: AnalysisRequest,
  signal?: AbortSignal,
): Promise<ReportTemplate[]> {
  try {
    const [templateResponse, serviceResponse] = await Promise.all([
      api.get("/api/admin/form-templates", {
        params: {
          status: "Published",
        },

        signal,
      }),
      api.get(`/api/labstaff/services/${encodeURIComponent(request.room)}`, {
        signal,
      }),
    ]);

    const rows: unknown = templateResponse.data?.formTemplates;
    const services: Service[] = Array.isArray(serviceResponse.data)
      ? serviceResponse.data
      : serviceResponse.data?.services;

    if (!Array.isArray(rows) || !Array.isArray(services)) {
      throw new Error("Unable to read published templates and their services.");
    }

    const applicable = rows
      .filter((row) => row?.status === "Published")
      .map((row) => toReportTemplate(row, services))
      .filter((template) => matchingTest(request, template));

    return await Promise.all(
      applicable.map(async (summary) => {
        const detail = await api.get(
          `/api/admin/form-templates/${encodeURIComponent(summary.form_id)}`,
          {
            signal,
          },
        );

        if (!Array.isArray(detail.data?.components)) {
          throw new Error(
            "Template fields are unavailable. Please reload the report templates.",
          );
        }

        const template = toReportTemplate(
          detail.data.formTemplate,
          services,
          detail.data.components,
        );

        if (
          template.form_id !== summary.form_id ||
          !matchingTest(request, template)
        ) {
          throw new Error(
            "The selected template has changed. Please reload report templates.",
          );
        }

        return template;
      }),
    );
  } catch (error) {
    const status = (
      error as {
        response?: {
          status?: number;
        };
      }
    ).response?.status;

    if (status === 401 || status === 403) {
      throw new Error(
        "Published report templates are unavailable for this account. Ask an administrator to enable laboratory access.",
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
