export interface User {
  userId: number;
  username: string;
  fullName: string;
  role: string;
  email?: string;
  phone?: string;
  dateCreated: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface InventoryItem {
  itemId: number;
  itemName: string;
  description?: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
  status: string;
  dateAdded: string;
}

export interface CreateInventoryRequest {
  itemName: string;
  description?: string;
  category?: string;
  quantity: number;
  unit?: string;
  location?: string;
  status?: string;
}

export interface UpdateInventoryRequest extends CreateInventoryRequest {
  itemId: number;
}

export interface RequisitionForm {
  rfId: number;
  requesterName: string;
  requesterPosition?: string;
  department?: string;
  purpose?: string;
  dateRequested: string;
  checkedByName?: string;
  checkedByPosition?: string;
  checkedByDate?: string;
  approvedByName?: string;
  approvedByPosition?: string;
  approvedByDate?: string;
  issuedByName?: string;
  issuedByPosition?: string;
  issuedByDate?: string;
  receivedByName?: string;
  receivedByPosition?: string;
  receivedByDate?: string;
}

export interface RequestForm {
  reqId: number;
  requestorName: string;
  requestorPosition?: string;
  department?: string;
  issueDescription?: string;
  dateRequested: string;
  checkedByName?: string;
  checkedByPosition?: string;
  checkedByDate?: string;
  approvedByName?: string;
  approvedByPosition?: string;
  approvedByDate?: string;
  issuedByName?: string;
  issuedByPosition?: string;
  issuedByDate?: string;
  receivedByName?: string;
  receivedByPosition?: string;
  receivedByDate?: string;
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalUsers: number;
  pendingRequests: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}