import { createCategory } from "@/app/(admin)/admin/facets/categories/action";
import { AgeGroup, ClothingSize, GenderTarget, PaymentStatus, ProductStatus } from "@/generated/prisma/enums";
import * as z from "zod"

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
 
export const ProductStatusSchema = z.enum(ProductStatus);
export const AgeGroupSchema = z.enum(AgeGroup)
export const GenderSchema = z.enum(GenderTarget)
export const ClothingSizeSchema = z.enum(ClothingSize)

// Category management
export const baseCategorySchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .nullish(),
  sortOrder: z  
    .number()
    .int("Must be an integer")
    .min(0, "Must be zero or greater"),
  sizeGuide: z.string().nullish(),
})
export type BaseCategorySchema = z.input<typeof baseCategorySchema>

export const getCategorySchema = baseCategorySchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
})
export type GetCategorySchema = z.infer<typeof getCategorySchema>

export const deleteCategorySchema = baseCategorySchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
  deletedAt: z.date().nullish(),
})
export type DeleteCategorySchema = z.infer<typeof deleteCategorySchema>

export const updateCategorySchema = baseCategorySchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
})
export type UpdateCategorySchema = z.input<typeof updateCategorySchema>

// Design management
export const baseDesignSchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug cannot exceed 100 characters")
    .transform((val) => val.trim()),
  description: z.string().nullish(),
});
export type BaseDesignSchema = z.input<typeof baseDesignSchema>;

export const getDesignSchema = baseDesignSchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
});
export type GetDesignSchema = z.infer<typeof getDesignSchema>;

export const updateDesignSchema = baseDesignSchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
});
export type UpdateDesignSchema = z.input<typeof updateDesignSchema>;

export const deleteDesignSchema = getDesignSchema.extend({
  deletedAt: z.date().nullable(),
});
export type DeleteDesignSchema = z.infer<typeof deleteDesignSchema>;

// Color management
export const baseColorSchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name cannot exceed 100 characters")
    .transform((val) => val.trim()),
  hexCode: z
    .string()
    .length(6, "Color code must have 6 digits")
    .nullish()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  swatchImageUrl: z.string().nullish(),
});
export type BaseColorSchema = z.input<typeof baseColorSchema>;

export const getColorSchema = baseColorSchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
});
export type GetColorSchema = z.infer<typeof getColorSchema>;

export const updateColorSchema = baseColorSchema.extend({
  id: z.uuid(),
  isActive: z.boolean(),
});
export type UpdateColorSchema = z.input<typeof updateColorSchema>;

export const deleteColorSchema = getColorSchema.extend({
  deletedAt: z.date().nullish(),
});
export type DeleteColorSchema = z.infer<typeof deleteColorSchema>;

//for products page
const categorySelectSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
});

const colorSelectSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  hexCode: z.string().length(6).nullable(),
  swatchImageUrl: z.string().nullable().optional(),
});

const designSelectSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
});

const productDesignSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  designId: z.uuid(),
  design: designSelectSchema
});

const productImageSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid().nullable(),
  imageUrl: z.string(),
  isPrimary: z.boolean(),
  sortOrder: z.number().int(),
});

const variantSchema = z.object({
  id: z.uuid(),
  productId: z.uuid(),
  colorId: z.uuid(),
  sku: z.string(),
  isActive: z.boolean(),
  color: colorSelectSchema,
  size: ClothingSizeSchema,
});

export const productSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  isFeatured: z.boolean(),
  status: z.enum(ProductStatus),

  category: categorySelectSchema,
  productDesigns: z.array(productDesignSchema),
  productImages: z.array(productImageSchema),
  variants: z.array(variantSchema),
});

export const simpleProductSchema = z.object({
  id: z.uuid(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z.string().nullable(),
  gender: GenderSchema,
  ageGroup: AgeGroupSchema,
  costPrice: z.coerce.number(),
  sellingPrice: z.coerce.number(),
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  isFeatured: z.boolean(),
  status: z.enum(ProductStatus),
  category: categorySelectSchema,
})

export const basicProductInfoSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  category: categorySelectSchema,
  gender: GenderSchema,
  ageGroup: AgeGroupSchema,
  costPrice: z
    .coerce
    .number()
    .min(0)
    .default(0),
  sellingPrice: z
    .coerce
    .number()
    .min(0)
    .default(0),
  discountPercentage: z
    .coerce
    .number()
    .min(0)
    .max(100)
    .default(0),
  description: z.string().nullable(),
  brand: z.string().nullable(),
  material: z.string().nullable(),
  careInstructions: z.string().nullable(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().optional(),
});

// Inventory
export const inventorySchema = z.object({
  id: z.uuid(),
  quantity: z.number().int(),
  reservedQuantity: z.number().int(),
  lowStockThreshold: z.number().int().nullable(),
  variant: z.object({
    id: z.uuid(),
    sku: z.string(),
    isActive: z.boolean(),
    product: z.object({
      id: z.uuid(),
      name: z.string(),
      discountPercentage: z.coerce.number(),
      category: z.object({
        id: z.uuid(),
        name: z.string(),
      }),
    }),
    color: z.object({
      id: z.uuid(),
      name: z.string(),
      hexCode: z.string().nullable(),
      swatchImageUrl: z.string().nullable(),
    }),
    size: ClothingSizeSchema,
  }),
});

