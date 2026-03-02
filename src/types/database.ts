export type UserRole = "driver" | "employee" | "controller";

export type ReceiptCategory =
  | "gas"
  | "detailing"
  | "parking"
  | "food"
  | "miscellaneous"
  | "ez_pass"
  | "auto_supplies"
  | "maintenance";

export type MaintenanceType =
  | "oil"
  | "tire_rotation"
  | "brakes"
  | "battery"
  | "inspection"
  | "general"
  | "other";

export type KeyType = "primary" | "spare" | "valet";

export type TireType = "summer" | "winter" | "all_season";

export type CarRequestStatus = "pending" | "approved" | "denied" | "completed";

export interface Location {
  id: string;
  code: string;
  name: string;
  address: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  assigned_location_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  location_id: string | null;
  make: string;
  model: string;
  year: number;
  vin: string | null;
  license_plate: string | null;
  color: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  location?: Location | null;
}

export interface MaintenanceRecord {
  id: string;
  vehicle_id: string;
  type: MaintenanceType;
  description: string | null;
  odometer: number | null;
  cost: number | null;
  date: string;
  vendor: string | null;
  receipt_url: string | null;
  next_due_miles: number | null;
  next_due_date: string | null;
  created_at: string;
  created_by: string | null;
}

export interface Receipt {
  id: string;
  vehicle_id: string | null;
  location_id: string | null;
  category: ReceiptCategory;
  amount: number;
  date: string;
  vendor: string | null;
  notes: string | null;
  document_url: string | null;
  created_by: string | null;
  created_at: string;
  vehicle?: Vehicle | null;
  location?: Location | null;
}

export interface CarRequest {
  id: string;
  vehicle_id: string;
  requested_by: string | null;
  requested_for: string | null;
  date: string;
  status: CarRequestStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: Vehicle | null;
}

export type VehicleDocumentType =
  | "registration"
  | "insurance"
  | "maintenance"
  | "misc"
  | "inspection"
  | "title";

export interface VehicleDocument {
  id: string;
  vehicle_id: string;
  doc_type: VehicleDocumentType | string;
  title: string;
  document_url: string;
  notes: string | null;
  created_at: string;
}

export const RECEIPT_CATEGORIES: ReceiptCategory[] = [
  "gas",
  "detailing",
  "parking",
  "food",
  "miscellaneous",
  "ez_pass",
  "auto_supplies",
  "maintenance",
];

export const MAINTENANCE_TYPES: MaintenanceType[] = [
  "oil",
  "tire_rotation",
  "brakes",
  "battery",
  "inspection",
  "general",
  "other",
];
