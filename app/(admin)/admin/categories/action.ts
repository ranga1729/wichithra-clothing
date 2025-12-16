'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { CategoryFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";

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

import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { categorySchema, CategorySchema, categoryServerSchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";

export async function createCategory(newCategory: CategorySchema):Promise<ApiResponse> {
  try {
    const validatedData = categorySchema.parse(newCategory);
    let sizeGuidePath: string | undefined = undefined;

    if (validatedData.sizeGuide && validatedData.sizeGuide.size > 0) {
      const timestamp = Date.now();
      const fileExtension = validatedData.sizeGuide.name.split(".").pop();
      const fileName = `${validatedData.slug}-${timestamp}.${fileExtension}`;

      const uploadDir = join(process.cwd(), "public", "uploads", "size-guides");

      try {
        await mkdir(uploadDir, { recursive: true });
      } catch (error) {
        console.error("Error creating directory:", error);
      }

      const bytes = await validatedData.sizeGuide.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      sizeGuidePath = `/uploads/size-guides/${fileName}`;
    }

    const category = await prisma.category.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
        sortOrder: validatedData.sortOrder,
        sizeGuide: sizeGuidePath,
      }
    });

    revalidatePath("/admin/categories");

    return {
      success: true,
      message: "New category created successfully",
      data: category,
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