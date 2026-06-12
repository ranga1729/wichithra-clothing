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

export interface InventoryFilter {
  productId?: string,
  sku?: string,
  colorId?: string,
  sizeId?: string,
}

export interface NewOrderFilter {
  orderNumber?: string,
  userName?: string,
  createdDateFrom?: string, // ISO date string (YYYY-MM-DD)
  createdDateTo?: string,   // ISO date string (YYYY-MM-DD)
  paymentStatus?: string,
}
