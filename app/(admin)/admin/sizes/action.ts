'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { Paginator } from "@/types/table-types";

export async function getSizes(paginator: Paginator):Promise<ApiResponse> {
  try {
    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const sizes = await prisma.size.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
        isActive: true,
      },
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.size.count({})

    if(!sizes) {
      return {
        success: false,
        error: en.messages.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        sizes : sizes,
        totalRecords : totalRecords
      }
    };

  } catch(error:any) {
    return { 
      success: false,
      error: error.message || en.messages.data_retrieval_failed 
    };
  }
}