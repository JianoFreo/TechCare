export interface UnpaidRequests {
  record_type: "laboratory";
  lab_item_id?: string;
  request_id: string;
  patient_id: string;
  patient_name: string;
  service_id?: string;
  service_name?: string;
  is_paid: boolean;
  requested_by: string;
  requester_role: string;
  created_at: string;
  items?: BillingItem[];
  total_amount?: number | string;
  payment_method?: string;
}

export interface BillingItem {
  service_id?: string;
  service_name?: string;
  service_category?: string;
  price?: number | string;
  quantity?: number;
}

export interface BillingRecord {
  bill_id: string | number;
  patient_id: string;
  items?: BillingItem[];
  total_amount: number | string;
  discount_pct?: number | string;
  payment_method?: string;
  status: string;
  receipt_id?: string | null;
  receipt_issued_at?: string | null;
  created_at?: string;
  billed_at?: string;
}

export interface BillingLine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number | null;
}

export interface BillingEntry {
  id: string;
  patientId: string;
  patientName: string;
  age: number | null;
  sex: string;
  createdAt: string;
  requester: string;
  status: "Pending" | "Paid" | "Cancelled";
  type: string;
  method: string;
  lines: BillingLine[];
  total: number | null;
  discountPercent: number | null;
  receiptId: string;
  request?: UnpaidRequests;
  needsLabQueue?: boolean;
}