export const createInventoryItemSchema = z.object({
  productId: z.uuid("Please select a product"),
  colorId: z.uuid("Please select a color"),
  size: ClothingSizeSchema,
  sku: z
    .string("SKU is required")
    .min(1, "SKU is required")
    .max(100, "SKU cannot exceed 100 characters")
    .transform((val) => val.trim()),
  isActive: z.boolean().default(true),
  quantity: z
    .coerce
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity must be 0 or more")
    .default(0),
  lowStockThreshold: z
    .coerce
    .number()
    .int("Low stock threshold must be an integer")
    .min(0, "Low stock threshold must be 0 or more")
    .default(5)
    .optional(),
});

export const updateInventoryItemSchema = z.object({
  isActive: z.boolean().default(true),
  quantity: z
    .coerce
    .number()
    .int("Quantity must be an integer")
    .min(0, "Quantity must be 0 or more"),
  lowStockThreshold: z
    .coerce
    .number()
    .int("Low stock threshold must be an integer")
    .min(0, "Low stock threshold must be 0 or more")
    .optional(),
});

export const newOrderSchema = z.object({
  id: z.uuid(),
  orderNumber: z.string(),
  createdAt: z.coerce.date(),
  paymentStatus: z.enum(PaymentStatus),
  subtotal: z.coerce.number(),
  discountAmount: z.coerce.number(),
  shippingFee: z.coerce.number(),
  taxAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  notes: z.string().nullable(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
})

export const ongoingOrderSchema = z.object({
  id: z.uuid(),
  orderNumber: z.string(),
  createdAt: z.coerce.date(),
  paymentStatus: z.enum(PaymentStatus),
  subtotal: z.coerce.number(),
  discountAmount: z.coerce.number(),
  shippingFee: z.coerce.number(),
  taxAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  notes: z.string().nullable(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
})

export const completedOrderSchema = z.object({
  id: z.uuid(),
  orderNumber: z.string(),
  createdAt: z.coerce.date(),
  paymentStatus: z.enum(PaymentStatus),
  subtotal: z.coerce.number(),
  discountAmount: z.coerce.number(),
  shippingFee: z.coerce.number(),
  taxAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  notes: z.string().nullable(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
})

export const cancelledOrderSchema = z.object({
  id: z.uuid(),
  orderNumber: z.string(),
  createdAt: z.coerce.date(),
  paymentStatus: z.enum(PaymentStatus),
  subtotal: z.coerce.number(),
  discountAmount: z.coerce.number(),
  shippingFee: z.coerce.number(),
  taxAmount: z.coerce.number(),
  totalAmount: z.coerce.number(),
  notes: z.string().nullable(),
  cancelReason: z.string().nullable(),
  user: z.object({
    firstName: z.string(),
    lastName: z.string(),
  }),
})

export const customerSchema = z.object({
  id: z.uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  isVerified: z.boolean(),
  createdAt: z.coerce.date(),
  phoneNumbers: z.array(z.object({
    phoneNumber: z.string(),
    countryCode: z.string().nullable(),
    type: z.string(),
    isDefault: z.boolean(),
  })),
  addresses: z.array(z.object({
    houseNo: z.string(),
    addressLine1: z.string(),
    addressLine2: z.string().nullable(),
    city: z.string(),
    province: z.string(),
    zipcode: z.string(),
    country: z.string(),
    isDefault: z.boolean(),
  })),
})


export type ProductSchema = z.infer<typeof productSchema>
export type SimpleProductSchema = z.infer<typeof simpleProductSchema>

export type VariantSchema = z.infer<typeof variantSchema>
export type ProductDesignSchema = z.infer<typeof productDesignSchema>
export type BasicProductInfoSchema = z.input<typeof basicProductInfoSchema>;

export type InventorySchema = z.infer<typeof inventorySchema>
export type CreateInventoryItemSchema = z.infer<typeof createInventoryItemSchema>
export type UpdateInventoryItemSchema = z.infer<typeof updateInventoryItemSchema>

export type NewOrderSchema = z.infer<typeof newOrderSchema>
export type OngoingOrderSchema = z.infer<typeof ongoingOrderSchema>
export type CompletedOrderSchema = z.infer<typeof completedOrderSchema>
export type CancelledOrderSchema = z.infer<typeof cancelledOrderSchema>
export type CustomerSchema = z.infer<typeof customerSchema>

// Collections
export const createCollectionSchema = z.object({
  name: z
    .string("Enter a valid name")
    .min(1, "Name is required")
    .max(100, "Name can not exceed 100 characters")
    .transform((val) => val.trim()),
  slug: z
    .string("Enter a valid slug")
    .min(1, "Slug is required")
    .max(100, "Slug can not exceed 100 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .optional(),
})

export const collectionSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.coerce.date(),
})

export const collectionProductSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  slug: z.string(),
  gender: GenderSchema,
  ageGroup: AgeGroupSchema,
  category: z.object({
    name: z.string(),
  }),
  productImages: z.array(z.object({
    imageUrl: z.string(),
    isPrimary: z.boolean(),
    sortOrder: z.number().int(),
  })),
})

export type CreateCollectionSchema = z.infer<typeof createCollectionSchema>
export type CollectionSchema = z.infer<typeof collectionSchema>
export type CollectionProductSchema = z.infer<typeof collectionProductSchema>