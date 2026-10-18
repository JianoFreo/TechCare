export namespace deleteQueue {
  export interface response {
    message: string;
  }

  export interface error {
    error: string;
    message?: string;
  }
}

export namespace deletePatient {
  export interface response {
    message: string;
  }

  export interface error {
    message?: string;
    error?: string;
  }
}
