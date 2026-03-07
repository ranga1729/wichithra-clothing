'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { CategoryFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { promises as fs } from 'fs';
import { writeFile, mkdir } from "fs/promises";
import path, { join } from "path";
import { CategorySchema, categorySchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";
import { en } from "@/lib/i18n/en";

export async function getCategories(paginator: Paginator, filter: CategoryFilter, sorter: Sorter):Promise<ApiResponse> {
  try {
    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: any = {
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
        message: en.data_retrieval_failed,
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

    if (validatedData.sizeGuide && validatedData.sizeGuide.size > 0) {
      const fileExtension = validatedData.sizeGuide.name.split(".").pop();
      const fileName = `${category.id}.${fileExtension}`;

      const uploadDir = join(process.cwd(), "public", "uploads", "size-guides");

      await mkdir(uploadDir, { recursive: true });

      const bytes = await validatedData.sizeGuide.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      sizeGuidePath = `/uploads/size-guides/${fileName}`;

      const updatedCategory = await prisma.category.update({
        where: {
          id: category.id
        },
        data : {
          sizeGuide: sizeGuidePath,
        }
      })

      if(!updatedCategory) {
        return {
          success: false,
          error: en.category_create_and_failed_adding_sizeguide,
        };
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

export async function deleteCategory(id: string):Promise<ApiResponse> {
  try {
    const category = await prisma.category.findUnique({
      where: {id : id},
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
        error: en.category_deletion_failed
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
    console.error(en.category_deletion_failed + ": ", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.category_deletion_failed,
    };
  }
}

export async function fetchSizeGuide(id: string):Promise<ApiResponse> {
  try {
    const category = await prisma.category.findUnique({
      where: {id : id},
      select: {
        sizeGuide: true,
      }
    })

    if(!category) {
      return {
        success: false,
        error: en.category_doesnt_exist
      }
    }

    if(!category.sizeGuide) {
      return {
        success: false,
        error: en.no_size_guide_for_this_category
      }
    }

    const url = new URL(category.sizeGuide, 'http://localhost');
    const relativePath = url.pathname;
    
    const filePath = path.join(process.cwd(), 'public', relativePath);

    const sizeGuide = await fs.readFile(filePath);
    
    const base64Image = sizeGuide.toString('base64');
    const mimeType = getMimeType(filePath);

    if(!sizeGuide) {
      return {
        success: false,
        error: en.file_doesnt_exist_or_unable_to_fetch
      }
    }

    return {
      success: true,
      data: {
        sizeGuide: `data:${mimeType};base64,${base64Image}`
      }
    }
  } catch(error) {
    console.error(en.error_fetching_sizeguide + ": ", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.failed_to_fetch_sizeguide,
    };
  }
}

export async function updateCategory(id: string, updatedData: CategorySchema): Promise<ApiResponse> {
  try {
    const validatedData = categorySchema.parse(updatedData);

    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
      select: {
        id: true,
        sizeGuide: true,
      }
    });

    if (!existingCategory) {
      return {
        success: false,
        error: en.category_doesnt_exist
      };
    }

    let sizeGuidePath: string | undefined = existingCategory.sizeGuide || undefined;
    let shouldDeleteOldImage = false;

    if (validatedData.sizeGuide && validatedData.sizeGuide.size > 0) {
      if (existingCategory.sizeGuide) {
        shouldDeleteOldImage = true;
      }

      const fileExtension = validatedData.sizeGuide.name.split(".").pop();
      const fileName = `${existingCategory.id}.${fileExtension}`;

      const uploadDir = join(process.cwd(), "public", "uploads", "size-guides");

      await mkdir(uploadDir, { recursive: true });

      const bytes = await validatedData.sizeGuide.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      sizeGuidePath = `/uploads/size-guides/${fileName}`;

      // Delete old image if it exists and has a different extension
      if (shouldDeleteOldImage && existingCategory.sizeGuide) {
        const oldImagePath = path.join(
          process.cwd(),
          "public",
          existingCategory.sizeGuide
        );

        // Only delete if the old file path is different from the new one
        const newImagePath = join(process.cwd(), "public", sizeGuidePath);
        if (oldImagePath !== newImagePath) {
          await fs.unlink(oldImagePath);
        }
      }
    }

    // Update category in database
    const updatedCategory = await prisma.category.update({
      where: { id: existingCategory.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
        sizeGuide: sizeGuidePath,
      }
    });

    if (!updatedCategory) {
      return {
        success: false,
        error: en.failed_to_update_category,
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: en.category_updated_successfully,
      data: { updatedCategory }
    };
  } catch (error) {
    console.error( en.failed_to_update_category + ": ", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.failed_to_update_category,
    };
  }
}

export async function toggleActiveStatusOfCategory(id: string): Promise<ApiResponse> {
  try {
    const existingCategory = await prisma.category.findUnique({
      where: { id: id },
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