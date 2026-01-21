export type UserRole = "admin" | "developer" | "user";
export type RegistrationStatus = "pending" | "approved" | "rejected";
export type TwoFactorMethod = "totp" | "email";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  twoFactorSecret?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  pendingRegistration?: boolean;
}

export interface FieldHistory {
  value: string;
  date: string;
  user: string;
}

export interface CodeHistoryEntry extends FieldHistory {}

export interface Market {
  id: string;
  wawiNumber: string;
  name: string;
  address: string;
  city: string;
  contactPerson?: string;
  contactPersonHistory?: FieldHistory[];
  parkingInfo?: string;
  parkingInfoHistory?: FieldHistory[];
  doorCodes?: string;
  doorCodesHistory?: CodeHistoryEntry[];
  egateAccess?: string;
  egateAccessHistory?: FieldHistory[];
  // Barcode für Kassen-Zugang
  kassenBarcode?: string;
  kassenBarcodeHistory?: FieldHistory[];
  // Barcode für ExitGate/eGate
  exitGateBarcode?: string;
  exitGateBarcodeHistory?: FieldHistory[];
  // Legacy field - kept for compatibility
  egateBarcode?: string;
  barcodeInfo?: string;
  barcodeInfoHistory?: FieldHistory[];
  serverLocation?: string;
  serverLocationHistory?: FieldHistory[];
  switchRouterLocation?: string;
  switchRouterLocationHistory?: FieldHistory[];
  specialNotes?: string;
  specialNotesHistory?: FieldHistory[];
  freeTextNotes?: string;
  freeTextNotesHistory?: FieldHistory[];
  // KV (Kundenverschulden) - Flag für erhöhte Aufmerksamkeit
  kvFlag?: boolean;
  kvReason?: string;
  kvHistory?: FieldHistory[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MarketInfo {
  id: string;
  marketId: string;
  category: "parking" | "it-info" | "barcode" | "other";
  content: string;
  barcodeValue?: string; // For barcode category, stores the actual barcode value
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  createdBy: string;
  createdByName: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ActivityLog {
  id: string;
  action:
    | "view"
    | "add"
    | "edit"
    | "delete"
    | "approve"
    | "reject"
    | "login"
    | "logout";
  description: string;
  marketId?: string;
  marketName?: string;
  userId: string;
  userName: string;
  timestamp: string;
  previousValue?: string;
  newValue?: string;
}

export interface StoredUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  twoFactorMethod?: TwoFactorMethod;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  createdAt: string;
  createdBy?: string;
  isActive: boolean;
  registrationStatus: RegistrationStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface PendingRegistration {
  id: string;
  email: string;
  password: string;
  name: string;
  requestedAt: string;
  status: RegistrationStatus;
}
