// ─── Domain Models ────────────────────────────────────────────────────────────

export interface User {
  id: string
  email: string
  displayName: string
  role: string
  status: string
  lastLogin: string | null
  createdAt: string
}

export interface Supplier {
  id: string
  name: string
  type: string
  location: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
}

export interface Category {
  id: string
  name: string
  createdAt: string
}

export interface Platform {
  id: string
  name: string
  feePercentage: number
  fixedFee: number
  defaultPostage: number
  isActive: boolean
  createdAt: string
}

export interface InventoryItem {
  id: string
  sku: string
  brand: string
  size: string
  cogs: number
  dateListed: string
  status: string
  categoryId: string
  categoryName: string
  supplierId: string | null
  supplierName: string | null
  platformId: string | null
  platformName: string | null
  createdAt: string
}

export interface SaleLog {
  id: string
  inventoryId: string
  sku: string
  salePrice: number
  feePercentage: number
  fixedFee: number
  postage: number
  netProfit: number
  daysToSell: number
  dateSold: string
  platformId: string
  platformName: string
  createdAt: string
}

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export interface PlatformRequest {
  name: string
  feePercentage: number
  fixedFee: number
  defaultPostage: number
  isActive: boolean
}

export interface SupplierRequest {
  name: string
  type: string
  location: string
  notes: string
  isActive: boolean
}

export interface UserRequest {
  email: string
  displayName: string
  role: string
}

export interface UpdateRoleRequest {
  role: string
}

export interface UpdateStatusRequest {
  status: string
}

export interface DevLoginRequest {
  email: string
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface MeResponse {
  userId: string
  email: string
  displayName: string
  role: string
}

// ─── Utility ──────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface PagedResult<T> {
  items: T[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
}
