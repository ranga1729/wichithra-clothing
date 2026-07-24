'use server'

import { ProductStatus } from "@/generated/prisma/enums";
import { en } from "@/lib/i18n/en";
import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { basicProductInfoSchema, BasicProductInfoSchema, ProductStatusSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { ProductFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { SUPABASE_BUCKET, SUPABASE_FOLDERS, uploadImage, deleteImage } from "@/components/providers/supabase/storage";
import { createAuditLog } from "@/app/(admin)/admin/logs/actions";

export async function getProducts(paginator: Paginator, filter: ProductFilter):Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: any = {
      ...notDeleted,
      ...(filter.name && {
        name: {
          contains: filter.name as string,
          mode: 'insensitive'
        }
      }),
      ...(filter.slug && {
        slug: {
          contains: filter.slug as string,
          mode: 'insensitive'
        }
      }),
      ...(filter.category && {
        category: {
          slug: filter.category
        }
      }),
    }

    // const validSortOrder = ['asc', 'desc'].includes(sorter.sortOrder as string) ? sorter.sortOrder as string : 'asc';
    // const sortableColumns = ["name", "slug", "sortOrder"];
    // const orderBy = sortableColumns.includes(sorter.sortColumn as string) ? {[sorter.sortColumn as string]: validSortOrder} : undefined;

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        costPrice: true,
        sellingPrice: true,
        discountPercentage: true,
        isFeatured: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        gender: true,
        ageGroup: true,
      },

      where: whereClause,
      skip: skip,
      take: pageSize,
      orderBy: {name: 'asc'},
    })

    const totalRecords = await prisma.product.count({
      where: whereClause
    });

    const serializedProducts = JSON.parse(JSON.stringify(products));

    if(!products) {
      return {
        success: false,
        message: en.data_retrieval_failed,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        products : serializedProducts,
        totalRecords : totalRecords
      }
    };

  } catch(error:any) {
    if (error instanceof AuthError) throw error;
    return { 
      success: false,
      error: error.message || en.data_retrieval_failed 
    };
  }
}

export async function getProductById(productId: string):Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const selectedProduct = await prisma.product.findUnique({
      where: {
        id: productId, ...notDeleted
      },
      select: {
        id: true,
        name: true,
        slug: true,
        ageGroup: true,
        gender: true,
        description: true,
        brand: true,
        material: true,
        careInstructions: true,
        costPrice: true,
        sellingPrice: true,
        discountPercentage: true,
        isFeatured: true,
        status: true,
        metaTitle: true,
        metaDescription: true,
        sizeGuide: true,

        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        productDesigns: {
          where: { deletedAt: null },
          select: {
            id: true,
            productId: true,
            designId: true,
            design: {
              select: {
                id: true,
                name: true,
              }
            },
          }
        },
        productImages: {
          select: {
            id: true,
            productId: true,
            colorId: true,
            imageUrl: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc',
          }
        },
        variants: {
          where: { deletedAt: null },
          select: {
            id: true,
            productId: true,
            colorId: true,
            sku: true,
            isActive: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
                swatchImageUrl: true,
              }
            },
            size: true,
          },
          orderBy: [
            { size: 'asc' },
            { color: { name: 'asc' } },
          ]
        },
      },
    });

    const serializedProducts = JSON.parse(JSON.stringify(selectedProduct));

    if(!selectedProduct) {
      return {
        success: false,
        message: en.data_retrieval_failed,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        product : serializedProducts,
      }
    };

  } catch(error:any) {
    if (error instanceof AuthError) throw error;
    return { 
      success: false,
      error: error.message || en.data_retrieval_failed 
    };
  }
}

export async function changeBasicInfo(data: BasicProductInfoSchema):Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = basicProductInfoSchema.parse(data);

    const existingProduct = await prisma.product.findUnique({
      where: {id : validatedData.id},
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        material: true,
        careInstructions: true,
        description: true,
        discountPercentage: true,
        metaTitle: true,
        metaDescription: true,
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        brand: validatedData.brand,
        material: validatedData.material,
        careInstructions: validatedData.careInstructions,
        description: validatedData.description,
        costPrice: validatedData.costPrice,
        sellingPrice: validatedData.sellingPrice,
        discountPercentage: validatedData.discountPercentage,
        gender: validatedData.gender,
        ageGroup: validatedData.ageGroup,
        categoryId: validatedData.category.id,
        metaTitle: validatedData.metaTitle,
        metaDescription: validatedData.metaDescription,
      }
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: updatedProduct.id,
      oldValues: existingProduct,
      newValues: { name: validatedData.name, slug: validatedData.slug },
      description: `Updated basic info for product "${validatedData.name}"`,
    });

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating product:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.product_update_failed,
    };
  }
}

