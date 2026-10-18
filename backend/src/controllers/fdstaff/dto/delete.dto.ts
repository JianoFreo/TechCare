export namespace deleteQueue {
  export interface params {
    queue_id?: string;
  }

  export interface response {
    message: string;
  }

  export interface error {
    error: string;
    message?: string;
  }
}

export namespace deletePatient {
  export interface params {
    patient_id?: string;
  }

  export interface response {
    message: string;
  }

  export interface error {
    message?: string;
    error?: string;
  }
}

