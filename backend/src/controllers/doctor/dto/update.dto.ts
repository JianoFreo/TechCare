export namespace consultationQueueAction {
  export interface body {
    doctor_id?: string; // Development only; production uses the authenticated user.
    reason?: string;
  }

  export interface response {
    message: string;
    queue: Record<string, unknown>;
    consultation: Record<string, unknown>;
  }

  export interface error {
    message: string;
  }
}
