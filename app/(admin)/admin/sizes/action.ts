'use server'

import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { AuthError, requireRole } from "@/lib/server-auth-guard";

export async function getSizes():Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);
    
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
    if (error instanceof AuthError) throw error;
    return { 
      success: false,
      error: error.message || en.data_retrieval_failed 
    };
  }
}