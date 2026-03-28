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
import { SUPABASE_BUCKET, SUPABASE_FOLDERS, moveTempToPermanent, deleteImage } from "@/components/providers/supabase/storage";

export async function getCategories(paginator: Paginator, filter: CategoryFilter, sorter: Sorter):Promise<ApiResponse> {
  try {
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
    return { 
      success: false,
      error: error.message || en.data_retrieval_failed 
    };
  }
}

export async function createCategory(newCategory: CategorySchema):Promise<ApiResponse> {
  try {
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
        sizeGuide: validatedData.sizeGuide,
      }
    });

    if(!category) {
      return {
        success: false,
        error: en.failed_to_create_category,
      };
    }

    if (validatedData.sizeGuide) {
      const url = new URL(validatedData.sizeGuide);
      const tempPath = url.pathname
        .split(`/object/public/${SUPABASE_BUCKET}/`)[1];

      try{ 
        const { publicUrl } = await moveTempToPermanent(
          tempPath,
          SUPABASE_FOLDERS.SIZE_GUIDES,
          category.id
        );

        const updatedCategory = await prisma.category.update({
          where: { id: category.id },
          data: { sizeGuide: publicUrl },
        });

        if(!updatedCategory) {
          await deleteImage(`${SUPABASE_FOLDERS.SIZE_GUIDES}/${category.id}.${tempPath.split(".").pop()}`).catch(() => null);
          await prisma.category.delete({ where: { id: category.id } }).catch(() => null);
          return { success: false, error: en.category_create_and_failed_adding_sizeguide };
        }
      } catch {
        await deleteImage(tempPath).catch(() => null);
        await prisma.category.delete({ where: { id: category.id } }).catch(() => null);
        return { success: false, error: en.category_create_and_failed_adding_sizeguide };
      }
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: en.category_created_successfully,
    };
  } catch (error) {
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

    const incomingUrl = validatedData.sizeGuide || "";
    const isNewTempUpload = incomingUrl.includes(`/${SUPABASE_FOLDERS.TEMP}/`);
    const imageWasCleared = !incomingUrl && existingCategory.sizeGuide;

    if (isNewTempUpload) {
      const url = new URL(incomingUrl);
      const tempPath = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
      
      if (!tempPath) {
        console.error("Path extraction failed. URL:", incomingUrl, "Bucket constant:", SUPABASE_BUCKET);
        return { success: false, error: en.data_updatated_but_failed_to_update_image };
      }

      try {
        const { publicUrl } = await moveTempToPermanent(
          tempPath,
          SUPABASE_FOLDERS.SIZE_GUIDES,
          existingCategory.id
        );

        finalSizeGuideUrl = publicUrl;

        // Delete the old permanent image only after the new one is in place
        // (move already overwrites via upsert:true — but if the extension changed,
        //  the old file would be orphaned, so delete it explicitly)
        if (existingCategory.sizeGuide && existingCategory.sizeGuide !== publicUrl) {
          const oldUrl = new URL(existingCategory.sizeGuide);
          const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
          if (oldPath) await deleteImage(oldPath).catch(() => null);
        }
      } catch {
        await deleteImage(tempPath).catch(() => null);
        return { 
          success: false, 
          error: en.data_updatated_but_failed_to_update_image 
        };
      }
    } else if (imageWasCleared) {
      // User explicitly removed the image — delete it from storage
      const oldUrl = new URL(existingCategory.sizeGuide!);
      const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
      if (oldPath) await deleteImage(oldPath).catch(() => null);
      finalSizeGuideUrl = null;
    }
    // if the image was unchanged, it stays the same

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
    console.error(en.failed_to_update_category + ": ", error);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_update_category };
  }
}

export async function toggleActiveStatusById(id: string): Promise<ApiResponse> {
  try {
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
    console.error( en.failed_to_update_category + ": ", error);

    return {
      success: false,
      error: en.failed_to_toggle_active_status,
    };
  }
}

export async function getCategorySelectorData():Promise<ApiResponse> {
  try {
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