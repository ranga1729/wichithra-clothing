'use server'

import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { CategoryFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { revalidatePath } from "next/cache";
import { en } from "@/lib/i18n/en";
import { SUPABASE_FOLDERS, deleteImage, moveTempToPermanent, extractStoragePathFromUrl } from "@/components/providers/supabase/storage";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { Prisma } from "@/generated/prisma/client";
import { CategoryListResponseSchema, CreateCategoryResponseSchema, DeleteCategoryResponseSchema, UpdateCategoryResponseSchema } from "@/schemas/server-action-responses";
import { baseCategorySchema, BaseCategorySchema, updateCategorySchema, UpdateCategorySchema } from "@/schemas/admin-schemas";

// ─── Helper: Slug conflict check ─────────────────────────────────────────────
// Returns an error message string if a conflict exists, or null if slug is safe.
async function checkSlugConflicts(slug: string, excludeId?: string): Promise<string | null> {
  const where: Prisma.CategoryWhereInput = {
    ...includingDeleted,
    ...(excludeId && { id: { not: excludeId } }),
    OR: [
      { slug: { equals: slug, mode: "insensitive" } },
    ],
  };

  const conflicts = await prisma.category.findMany({
    where,
    select: { id: true, slug: true, deletedAt: true },
  });

  if (conflicts.length === 0) return null;

  const activeConflict = conflicts.find((c) => c.deletedAt === null);
  if (activeConflict) return en.slug_already_exists;

  const softDeletedConflict = conflicts.find((c) => c.deletedAt !== null);
  if (softDeletedConflict) return en.slug_already_exists_in_a_deleted_record;

  return null;
}

// ─── Helper: Process size guide (temp → permanent, or removal) ────────────────
// Returns the final sizeGuide URL to persist in the DB.
async function processSizeGuide(newUrl: string | null | undefined, entityId: string,oldUrl: string | null): Promise<string | null> {
  // Removal: newUrl is null, old existed → delete old file
  if (newUrl === null && oldUrl) {
    try {
      const oldPath = extractStoragePathFromUrl(oldUrl);
      if (oldPath) await deleteImage(oldPath).catch(() => null);
    } catch { /* ignore */ }
    return null;
  }

  // Replacement or new: newUrl differs from old
  if (newUrl && newUrl !== oldUrl) {
    // Delete old file if one existed
    if (oldUrl) {
      try {
        const oldPath = extractStoragePathFromUrl(oldUrl);
        if (oldPath) await deleteImage(oldPath).catch(() => null);
      } catch { /* ignore */ }
    }

    // If it's a temp URL, move to permanent
    try {
      const tempPath = extractStoragePathFromUrl(newUrl);
      if (tempPath && tempPath.startsWith(`${SUPABASE_FOLDERS.TEMP}/`)) {
        const { publicUrl } = await moveTempToPermanent(
          tempPath,
          SUPABASE_FOLDERS.SIZE_GUIDES,
          entityId
        );
        return publicUrl;
      }
    } catch (err) {
      console.error("Failed to move size guide from temp:", err);
    }

    // Not a temp URL (or move failed) — use as-is
    return newUrl;
  }

  // No change
  return oldUrl;
}

// ─── Public server actions ───────────────────────────────────────────────────

export async function getCategories(paginator: Paginator, filter: CategoryFilter, sorter: Sorter) : Promise<ApiResponse<CategoryListResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: Prisma.CategoryWhereInput = {
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
      })
    }

    const validSortOrder = ['asc', 'desc'].includes(sorter.sortOrder as string) ? sorter.sortOrder as string : 'asc';
    const sortableColumns = ["name", "slug", "sortOrder"];
    const orderBy: Prisma.CategoryOrderByWithRelationInput | undefined = sortableColumns.includes(sorter.sortColumn as string) ? {[sorter.sortColumn as string]: validSortOrder} : undefined;

    const [categories, totalRecords] = await prisma.$transaction([
      prisma.category.findMany({
        select:{
          id:true,
          name:true,
          slug:true,
          description:true,
          sizeGuide:true,
          sortOrder:true,
          isActive:true
        },
        where:whereClause,
        orderBy,
        skip:skip,
        take:pageSize
      }),


      prisma.category.count({
        where:whereClause
      })

    ]);

    return {
      success:true,
      data: {
        categories: categories,
        totalRecords: totalRecords
      }
    };

  } catch(error:any) {
    if (error instanceof AuthError) throw error;
    console.error(en.failed_to_create_category + ": ", error);

    return { 
      success: false,
      error: error.message ?? en.data_retrieval_failed 
    };
  }
}

