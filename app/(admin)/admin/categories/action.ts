'use server'

import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { Paginator } from "@/types/table-types";

export async function getCategories(paginator: Paginator):Promise<ApiResponse> {
  try {
    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    //add a where clause 
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        sizeGuide: true,
        sortOrder: true,
      },
      orderBy: {slug:"asc"},
      skip: skip,
      take: pageSize
    })

    //use the same where clause here
    const totalRecords = await prisma.category.count({})

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
      error: error.message || 'Failed to delete category' 
    };
  }
}