export interface Category {
  id: string,
  name: string,
  slug: string,
  description?: string,
  sizeGuide?: string,
  sortOrder?: number
}

export interface Design {
  id: string,
  name: string,
  slug: string,
  description?: string,
}