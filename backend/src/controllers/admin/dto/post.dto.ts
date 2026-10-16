export namespace addUser {
  export interface request {
    username: string;
    password: string;
    first_name: string;
    middle_name?: string | null;
    last_name: string;
    suffix?: string | null;
    sex: string;
    email: string;
    contact_number: string;
    emergency_contact_name?: string | null;
    emergency_contact?: string | null;
    address: string;
    birthdate: string;
    role: string;
    department?: string | null;
    employment_status?: string | null;
    date_hired: string;
    shift_start?: string;
    shift_end?: string;
  }

  export interface user {
    id: number;
    user_id: string;
    username: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string;
    email: string;
    contact_number: string;
    emergency_contact_name: string | null;
    emergency_contact: string | null;
    address: string;
    birthdate: string;
    role: string;
    department: string | null;
    employment_status: string | null;
    date_hired: string;
    shift_start: string;
    shift_end: string;
    last_login: string | null;
    account_status: boolean;
    profile_photo: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  }

  export interface response {
    user: user;
    message: string;
  }

  export interface error {
    message: string;
  }
}

export namespace addService {
  export interface request {
    service_name: string;
    price: number | string;
    service_type: string;
    service_category: string;
    room: string;
  }

  export interface service {
    id: number;
    service_id: string;
    service_type: string;
    service_name: string;
    service_category: string;
    price: string;
    active: boolean;
    room: string;
    created_at: string;
    updated_at: string;
  }

  export interface response {
    message: string;
    service?: service;
  }

  export interface error {
    message?: string;
    error?: string;
  }
}

export namespace addActivity {
  export interface request {
    service_name: string;
    details: Record<string, unknown>;
  }

  export interface activity {
    id: number;
    activity_id: string;
    user_id: string;
    service_name: string;
    details: Record<string, unknown>;
    created_at: string;
  }

  export interface response {
    message: string;
    user?: activity;
  }

  export interface error {
    error: string;
  }
}

export namespace addAction {
  export interface request {
    action_name: string;
    action_description?: string | null;
    module: string;
    is_sensitive?: boolean;
  }

  export interface action {
    action_id: number;
    action_name: string;
    action_description: string | null;
    module: string;
    is_sensitive: boolean;
  }

  export interface response {
    message: string;
    newAction: action[];
  }

  export interface error {
    message: string;
  }
}

export namespace addFormTemplates {
  export interface componentRequest {
    type_id: string;
    label: string;
    field_key: string;
    display_order: number;
    settings?: Record<string, unknown> | null;
    validation?: Record<string, unknown> | null;
  }

  export interface request {
    form_name: string;
    form_description?: string | null;
    status?: string;
    service_id: string;
    created_by: string;
    form_components: componentRequest[];
  }

  export interface template {
    id: number;
    form_id: string;
    form_name: string;
    form_description: string | null;
    service_id: string;
    status: string;
    created_by: string;
    version: number;
    created_at: string;
    updated_at: string;
  }

  export interface component {
    id: number;
    form_component_id: string;
    form_id: string;
    type_id: string;
    label: string;
    field_key: string;
    display_order: number;
    settings: Record<string, unknown> | null;
    validation: Record<string, unknown> | null;
  }

  export interface response {
    message: string;
    formCreated: template;
    componentsCreated: component[];
  }

  export interface error {
    message: string;
  }
}
