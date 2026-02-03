'use server'

import { Color } from "@/generated/prisma/client";
import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { colorSchema, ColorSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";

export async function getColors(paginator: Paginator):Promise<ApiResponse> {
  try {
    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const sizes = await prisma.color.findMany({
      select: {
        id: true,
        name: true,
        hexCode: true,
      },
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.color.count({})

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

export async function createColor(data: ColorSchema):Promise<ApiResponse> {
  try{ 
    const validatedData = colorSchema.parse(data);

    const newColor = await prisma.color.create({
      data: {
        name: validatedData.name,
        hexCode: "#" + validatedData.hexCode,
        createdAt: new Date(),
        isActive: true,
      }
    });

    if(!newColor) {
      return {
        success: false,
        error: en.messages.failed_to_create_color,
      };
    }

    revalidatePath("/admin/colors");
    
    return {
      success: true,
      message: en.messages.color_created_successfully,
    };
  } catch(error: any) {
    console.error("Error creating color:", error.message);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.messages.failed_to_create_color,
    };
  }
}

export async function deleteColor(id: string):Promise<ApiResponse> {
  try {
    const color = await prisma.color.findUnique({
      where: { id: id },
      select: {
        id: true,
        name: true,
        hexCode: true,
      }
    })

    if(!color) {
      return {
        success: false,
        error: en.messages.design_doesnt_exist
      }
    }

    const deletedColor = await prisma.color.update({
      where: {
        id: color.id
      },
      data: {
        deletedAt: new Date(),
      }
    });

    if(!deletedColor) {
        return {
        success: false,
        error: en.messages.failed_to_delete_color,
      }
    }

    revalidatePath('/admin/colors');

    return {
      success: true,
      message: en.messages.color_deleted_successfully
    }
  } catch(error:any) {
    console.error("Error deleting color:", error.message);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.messages.failed_to_delete_color,
    };
  }
}

export async function updateColor(id: string, color: ColorSchema):Promise<ApiResponse> {
  console.log("test: ", color);
  return {
    success: false,
  }
}