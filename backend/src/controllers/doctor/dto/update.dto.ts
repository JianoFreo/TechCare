export namespace skipQueueEntry {
  export interface response {
    message: string;
    queue: Record<string, unknown>;
  }

  export interface error {
    message: string;
  }
}
