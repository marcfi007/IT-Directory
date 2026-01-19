export type UserRole = "admin" | "developer" | "user";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Market {
  id: string;
  wawiNumber: string;
  name: string;
  address: string;
  city: string;
  contactPerson?: string;
  parkingInfo?: string;
  doorCodes?: string;
  egateAccess?: string;
  egateBarcode?: string;
  barcodeInfo?: string;
  serverLocation?: string;
  switchRouterLocation?: string;
  specialNotes?: string;
  freeTextNotes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface MarketInfo {
  id: string;
  marketId: string;
  category: "parking" | "it-info" | "barcode" | "other";
  content: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  createdBy: string;
  createdByName: string;
}

export interface ActivityLog {
  id: string;
  action: "login" | "logout" | "view" | "add" | "edit" | "delete" | "approve" | "reject";
  description: string;
  marketId?: string;
  marketName?: string;
  userId: string;
  userName: string;
  timestamp: string;
  ipAddress?: string;
  previousValue?: string;
  newValue?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
