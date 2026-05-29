'use server'

import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { CategoryFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { promises as fs } from 'fs';
import path from "path";
import { CategorySchema, categorySchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";
import { en } from "@/lib/i18n/en";
import { SUPABASE_BUCKET, SUPABASE_FOLDERS, uploadImage, deleteImage } from "@/components/providers/supabase/storage";
import { AuthError, requireRole } from "@/lib/server-auth-guard";

export async function getCategories(paginator: Paginator, filter: CategoryFilter, sorter: Sorter):Promise<ApiResponse> {
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
      })
    }

    const validSortOrder = ['asc', 'desc'].includes(sorter.sortOrder as string) ? sorter.sortOrder as string : 'asc';
    const sortableColumns = ["name", "slug", "sortOrder"];
    const orderBy = sortableColumns.includes(sorter.sortColumn as string) ? {[sorter.sortColumn as string]: validSortOrder} : undefined;

    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sizeGuide: true,
        sortOrder: true,
        isActive: true,
      },
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.category.count({
      where: whereClause
    })

    if(!categories) {
      return {
        success: false,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        categories : categories,
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

export async function createCategory(newCategory: CategorySchema):Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedData = categorySchema.parse(newCategory);
    let sizeGuidePath: string | undefined = undefined;

    const existingCategories = await prisma.category.findMany({
      where: {
        ...includingDeleted,
        OR : [
          {name: newCategory.name},
          {slug: newCategory.slug}
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true
      }
    });

    if(existingCategories.length > 0) {
      //non soft-deleted conflicts
      const activeConflicts = existingCategories.filter((cat) => cat.deletedAt === null);

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

      const softDeletedId = existingCategories.map((cat) => cat.id);
      
      await prisma.category.deleteMany({
        where: {
          id: {in: softDeletedId}
        }
      })
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
      }
    });

    if(!category) {
      return {
        success: false,
        error: en.failed_to_create_category,
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      data: { categoryId: category.id },
      message: en.category_created_successfully,
    };
  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error(en.failed_to_create_category + ": ", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.failed_to_create_category,
    };
  }
}

export async function deleteCategoryById(id: string):Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const category = await prisma.category.findUnique({
      where: {id : id, ...notDeleted},
      select: {
        id: true,
        sizeGuide: true,
      }
    })

    if(!category) {
      return {
        success: false,
        error: en.category_doesnt_exist
      }
    }

    const deletedCategory = await prisma.category.update({
      where: { id: category.id },
      data: {
       deletedAt: new Date()
      }
    });

    if(!deletedCategory) {
      return {
        success: false,
        error: en.Failed_to_delete_category
      }
    }

    if(deletedCategory.sizeGuide) {
      const imagePath = path.join(
        process.cwd(),
        "public",
        deletedCategory.sizeGuide
      )
      
      try {
        await fs.unlink(imagePath);
      } catch(error) {
        return { 
            success: true, 
            message: en.category_deleted_image_not_exist 
        };
      }
      
    }
    
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: en.category_deleted
    }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error(en.Failed_to_delete_category + ": ", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.Failed_to_delete_category,
    };
  }
}

export async function updateCategoryById(id: string, updatedData: CategorySchema): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const validatedData = categorySchema.parse(updatedData);

    const existingCategory = await prisma.category.findUnique({
      where: { id, ...notDeleted },
      select: { id: true, sizeGuide: true },
    });

    if (!existingCategory) {
      return { success: false, error: en.category_doesnt_exist };
    }

    const conflicts = await prisma.category.findMany({
      where: {
        ...includingDeleted,
        id: { not: id },
        OR: [
          { name: updatedData.name }, 
          { slug: updatedData.slug }
        ],
      },
      select: { 
        id: true, 
        name: true, 
        slug: true, 
        deletedAt: true 
      },
    });

    if (conflicts.length > 0) {
      const activeConflicts = conflicts.filter((cat) => cat.deletedAt === null);

      if (activeConflicts.length > 0) {
        const nameConflict = activeConflicts.find((cat) => cat.name === validatedData.name);
        const slugConflict = activeConflicts.find((cat) => cat.slug === validatedData.slug);
        
        if (nameConflict && slugConflict) return { success: false, error: en.name_and_slug_already_exists };
        if (nameConflict) return { success: false, error: en.name_already_exists };
        if (slugConflict) return { success: false, error: en.slug_already_exists };
      }

      await prisma.category.deleteMany({
        where: { id: { in: conflicts.map((c) => c.id) } },
      });
    }

    let finalSizeGuideUrl: string | null = existingCategory.sizeGuide;

    const updatedCategory = await prisma.category.update({
      where: { id: existingCategory.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
        sizeGuide: finalSizeGuideUrl,
      },
    });

    if (!updatedCategory) {
      return { success: false, error: en.failed_to_update_category };
    }

    revalidatePath("/admin/categories");
    return { success: true, message: en.category_updated_successfully, data: { updatedCategory } };

  } catch (error) {
    if (error instanceof AuthError) throw error;
    console.error(en.failed_to_update_category + ": ", error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_update_category };
  }
}

export async function updateCategorySizeGuide(categoryId: string, formData: FormData): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const file = formData.get("file") as File;
    if (!file || !file.size) return { success: false, error: en.failed_to_upload_image };

    const category = await prisma.category.findUnique({
      where: { id: categoryId, ...notDeleted },
      select: { id: true, sizeGuide: true },
    });
    if (!category) return { success: false, error: en.category_doesnt_exist };

    if (category.sizeGuide) {
      try {
        const oldUrl = new URL(category.sizeGuide);
        const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (oldPath) await deleteImage(oldPath).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    const ext = file.name.split(".").pop();
    const storagePath = `${SUPABASE_FOLDERS.SIZE_GUIDES}/${categoryId}.${ext}`;
    const publicUrl = await uploadImage(file, storagePath, file.type);

    await prisma.category.update({
      where: { id: categoryId },
      data: { sizeGuide: publicUrl },
    });

    revalidatePath("/admin/categories");
    return { success: true, data: { imageUrl: publicUrl } };

  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating category size guide:", error.message);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_upload_image };
  }
}

export async function removeCategorySizeGuide(categoryId: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const category = await prisma.category.findUnique({
      where: { id: categoryId, ...notDeleted },
      select: { id: true, sizeGuide: true },
    });
    if (!category) return { success: false, error: en.category_doesnt_exist };

    if (category.sizeGuide) {
      try {
        const url = new URL(category.sizeGuide);
        const storagePath = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (storagePath) await deleteImage(storagePath).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { sizeGuide: null },
    });

    revalidatePath("/admin/categories");
    return { success: true };

  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Error removing category size guide:", error.message);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_remove_image };
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


function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return mimeTypes[ext] || 'image/jpeg';
}