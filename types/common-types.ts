export interface Category {
  id: string,
  name: string,
  slug: string,
  description?: string,
  sizeGuide?: string,
  sortOrder?: number,
  isActive: boolean,
}

export interface Design {
  id: string,
  name: string,
  slug: string,
  description?: string,
}