export async function toggleFeaturedStatus(id: string):Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const existingProduct = await prisma.product.findUnique({
      where: {id : id},
      select: {
        id: true,
        isFeatured: true,
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        isFeatured: !existingProduct.isFeatured,
      },
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: updatedProduct.id,
      newValues: { isFeatured: !existingProduct.isFeatured },
      description: `Toggled featured status to ${!existingProduct.isFeatured}`,
    });

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating product:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.product_update_failed,
    };
  }
}

export async function changeProductStatus(id: string, newStatus: ProductStatus):Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validation = ProductStatusSchema.safeParse(newStatus);

    if (!validation.success) {
      return { 
        success: false, 
        error: "Invalid status value provided" 
      };
    }

    const validatedStatus = validation.data
    
    const existingProduct = await prisma.product.findUnique({
      where: {id : id},
      select: {
        id: true,
        status: true
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        status: validatedStatus as ProductStatus
      }
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: updatedProduct.id,
      oldValues: { status: existingProduct.status },
      newValues: { status: validatedStatus },
      description: `Changed product status from "${existingProduct.status}" to "${validatedStatus}"`,
    });

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating product:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.product_update_failed,
    };
  }
}

export async function createNewProduct(data: BasicProductInfoSchema):Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = basicProductInfoSchema.parse(data);

    const existingProducts = await prisma.product.findMany({
      where: {
        ...includingDeleted,
        OR : [
          {name: data.name},
          {slug: data.slug}
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true
      }
    });

    if(existingProducts.length > 0) {
      //non soft-deleted conflicts
      const activeConflicts = existingProducts.filter((cat) => cat.deletedAt === null);

      if(activeConflicts.length > 0) {
        const nameConflicts = activeConflicts.find((cat) => cat.name === validatedData.name);
        const slugConflicts = activeConflicts.find((cat) => cat.slug === validatedData.slug);

        if(nameConflicts && slugConflicts) {
          return {
            success: false,
            error: en.name_and_slug_already_exists
          }
        }
        if(nameConflicts) {
          return {
            success: false,
            error: en.name_already_exists
          }
        }
        if(slugConflicts) {
          return {
            success: false,
            error: en.slug_already_exists
          }
        }
      }

      const softDeletedId = existingProducts.map((cat) => cat.id);
      
      await prisma.product.deleteMany({
        where: {
          id: {in: softDeletedId}
        }
      })
    }

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        brand: validatedData.brand,
        material: validatedData.material,
        costPrice: validatedData.costPrice,
        sellingPrice: validatedData.sellingPrice,
        discountPercentage: validatedData.discountPercentage,
        careInstructions: validatedData.careInstructions,
        description: validatedData.description,
        gender: validatedData.gender,
        ageGroup: validatedData.ageGroup,
        categoryId: validatedData.category.id,
        metaDescription: validatedData.description,
        metaTitle: validatedData.name
      }
    });

    if(!product) {
      return {
        success: false,
        message: en.failed_to_create_product
      }
    } 

    revalidatePath("/admin/products");

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      newValues: { name: validatedData.name, slug: validatedData.slug },
      description: `Created product "${validatedData.name}"`,
    });

    return {
      success: true,
      data: validatedData
    }

  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error("Error creating product:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.product_update_failed,
    };
  }
}

export async function updateSizeGuide(productId: string, formData: FormData): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const file = formData.get("file") as File;
    if (!file || !file.size) return { success: false, error: en.failed_to_upload_image };

    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: { id: true, sizeGuide: true },
    });
    if (!product) return { success: false, error: en.product_doesnt_exist };

    if (product.sizeGuide) {
      try {
        const oldUrl = new URL(product.sizeGuide);
        const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (oldPath) await deleteImage(oldPath).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    const ext = file.name.split(".").pop();
    const storagePath = `${SUPABASE_FOLDERS.SIZE_GUIDES}/${productId}.${ext}`;
    const publicUrl = await uploadImage(file, storagePath, file.type);

    await prisma.product.update({
      where: { id: productId },
      data: { sizeGuide: publicUrl },
    });

    revalidatePath(`/admin/products/${productId}`);

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: productId,
      description: `Updated size guide for product`,
    });

    return { success: true, data: { imageUrl: publicUrl } };

  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating size guide:", error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_upload_image };
  }
}

export async function removeSizeGuide(productId: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: { id: true, sizeGuide: true },
    });
    if (!product) return { success: false, error: en.product_doesnt_exist };

    if (product.sizeGuide) {
      try {
        const url = new URL(product.sizeGuide);
        const path = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (path) await deleteImage(path).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { sizeGuide: null },
    });

    revalidatePath(`/admin/products/${productId}`);

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Product",
      entityId: productId,
      description: `Removed size guide from product`,
    });

    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error("Error removing size guide:", error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_remove_image };
  }
}

