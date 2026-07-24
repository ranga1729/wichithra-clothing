import { ClothingSize, ProductStatus } from "@/generated/prisma/enums"
import * as z from "zod"

export const sizes = z.enum(ClothingSize)
export const status = z.enum(ProductStatus);

export const search_result_color = z.object({
  name: z.string(),
  hexCode: z
    .string()
    .length(6)
    .optional(),
  swatchImageUrl: z
    .string()
    .optional()
})

// Search Filters
export const search_filters_schema = z.object({
  category: z.array(z.string()).optional(),
  design: z.array(z.string()).optional(),
  color: z.array(z.string()).optional(),
  size: z.array(sizes).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortColumn: z.enum(["name", "price", "recently_added"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

export const search_filter_option = z.object({
  name: z.string(),
  value: z.string(),
})

export const search_filter_options_schema = z.object({
  categories: z.array(search_filter_option),
  designs: z.array(search_filter_option),
  colors: z.array(z.object({
    name: z.string(),
    hexCode: z.string().nullable(),
    swatchImageUrl: z.string().nullable(),
  })),
  sizes: z.array(sizes),
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }),
})

export type SearchFilters = z.infer<typeof search_filters_schema>
export type SearchFilterOption = z.infer<typeof search_filter_option>
export type SearchFilterOptions = z.infer<typeof search_filter_options_schema>

export const product_search_result = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  categoryName: z.string(),
  colors: z.array(search_result_color),
  sizes: z.array(sizes),
  status: status,
  price: z.number(),
  primaryImage: z.string(),
})

// Product Detail
export const product_detail_color = z.object({
  id: z.uuid(),
  name: z.string(),
  hexCode: z.string().nullable(),
  swatchImageUrl: z.string().nullable(),
})

export const product_detail_variant = z.object({
  id: z.uuid(),
  size: sizes,
  isActive: z.boolean(),
  color: product_detail_color,
  stock: z.number(),
})

export const product_detail_image = z.object({
  id: z.uuid(),
  imageUrl: z.string(),
  altText: z.string().nullable(),
  isPrimary: z.boolean(),
  sortOrder: z.number(),
  colorId: z.string().uuid().nullable(),
})

export const product_detail = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  brand: z.string(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  sellingPrice: z.number(),
  discountPercentage: z.number(),
  gender: z.string(),
  ageGroup: z.string(),
  category: z.object({
    name: z.string(),
    slug: z.string(),
  }),
  productImages: z.array(product_detail_image),
  variants: z.array(product_detail_variant),
})

export type ProductSearchResult = z.infer<typeof product_search_result>
export type SearchResultColors = z.infer<typeof search_result_color>
export type ProductDetail = z.infer<typeof product_detail>
export type ProductDetailColor = z.infer<typeof product_detail_color>
export type ProductDetailVariant = z.infer<typeof product_detail_variant>
export type ProductDetailImage = z.infer<typeof product_detail_image>

// Checkout
export const shipping_address_schema = z.object({
  houseNo: z
    .string()
    .min(1, "House number is required.")
    .transform((val) => val.trim()),
  addressLine1: z
    .string()
    .min(2, "Address Line 1 is required.")
    .transform((val) => val.trim()),
  addressLine2: z
    .string()
    .transform((val) => val.trim() === "" ? undefined : val.trim())
    .optional(),
  city: z
    .string()
    .min(2, "City is required.")
    .transform((val) => val.trim()),
  province: z
    .string()
    .min(2, "Province is required.")
    .transform((val) => val.trim()),
  zipCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Zip code must be 5 digits.")
    .transform((val) => val.trim()),
  country: z
    .string()
    .min(2, "Country is required.")
    .default("Sri Lanka")
    .transform((val) => val.trim()),
})

export const payment_details_schema = z.object({
  cardNumber: z
    .string()
    .min(1, "Card number is required.")
    .regex(/^[0-9]{16}$/, "Card number must be 16 digits."),
  expiryDate: z
    .string()
    .min(1, "Expiry date is required.")
    .regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, "Expiry date must be in MM/YY format."),
  cvv: z
    .string()
    .min(1, "CVV is required.")
    .regex(/^[0-9]{3,4}$/, "CVV must be 3 or 4 digits."),
})

export const checkout_schema = z.object({
  shippingAddress: shipping_address_schema,
  payment: payment_details_schema,
})

export type ShippingAddress = z.infer<typeof shipping_address_schema>
export type PaymentDetails = z.infer<typeof payment_details_schema>
export type CheckoutForm = z.infer<typeof checkout_schema>

// ── User Profile Update ──────────────────────────────────────
export const updateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
})
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>

// ── Phone Number ─────────────────────────────────────────────
export const phoneSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["MOBILE", "HOME"]),
  countryCode: z.string().max(5).optional(),
  phoneNumber: z
    .string()
    .min(7, "Phone number too short")
    .max(15, "Phone number too long")
    .regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format"),
})
export type PhoneInput = z.infer<typeof phoneSchema>

// ── Address ──────────────────────────────────────────────────
export const addressSchema = z.object({
  id: z.string().optional(),
  type: z.enum(["DELIVERY", "BILLING"]),
  houseNo: z.string().min(1, "House number is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province is required"),
  zipcode: z.string().optional(),
})
export type AddressInput = z.infer<typeof addressSchema>