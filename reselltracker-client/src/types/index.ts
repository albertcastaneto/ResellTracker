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
  categoryId: string
  categoryName: string
  size: string
  cogs: number
  supplierId: string | null
  supplierName: string | null
  platformId: string | null
  platformName: string | null
  dateListed: string
  status: string
  daysListed: number
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

export interface SkuRegistry {
  id: string
  sku: string
  brandCode: string
  categoryCode: string
  sizeCode: string
  supplierCode: string
  sequenceNumber: number
  inventoryId: string | null
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

export interface SkuGenerateRequest {
  brand: string
  categoryId: string
  size: string
  supplierId: string
}

export interface InventoryRequest {
  sku: string
  brand: string
  categoryId: string
  size: string
  cogs: number
  supplierId: string | null
  platformId: string | null
  dateListed: string
  status: string
}

export interface InventoryFilters {
  status?: string
  categoryId?: string
  supplierId?: string
  platformId?: string
  search?: string
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export interface MeResponse {
  userId: string
  email: string
  displayName: string
  role: string
}

export interface SkuGenerateResponse {
  sku: string
  brandCode: string
  categoryCode: string
  sizeCode: string
  supplierCode: string
  sequenceNumber: number
  createdAt: string
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
