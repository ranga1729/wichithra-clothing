'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { CategoryFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { promises as fs } from 'fs';
import { writeFile, mkdir } from "fs/promises";
import path, { join } from "path";
import { categorySchema, CategorySchema, categoryServerSchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";

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
        error: "Data retrieval failed"
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
      error: error.message || 'Failed to get categories' 
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
        error: "Failed to create category",
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
          error: "Category created but failed to add the size link",
        };
      }
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "New category created successfully",
    };
  } catch (error) {
    console.error("Error creating category:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to create category",
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
        error: "Category doesn't exist"
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
        error: "Category deletion failed"
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
            message: 'Category deleted. Image file was not found on disk.' 
        };
      }
      
    }
    
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: "Category deleted successfully"
    }
  } catch(error) {
    console.error("Error deleting category:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to delete category",
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
        error: "Category doesn't exist"
      }
    }

    if(!category.sizeGuide) {
      return {
        success: false,
        error: "No size guide for this category"
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
        error: "File doesn't exist or unable to fetch"
      }
    }

    return {
      success: true,
      data: {
        sizeGuide: `data:${mimeType};base64,${base64Image}`
      }
    }
  } catch(error) {
    console.error("Error deleting category:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to fetch size guide image",
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
        error: "Category doesn't exist"
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
        error: "Failed to update category",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category updated successfully",
      data: { updatedCategory }
    };
  } catch (error) {
    console.error("Error updating category:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to update category",
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
        error: "Category doesn't exist"
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
        error: "Failed to update active status",
      };
    }

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "Category updated successfully",
    };

  } catch(error) {
    console.error("Error toggling active status:", error);

    return {
      success: false,
      error: "Failed to toggle the active status",
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