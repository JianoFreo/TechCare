import type { FormTemplate } from "./FormTemplate";

export type AnalysisStatus = "Ready for Analysis" | "In Progress" | "Completed";
export type PatientCategory = "Normal" | "Senior Citizen" | "Pregnant" | "PWD" | "Priority";

export interface AnalysisTest {
  id: string;
  serviceId: string;
  name: string;
  description: string;
}

export interface AnalysisRequest {
  requestId: string;
  queueId: string;
  patientId: string;
  patientName: string;
  birthdate: string;
  age: number | null;
  sex: string;
  requestedAt: string;
  collectedAt: string;
  accepted: boolean;
  sampleCollected: boolean;
  room: string;
  priority: boolean;
  category: PatientCategory;
  status: AnalysisStatus;
  consultationType: string;
  tests: AnalysisTest[];
}

export type ReportTemplate = FormTemplate & { category: string; version?: number; testNames: string[] };
export type ResultValues = Record<string, unknown>;
export interface ResultEntryPayload {
  request_id: string;
  patient_id: string;
  lab_item_id: string | null;
  service_id: string;
  form_id: string;
  template_version: number | null;
  values: ResultValues;
  remarks: string;
}