export async function addProductImage(productId: string, formData: FormData): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const file = formData.get("file") as File;
    if (!file || !file.size) return { success: false, error: en.failed_to_upload_image };

    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) return { success: false, error: en.product_doesnt_exist };

    const existingCount = await prisma.productImage.count({
      where: { productId, deletedAt: null },
    });

    if (existingCount >= 10) {
      return { success: false, error: en.product_image_limit_reached };
    }

    const newImage = await prisma.productImage.create({
      data: {
        productId,
        imageUrl: "",
        isPrimary: existingCount === 0,
        sortOrder: existingCount,
      },
    });

    const ext = file.name.split(".").pop();
    const storagePath = `${SUPABASE_FOLDERS.PRODUCTS}/${newImage.id}.${ext}`;

    let publicUrl: string;
    try {
      publicUrl = await uploadImage(file, storagePath, file.type);
    } catch {
      await prisma.productImage.delete({ where: { id: newImage.id } }).catch(() => null);
      return { success: false, error: en.failed_to_upload_image };
    }

    // Update the record with the real URL
    await prisma.productImage.update({
      where: { id: newImage.id },
      data: { imageUrl: publicUrl },
    });

    revalidatePath(`/admin/products/${productId}`);

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "ProductImage",
      entityId: newImage.id,
      newValues: { productId, imageUrl: publicUrl },
      description: `Added image to product`,
    });

    return { 
      success: true, 
      data: { 
        id: newImage.id, 
        imageUrl: publicUrl 
      } 
    };

  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error("Error adding product image:", error);

    if (error instanceof Error) return { 
      success: false, error: 
      error.message 
    };

    return { 
      success: false, 
      error: en.failed_to_upload_image 
    };
  }
}

export async function deleteProductImage(imageId: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const image = await prisma.productImage.findUnique({
      where: { id: imageId },
      select: { id: true, imageUrl: true, productId: true, deletedAt: true },
    });

    if (!image || image.deletedAt) {
      return { success: false, error: en.failed_to_remove_image };
    }

    try {
      const url = new URL(image.imageUrl);
      const path = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
      if (path) await deleteImage(path).catch(() => null);
    } catch {
      // URL might be a placeholder — ignore
    }

    // Hard delete the DB record
    await prisma.productImage.delete({ where: { id: imageId } });

    revalidatePath(`/admin/products/${image.productId}`);

    createAuditLog({
      userId: user.userId,
      action: "DELETE",
      entity: "ProductImage",
      entityId: imageId,
      description: `Deleted product image from product`,
    });

    return { success: true };

  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error("Error deleting product image:", error);

    if (error instanceof Error) return { 
      success: false, 
      error: error.message 
    };

    return { 
      success: false, 
      error: en.failed_to_remove_image 
    };
  }
}

export async function getAvailableDesigns(): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const designs = await prisma.design.findMany({
      where: { ...notDeleted, isActive: true },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: designs,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.data_retrieval_failed,
    };
  }
}

export async function assignDesignToProduct(productId: string, designId: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const product = await prisma.product.findUnique({
      where: { id: productId, deletedAt: null },
      select: { id: true },
    });
    if (!product) return { success: false, error: en.product_doesnt_exist };

    const design = await prisma.design.findFirst({
      where: { id: designId, ...notDeleted },
      select: { id: true, name: true },
    });
    if (!design) return { success: false, error: en.design_doesnt_exist };

    const existing = await prisma.productDesign.findFirst({
      where: { productId, designId },
    });

    let productDesign;
    let isNewAssignment = true;

    if (existing) {
      if (existing.deletedAt === null) {
        return { success: false, error: en.design_already_assigned };
      }
      productDesign = await prisma.productDesign.update({
        where: { id: existing.id },
        data: { deletedAt: null },
      });
      isNewAssignment = false;
    } else {
      productDesign = await prisma.productDesign.create({
        data: { productId, designId },
      });
    }

    revalidatePath(`/admin/products/${productId}`);

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "ProductDesign",
      entityId: productDesign.id,
      newValues: { productId, designId },
      description: isNewAssignment
        ? `Assigned design "${design.name}" to product`
        : `Re-assigned design "${design.name}" to product`,
    });

    return {
      success: true,
      data: {
        id: productDesign.id,
        productId,
        designId,
        design: { id: design.id, name: design.name },
      },
      message: en.design_assigned_to_product,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.failed_to_assign_design,
    };
  }
}

export async function removeDesignFromProduct(productDesignId: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const productDesign = await prisma.productDesign.findUnique({
      where: { id: productDesignId },
      select: {
        id: true,
        productId: true,
        design: { select: { name: true } },
      },
    });

    if (!productDesign) return { success: false, error: en.design_doesnt_exist };

    await prisma.productDesign.update({
      where: { id: productDesignId },
      data: { deletedAt: new Date() },
    });

    revalidatePath(`/admin/products/${productDesign.productId}`);

    createAuditLog({
      userId: user.userId,
      action: "DELETE",
      entity: "ProductDesign",
      entityId: productDesignId,
      description: `Removed design "${productDesign.design.name}" from product`,
    });

    return {
      success: true,
      message: en.design_removed_from_product,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.failed_to_remove_design,
    };
  }
}