export async function createCategory(newCategory: BaseCategorySchema): Promise<ApiResponse<CreateCategoryResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedData = baseCategorySchema.parse(newCategory);

    const slugError = await checkSlugConflicts(validatedData.slug);

    if (slugError) {
      return { 
        success: false, 
        error: slugError 
      };
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
      },
      select: {
        id:true,
        name:true,
        slug:true,
        description:true,
        sizeGuide:true,
        sortOrder:true,
        isActive:true
      }
    });

    if(!category) {
      return {
        success: false,
        error: en.failed_to_create_category,
      };
    }

    const finalSizeGuideUrl = await processSizeGuide(
      validatedData.sizeGuide,
      category.id,
      null
    );

    if (finalSizeGuideUrl !== validatedData.sizeGuide) {
      await prisma.category.update({
        where: { id: category.id },
        data: { sizeGuide: finalSizeGuideUrl },
      });
      category.sizeGuide = finalSizeGuideUrl;
    }

    revalidatePath("/admin/categories");
  
    return {
      success: true,
      data: {
        category: category
      },
      message: en.category_created_successfully
    };
  } catch (error:any) {
    if (error instanceof AuthError) throw error;
    console.error(en.failed_to_create_category + ": ", error);
    
    return {
      success: false,
      error: en.failed_to_create_category,
    };
  }
}

export async function deleteCategoryById(id: string) : Promise<ApiResponse<DeleteCategoryResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const category = await prisma.category.findFirst({
      where: {id : id, ...notDeleted},
      select: {
        id:true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    if(!category) {
      return {
        success: false,
        error: en.category_doesnt_exist
      }
    }

    if(category._count.products > 0) {
       return {
        success: false,
        error: en.category_is_assigned_to_products
      }
    }

    const deletedCategory = await prisma.category.update({
      where: { id: category.id },
      data: {
        isActive: true,
        deletedAt: new Date()
      },
      select: {
        id: true,
        name:true,
        slug:true,
        description:true,
        sizeGuide:true,
        sortOrder:true,
        isActive:true,
        deletedAt: true,
      }
    });

    if(!deletedCategory) {
      return {
        success: false,
        error: en.Failed_to_delete_category
      }
    }
    
    revalidatePath('/admin/categories');

    return {
      success: true,
      data: {
        category: deletedCategory
      },
      message: en.category_deleted
    }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error(en.Failed_to_delete_category + ": ", error);
    
    return {
      success: false,
      error: en.Failed_to_delete_category,
    };
  }
}

export async function updateCategoryById(category: UpdateCategorySchema): Promise<ApiResponse<UpdateCategoryResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedData = updateCategorySchema.parse(category);

    const existingCategory = await prisma.category.findUnique({
      where: { id: validatedData.id, ...notDeleted },
      select: { id: true, sizeGuide: true },
    });

    if (!existingCategory) {
      return { 
        success: false, 
        error: en.category_doesnt_exist 
      };
    }

    const slugError = await checkSlugConflicts(validatedData.slug, validatedData.id);
    if (slugError) { 
      return { 
        success: false, 
        error: slugError 
      }; 
    }

    const finalSizeGuideUrl = await processSizeGuide(
      validatedData.sizeGuide,
      validatedData.id,
      existingCategory.sizeGuide
    );

    const updatedCategory = await prisma.category.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        sizeGuide: finalSizeGuideUrl,
        isActive: validatedData.isActive,
        sortOrder: validatedData.sortOrder,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        sortOrder: true,
        sizeGuide: true,
      }
    });

    if (!updatedCategory) {
      return { 
        success: false, 
        error: en.failed_to_update_category };
    }

    revalidatePath("/admin/categories");
    return { 
      success: true, 
      data: {
        category: updatedCategory
      },
      message: en.category_updated_successfully
    };

  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error(en.failed_to_update_category + ": ", error);

    return { 
      success: false, 
      error: en.failed_to_update_category 
    };
  }
}

export async function toggleActiveStatusById(id: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const existingCategory = await prisma.category.findUnique({
      where: { id: id, ...notDeleted},
      select: {
        id: true,
        isActive: true,
      }
    });

    if (!existingCategory) {
      return {
        success: false,
        error: en.category_doesnt_exist
      };
    }

    const updatedCategory = await prisma.category.update({
      where: { id: id},
      data: {
        isActive : !existingCategory.isActive
      },
      select: {
        isActive: true
      }
    })

    if (!updatedCategory) {
      return {
        success: false,
        error: en.failed_to_update_active_status,
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: en.category_updated_successfully,
    };

  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error( en.failed_to_update_category + ": ", error);

    return {
      success: false,
      error: en.failed_to_toggle_active_status,
    };
  }
}

export async function getCategorySelectorData():Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);
    
    const categories = await prisma.category.findMany({
      where: {
        ...notDeleted,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      }
    })

    if(!categories) {
      return {
        success: false,
        error: en.failed_to_get_category_selector_data,
      }
    }

    return {
      success: true,
      data: categories
    }
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
