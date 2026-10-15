import api from "../../../../lib/axios";
import type { AnalysisRequest, ReportTemplate, ResultEntryPayload } from "../../../../interface/LaboratoryAnalysis";
import type { Service } from "../../../../interface/Service";
import { matchingTest, toReportTemplate } from "./reportTemplates";

import { normalizeAnalysisRequests } from "./laboratoryAnalysis";
export { collectionDay, normalizeAnalysisRequests, patientAge } from "./laboratoryAnalysis";

// Existing checked-in list endpoint. Change this constant if the Jira endpoint
// is served at a different URL; no component changes are needed.
export const LABORATORY_REQUESTS_ENDPOINT = "/api/labstaff/laboratory-requests";
export async function fetchAnalysisRequests(room: string, signal?: AbortSignal) {
  const response = await api.get(LABORATORY_REQUESTS_ENDPOINT, { params: { room }, signal });
  return normalizeAnalysisRequests(response.data, room);
}

// Read the same published records and component metadata used by the admin
// builder. These routes currently require admin permission; never change a
// user's role or invent templates when a laboratory user is denied access.
export async function fetchPublishedReportTemplates(request: AnalysisRequest, signal?: AbortSignal): Promise<ReportTemplate[]> {
  try {
    const [templateResponse, serviceResponse] = await Promise.all([
      api.get("/api/admin/form-templates", { params: { status: "Published" }, signal }),
      api.get(`/api/labstaff/services/${encodeURIComponent(request.room)}`, { signal }),
    ]);
    const rows: unknown = templateResponse.data?.formTemplates;
    const services: Service[] = Array.isArray(serviceResponse.data) ? serviceResponse.data : serviceResponse.data?.services;
    if (!Array.isArray(rows) || !Array.isArray(services)) throw new Error("Unable to read published templates and their services.");
    const applicable = rows.filter((row) => row?.status === "Published").map((row) => toReportTemplate(row, services)).filter((template) => matchingTest(request, template));
    return await Promise.all(applicable.map(async (summary) => {
      const detail = await api.get(`/api/admin/form-templates/${encodeURIComponent(summary.form_id)}`, { signal });
      if (!Array.isArray(detail.data?.components)) throw new Error("Template fields are unavailable. Please reload the report templates.");
      const template = toReportTemplate(detail.data.formTemplate, services, detail.data.components);
      if (template.form_id !== summary.form_id || !matchingTest(request, template)) throw new Error("The selected template has changed. Please reload report templates.");
      return template;
    }));
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status === 401 || status === 403) throw new Error("Published report templates are unavailable for this account. Ask an administrator to enable laboratory access.");
    throw error;
  }
}

/** Result-entry integration points. No result-write backend exists yet.
 * Supply these functions once the backend contract is agreed. Never send result
 * values to the legacy status PATCH endpoint or simulate a successful save. */
export const resultEntryApi: {
  loadTemplates: null | ((request: AnalysisRequest, signal?: AbortSignal) => Promise<ReportTemplate[]>);
  saveResult: null | ((payload: ResultEntryPayload) => Promise<{ result_id: string }>);
} = { loadTemplates: fetchPublishedReportTemplates, saveResult: null };

export async function submitResultEntry(payload: ResultEntryPayload): Promise<{ result_id: string }> {
  if (!resultEntryApi.saveResult) throw new Error("Result saving is not available yet.");
  const result = await resultEntryApi.saveResult(payload);
  if (!result || typeof result.result_id !== "string" || !result.result_id.trim()) {
    throw new Error("The server did not confirm a saved result. Your entries have been kept.");
  }
  return result;
}

export function apiMessage(error: unknown, fallback: string) {
  const cause = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
  return cause?.response?.data?.message || cause?.response?.data?.error || cause?.message || fallback;
}
