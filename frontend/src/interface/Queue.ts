export interface Queue {
  id: number;
  queue_id: string;
  patient_id: string;
  queue_number: number;
  service_id: string;
  is_priority: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QueueEntry {
  id: number;
  queue_id: string;
  patient_id: string;
  patient_name: string;
  birthdate: string;
  queue_number: number;
  service_id: string;
  service_name: string;
  service_type: string;
  service_category: string;
  room: string;
  is_priority: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface QueueRequests {
  record_type: "laboratory" | "consultation";
  record_id: string;
  patient_id: string;
  patient_name: string;
  service_id: string;
  service_name: string;
  created_by: string;
  created_at: string;
}

export type QueueStatistics = {
  totalQueue: number;
  priorityQueue: number;
  waiting: number;
  inService: number;
  completedToday: number;
};

export type QueueTab = "all" | "laboratory" | "consultation";
export type PriorityFilter = "all" | "yes" | "none";

// One row on the Queue Monitor screen.
// It is a smaller version of QueueEntry on purpose: the backend sends only
// what a screen needs (the name is masked, example: "Juan D.").
export interface QueueMonitorEntry {
  queue_id: string;
  queue_number: number;
  service_name: string;
  service_type: string; // "consultation" or "laboratory"
  room: string | null;
  is_priority: boolean;
  status: string; // lowercase: waiting, serving, skipped, completed, cancelled
  display_name: string;
  updated_at: string;
}

// The state of the live connection to the backend.
// connecting = first try, live = receiving updates,
// reconnecting = lost connection and trying again, unauthorized = token is invalid/expired
export type QueueStreamStatus =
  | "connecting"
  | "live"
  | "reconnecting"
  | "unauthorized";