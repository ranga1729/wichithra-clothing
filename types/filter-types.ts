export interface CategoryFilter {
  name?: string,
  slug?: string,
}

export interface DesignFilter {
  name?: string,
  slug?: string,
}

export interface ColorFilter {
  name?: string,
  hexCode?: string,
}

export interface ProductFilter {
  name?: string,
  slug?: string,
  category?: string,
}

export interface CustomerFilter {
  name?: string,
  email?: string,
}

export interface InventoryFilter {
  productId?: string,
  sku?: string,
  colorId?: string,
  size?: string,
}

export interface NewOrderFilter {
  orderNumber?: string,
  customerName?: string,
  createdDateFrom?: string, // ISO date string (YYYY-MM-DD)
  createdDateTo?: string,   // ISO date string (YYYY-MM-DD)
  paymentStatus?: string,
}

export interface OngoingOrderFilter {
  orderNumber?: string,
  customerName?: string,
  createdDateFrom?: string, // ISO date string (YYYY-MM-DD)
  createdDateTo?: string,   // ISO date string (YYYY-MM-DD)
  paymentStatus?: string,
}

export interface CompletedOrderFilter {
  orderNumber?: string,
  customerName?: string,
  createdDateFrom?: string, // ISO date string (YYYY-MM-DD)
  createdDateTo?: string,   // ISO date string (YYYY-MM-DD)
  paymentStatus?: string,
}

export interface CancelledOrderFilter {
  orderNumber?: string,
  customerName?: string,
  createdDateFrom?: string, // ISO date string (YYYY-MM-DD)
  createdDateTo?: string,   // ISO date string (YYYY-MM-DD)
  paymentStatus?: string,
}