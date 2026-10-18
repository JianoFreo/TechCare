export namespace getMedicalHistory {
  export interface query {
    search?: string;
    service_category?: string;
    status?: string;
    start_date?: string;
    end_date?: string;
    page?: string;
    limit?: string;
  }

  export interface record {
    record_type: "consultation" | "laboratory";
    record_id: string;
    service_name: string;
    room: string | null;
    service_category: string;
    status: string;
    occurred_at: string;
  }

  export interface pagination {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  }

  export interface response {
    message: string;
    records: record[];
    pagination: pagination;
  }

  export interface error {
    message: string;
    detail?: string;
  }
}

export namespace getMedicalHistoryDetails {
  export interface laboratoryResult {
    result_id: number;
    result_value: string | number | null;
    unit: string | null;
    reference_range: string | null;
    flag: string | null;
    remarks: string | null;
    verified_by: string | null;
    verified_at: string | null;
    image_url: string | null;
    created_at: string;
  }

  export interface laboratoryResponse {
    message: string;
    record_type: "laboratory";
    lab_item_id: string;
    status: string;
    updated_at: string;
    service_name: string;
    room: string | null;
    requested_by: string | null;
    requested_by_role: string | null;
    processed_by: string | null;
    processed_by_role: string | null;
    results: laboratoryResult[];
  }

  export interface prescription {
    prescription_id: string;
    prescription_items: unknown;
    notes: string | null;
    valid_until: string | null;
    prescribed_at: string;
    prescribed_by: string | null;
  }

  export interface consultationResponse {
    message: string;
    record_type: "consultation";
    consultation_record_id: string;
    consultation_type: string;
    diagnosis: string | null;
    notes: string | null;
    consulted_at: string;
    presenting_complaint: string | null;
    vital_signs: unknown;
    physical_examination: string | null;
    service_name: string;
    room: string | null;
    consulted_by: string | null;
    prescription: prescription[];
  }

  export type response = laboratoryResponse | consultationResponse;

  export interface error {
    message: string;
  }
}

export namespace getMedicalHistoryFull {
  export interface prescription {
    prescription_id: string;
    prescription_items: unknown;
    notes: string | null;
    valid_until: string | null;
    prescribed_at: string;
    prescribed_by: string | null;
  }

  export interface laboratoryResponse {
    message: string;
    record_type: "laboratory";
    lab_item_id: string;
    status: string;
    updated_at: string;
    result_value: string | number | null;
    remarks: string | null;
    verified_by: string | null;
    verified_at: string | null;
    service_name: string;
    room: string | null;
    requested_by: string | null;
    requested_by_role: string | null;
    processed_by: string | null;
    processed_by_role: string | null;
  }

  export interface consultationResponse {
    message: string;
    record_type: "consultation";
    consultation_record_id: string;
    consultation_type: string;
    diagnosis: string | null;
    notes: string | null;
    consulted_at: string;
    presenting_complaint: string | null;
    vital_signs: unknown;
    physical_examination: string | null;
    service_name: string;
    room: string | null;
    consulted_by: string | null;
    prescription: prescription[];
  }

  export type response = laboratoryResponse | consultationResponse;

  export interface error {
    message: string;
  }
}
