export namespace getLaboratoryRequestDetails {
  export interface params {
    queue_id?: string;
  }

  export interface query {
    room?: string;
  }

  export interface requestDetails {
    request_id: string;
    consultation_record_id: string | null;
    requested_by: string | null;
    is_priority: boolean;
    status: string;
    is_paid: boolean;
    patient_id: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    sex: string;
    email: string;
    contact_number: string;
    address: string;
    blood_type: string | null;
    birthdate: string;
    emergency_contact_name: string | null;
    emergency_contact: string | null;
    requested_at: string;
    updated_at: string;
    [key: string]: unknown;
  }

  export interface itemService {
    service_id: string;
    service_name: string;
    service_type: string;
    service_category: string;
    room: string;
    [key: string]: unknown;
  }

  export interface itemDetails {
    lab_item_id: string;
    queue_id: string | null;
    status: string;
    processed_by: string | null;
    created_at: string;
    updated_at: string;
    in_current_room: boolean;
    service: itemService;
    [key: string]: unknown;
  }

  export interface response {
    request: requestDetails;
    items: itemDetails[];
    [key: string]: unknown;
  }

  export interface error {
    message: string;
  }
}

export namespace getLaboratoryQueues {
  export interface params {
    room?: string;
  }

  export interface queueItem {
    id?: number;
    queue_id: string;
    patient_id?: string;
    queue_number?: number;
    service_id?: string;
    is_priority?: boolean;
    status?: string;
    created_at?: string;
    updated_at?: string;
    service_name?: string;
    service_type?: string;
    service_category?: string;
    room?: string;
    [key: string]: unknown;
  }

  export type response = queueItem[];

  export interface error {
    message: string;
  }
}

export namespace getRoomSpecificServices {
  export interface params {
    room?: string;
  }

  export interface service {
    service_id: string;
    service_name: string;
    price?: number | string;
    service_type?: string;
    service_category?: string;
    room?: string;
    active?: boolean;
    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
  }

  export type response = service[] | { message: string };

  export interface error {
    message?: string;
    error?: string;
  }
}

export namespace getLaboratoryQueueItems {
  export interface params {
    queue_id?: string;
  }

  export interface queueItem {
    lab_item_id: string;
    request_id: string;
    queue_id: string | null;
    service_id: string;
    processed_by: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    service_name: string;
    service_type: string;
    service_category: string;
    room: string;
    [key: string]: unknown;
  }

  export type response = queueItem[];

  export interface error {
    message: string;
  }
}

export namespace getAnalysisItems {
  export interface query {
    room?: string;
  }

  export interface analysisItem {
    lab_item_id: string;
    request_id: string;
    service_id: string;
    queue_id: string | null;
    status: string;
    room: string;
    service_name: string;
    service_type: string;
    patient_id: string;
    requested_at: string;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    suffix: string | null;
    birthdate: string;
    sex: string;
    is_priority: boolean;
    request_status: string;
    analysis_status: string;
    [key: string]: unknown;
  }

  export type response = analysisItem[];

  export interface error {
    message: string;
  }
}

export namespace getSavedLaboratoryResults {
  export interface query {
    room?: string;
  }

  export interface resultItem {
    result_id: string;
    lab_item_id: string;
    results: unknown;
    remarks: string | null;
    image_url: string | null;
    status: string;
    verified_by: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
  }

  export interface response {
    results: resultItem[];
  }

  export interface error {
    message: string;
  }
}

export namespace getAnalysisReadyRequests {
  export interface readyRequest {
    lab_item_id: string;
    request_id: string;
    service_id: string;
    room: string;
    queue_id: string | null;
    processed_by: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
  }

  export type response = readyRequest[];

  export interface error {
    message: string;
  }
}

export namespace getAvailableFormTemplates {
  export interface template {
    form_id: string;
    form_name: string;
    form_description: string | null;
    service_id: string;
    status: string;
    service_name: string;
    version: number;
    created_by: string;
    created_at: string;
    updated_at: string;
    components: unknown[];
    [key: string]: unknown;
  }

  export type response = template[];

  export interface error {
    message: string;
  }
}

export namespace getReleasedLaboratoryResults {
  export interface releasedResult {
    result_id: string;
    lab_item_id: string;
    results: unknown;
    remarks: string | null;
    image_url: string | null;
    verified_by: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
  }

  export interface response {
    message: string;
    results: releasedResult[];
  }

  export interface error {
    message: string;
  }
}

