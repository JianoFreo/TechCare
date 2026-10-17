export namespace addLaboratoryRequest {
  export interface body {
    patient_id: string;
    consultation_record_id?: string | null;
    service_ids: string[];
    priority: "Yes" | "No";
    request_date?: string | null;
    estimated_release_date?: string | null;
  }

  export interface request {
    id: number;
    request_id: string;
    consultation_record_id: string | null;
    patient_id: string;
    requested_by: string;
    status: string;
    is_paid: boolean;
    is_priority: boolean;
    request_date: string;
    estimated_release_date: string | null;
    requested_at: string;
    updated_at: string;
  }

  export interface item {
    id: number;
    lab_item_id: string;
    request_id: string;
    service_id: string;
    status: string;
    updated_at: string;
  }

  export interface response {
    message: string;
    request: request[];
    items: item[];
  }

  export interface error {
    message: string;
    errors?: Record<string, string>;
  }
}

export namespace addPrescriptions {
  export interface item {
    medication: string;
    dosage: string;
    frequency: string;
    duration?: string;
    quantity?: number;
    instructions?: string;
  }

  export interface body {
    items: item[];
    valid_until?: string | null;
    notes?: string | null;
  }

  export interface prescription {
    id: number;
    prescription_id: string;
    consultation_record_id: string;
    patient_id: string;
    prescriber_id: string;
    valid_until: string | null;
    prescription_items: item[];
    notes: string | null;
    prescribed_at: string;
  }

  export interface response {
    message: string;
    prescription: prescription;
  }

  export interface error {
    message: string;
  }
}

export namespace addConsultationFindings {
  export interface diagnosis {
    diagnosis: string;
    icd10?: string | null;
    type?: string;
  }

  export interface presentingComplaint {
    hpi: string;
    [key: string]: unknown;
  }

  export interface physicalExamination {
    [key: string]: unknown;
  }

  export interface body {
    patient_id: string;
    service_id?: string;
    consultation_type?: string;
    presenting_complaint: presentingComplaint;
    diagnosis: diagnosis[];
    physical_examination: physicalExamination;
  }

  export interface consultation {
    id: number;
    consultation_record_id: string;
    patient_id: string;
    doctor_id: string;
    service_id: string;
    consultation_type: string;
    diagnosis: diagnosis[];
    presenting_complaint: presentingComplaint;
    physical_examination: physicalExamination;
    consulted_at: string;
    notes: string | null;
  }

  export interface response {
    message: string;
    consultation: consultation;
  }

  export interface error {
    message: string;
    errors?: Record<string, string>;
  }
}