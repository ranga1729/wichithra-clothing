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
  mainColor?: string,
}

export interface InventoryFilter {
  productName?: string,
  sku?: string,
}
