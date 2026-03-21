'use server'

import { en } from "@/lib/i18n/en";
import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { colorSchema, ColorSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { ColorFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";

export async function getColors(paginator: Paginator, filter: ColorFilter):Promise<ApiResponse> {
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
      ...(filter.hexCode && {
        hexCode: {
          contains: filter.hexCode as string,
          mode: 'insensitive'
        },
      })
    }
    
    const sizes = await prisma.color.findMany({
      select: {
        id: true,
        name: true,
        hexCode: true,
      },
      where: whereClause,
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.color.count({
      where: whereClause,
    })

    if(!sizes) {
      return {
        success: false,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        colors : sizes,
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

export async function createColor(data: ColorSchema):Promise<ApiResponse> {
  try{ 
    const validatedData = colorSchema.parse(data);

    const existingColor = await prisma.color.findUnique({
      where: {
        name: validatedData.name,
        ...includingDeleted,
      },
      select: {
        id: true,
        deletedAt: true,
      }
    })

    if(existingColor) {
      if(existingColor.deletedAt === null) {
        return {
          success: false,
          error: en.name_already_exists,
        }
      }
      
      const reActivatedColor = await prisma.color.update({
        where: { id: existingColor.id },
        data: {
          hexCode: validatedData.hexCode,
          deletedAt: null,
          isActive: true,
        }
      })

      if(!reActivatedColor) {
        return {
          success: false,
          error: en.failed_to_create_color,
        };
      }

      revalidatePath("/admin/colors");

      return {
        success: true,
        message: en.color_created_successfully,
      }
    }

    const newColor = await prisma.color.create({
      data: {
        name: validatedData.name,
        hexCode: validatedData.hexCode,
        createdAt: new Date(),
        isActive: true,
      }
    });

    if(!newColor) {
      return {
        success: false,
        error: en.failed_to_create_color,
      };
    }

    revalidatePath("/admin/colors");
    
    return {
      success: true,
      message: en.color_created_successfully,
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
      error: en.failed_to_create_color,
    };
  }
}

export async function deleteColorById(id: string):Promise<ApiResponse> {
  try {
    const color = await prisma.color.findUnique({
      where: { id: id , ...notDeleted},
      select: {
        id: true,
        name: true,
        hexCode: true,
      }
    })

    if(!color) {
      return {
        success: false,
        error: en.design_doesnt_exist
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
        error: en.failed_to_delete_color,
      }
    }

    revalidatePath('/admin/colors');

    return {
      success: true,
      message: en.color_deleted_successfully
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
      error: en.failed_to_delete_color,
    };
  }
}

export async function updateColorById(id: string, data: ColorSchema):Promise<ApiResponse> {
 try {
  const validatedData = colorSchema.parse(data);
 
  const color = await prisma.color.findUnique({
    where: { 
      id: id,
      ...notDeleted, 
    },
    select: {
      id: true,
      name: true,
      hexCode: true,
      deletedAt: true,
    }
  })

  if(!color) {
    return {
      success: false,
      error: en.color_doesnt_exist
    }
  }

  if(validatedData.name !== color.name) {
    const nameConflict = await prisma.color.findUnique({
      where: {
        name: validatedData.name,
        ...includingDeleted
      },
      select: {
        id: true,
        deletedAt: true,
      }
    })

    if(nameConflict && nameConflict.deletedAt === null) {
      return { success: false, error: en.name_already_exists };
    }

    if(nameConflict && nameConflict.deletedAt !== null) {
      await prisma.color.delete({
        where: {
          id: nameConflict.id
        }
      })
    }
  }

  const updatedColor = await prisma.color.update({
    where: {
      id: color.id
    },
    data: {
      name: validatedData.name,
      hexCode: validatedData.hexCode
    }
  })

  if(!updatedColor) {
    return {
      success: false,
      error: en.color_update_failed
    }
  }

  revalidatePath('/admin/colors');

  return {
    success: true,
    message: en.color_updated_successfully
  }

 } catch(error: any) {
  console.error("Error updating color:", error.message);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.color_update_failed,
    };
 }
}