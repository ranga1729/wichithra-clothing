'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { DesignFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { designSchema, DesignSchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";

export async function getDesign(paginator: Paginator, filter: DesignFilter, sorter: Sorter):Promise<ApiResponse> {
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
    const sortableColumns = ["name", "slug"];
    const orderBy = sortableColumns.includes(sorter.sortColumn as string) ? {[sorter.sortColumn as string]: validSortOrder} : undefined;

    const designs = await prisma.design.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.design.count({
      where: whereClause
    })

    if(!designs) {
      return {
        success: false,
        error: "Data retrieval failed"
      }
    }

    return {
      success: true,
      data: {
        categories : designs,
        totalRecords : totalRecords
      }
    };

  } catch(error:any) {
    return { 
      success: false,
      error: error.message || 'Failed to get designs' 
    };
  }
}

export async function createDesign(newDesign: DesignSchema):Promise<ApiResponse> {
  try {
    const validatedData = designSchema.parse(newDesign);
    let sizeGuidePath: string | undefined = undefined;

    const design = await prisma.design.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
      }
    });

    if(!design) {
      return {
        success: false,
        error: "Failed to create design",
      };
    }

    revalidatePath("/admin/design");

    return {
      success: true,
      message: "New design created successfully",
    };
  } catch (error) {
    console.error("Error creating design:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to create design",
    };
  }
}

export async function deleteDesign(id: string):Promise<ApiResponse> {
  try {
    const design = await prisma.design.findUnique({
      where: {id : id},
      select: {
        id: true,
      }
    })

    if(!design) {
      return {
        success: false,
        error: "Design doesn't exist"
      }
    }

    const deletedDesign = await prisma.design.delete({
      where: {
        id: design.id
      }
    });

    if(!deletedDesign) {
      return {
        success: false,
        error: "Design deletion failed"
      }
    }
    
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: "Design deleted successfully"
    }
  } catch(error) {
    console.error("Error deleting design:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to delete design",
    };
  }
}

export async function updateDesign(id: string, updatedDesign: DesignSchema): Promise<ApiResponse> {
  try {
    const validatedData = designSchema.parse(updatedDesign);

    const existingDesign = await prisma.design.findUnique({
      where: { id: id },
      select: {
        id: true,
      }
    });

    if (!existingDesign) {
      return {
        success: false,
        error: "Design doesn't exist"
      };
    }

    const design = await prisma.design.update({
      where: { id: existingDesign.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
      }
    });

    if (!design) {
      return {
        success: false,
        error: "Failed to update design",
      };
    }

    revalidatePath("/admin/design");

    return {
      success: true,
      message: "Design updated successfully",
      data: { design: design }
    };
  } catch (error) {
    console.error("Error updating design:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: "Failed to update design",
    };
  }
}