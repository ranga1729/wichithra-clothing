'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { Paginator } from "@/types/table-types";

export async function getSizes():Promise<ApiResponse> {
  try {
    const sizes = await prisma.size.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        sortOrder: true,
        isActive: true,
      },
    })

    const totalRecords = await prisma.size.count({})

    if(!sizes) {
      return {
        success: false,
        error: en.data_retrieval_failed
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
      error: error.message || en.data_retrieval_failed 
    };
  }
}