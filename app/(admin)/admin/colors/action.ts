'use server'

import { en } from "@/lib/i18n/en";
import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { colorSchema, ColorSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { ColorFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { SUPABASE_BUCKET, SUPABASE_FOLDERS, moveTempToPermanent, deleteImage } from "@/components/providers/supabase/storage";

export async function getColors(paginator: Paginator, filter: ColorFilter):Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

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
    
    const colors = await prisma.color.findMany({
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
      },
      where: whereClause,
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.color.count({
      where: whereClause,
    })

    if(!colors) {
      return {
        success: false,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        colors : colors,
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

export async function createColor(data: ColorSchema):Promise<ApiResponse> {
  try{ 
    await requireRole(["admin", "super-admin"]);
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
          hexCode: validatedData.hexCode ?? null,
          swatchImageUrl: validatedData.swatchImageUrl ?? null,
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

      if (validatedData.swatchImageUrl?.includes(`/${SUPABASE_FOLDERS.TEMP}/`)) {
        const url = new URL(validatedData.swatchImageUrl);
        const tempPath = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        try {
          const { publicUrl } = await moveTempToPermanent(tempPath, SUPABASE_FOLDERS.SWATCHES, existingColor.id);
          await prisma.color.update({ where: { id: existingColor.id }, data: { swatchImageUrl: publicUrl } });
        } catch {
          await deleteImage(tempPath).catch(() => null);
          return { success: false, error: en.color_create_and_failed_adding_swatch };
        }
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
        hexCode: validatedData.hexCode ?? null,
        swatchImageUrl: validatedData.swatchImageUrl ?? null,
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

    if (validatedData.swatchImageUrl?.includes(`/${SUPABASE_FOLDERS.TEMP}/`)) {
      const url = new URL(validatedData.swatchImageUrl);
      const tempPath = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
      try {
        const { publicUrl } = await moveTempToPermanent(tempPath, SUPABASE_FOLDERS.SWATCHES, newColor.id);
        await prisma.color.update({ where: { id: newColor.id }, data: { swatchImageUrl: publicUrl } });
      } catch {
        await deleteImage(tempPath).catch(() => null);
        await prisma.color.delete({ where: { id: newColor.id } }).catch(() => null);
        return { success: false, error: en.color_create_and_failed_adding_swatch };
      }
    }

    revalidatePath("/admin/colors");
    
    return {
      success: true,
      message: en.color_created_successfully,
    };
  } catch(error: any) {
    if (error instanceof AuthError) throw error;
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
    await requireRole(["admin", "super-admin"]);

    const color = await prisma.color.findUnique({
      where: { id: id , ...notDeleted},
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
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

    if (color.swatchImageUrl) {
      try {
        const oldUrl = new URL(color.swatchImageUrl);
        const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (oldPath) await deleteImage(oldPath).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    revalidatePath('/admin/colors');

    return {
      success: true,
      message: en.color_deleted_successfully
    }
  } catch(error:any) {
    if (error instanceof AuthError) throw error;
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
  await requireRole(["admin", "super-admin"]);

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
      swatchImageUrl: true,
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

  let finalSwatchImageUrl: string | null = color.swatchImageUrl;

  const incomingSwatchUrl = validatedData.swatchImageUrl || "";
  const isNewTempUpload = incomingSwatchUrl.includes(`/${SUPABASE_FOLDERS.TEMP}/`);
  const swatchWasCleared = !incomingSwatchUrl && !!color.swatchImageUrl;

  if (isNewTempUpload) {
    const url = new URL(incomingSwatchUrl);
    const tempPath = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
    try {
      const { publicUrl } = await moveTempToPermanent(tempPath, SUPABASE_FOLDERS.SWATCHES, color.id);
      finalSwatchImageUrl = publicUrl;
      if (color.swatchImageUrl && color.swatchImageUrl !== publicUrl) {
        const oldUrl = new URL(color.swatchImageUrl);
        const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (oldPath) await deleteImage(oldPath).catch(() => null);
      }
    } catch {
      await deleteImage(tempPath).catch(() => null);
      return { success: false, error: en.data_updatated_but_failed_to_update_image };
    }
  } else if (swatchWasCleared) {
    try {
      const oldUrl = new URL(color.swatchImageUrl!);
      const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
      if (oldPath) await deleteImage(oldPath).catch(() => null);
    } catch { /* ignore URL parse errors */ }
    finalSwatchImageUrl = null;
  }

  const updatedColor = await prisma.color.update({
    where: {
      id: color.id
    },
    data: {
      name: validatedData.name,
      hexCode: validatedData.hexCode ?? null,
      swatchImageUrl: finalSwatchImageUrl,
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
  if (error instanceof AuthError) throw error;
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

export async function getColorSelectorData():Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);
    
    const colors = await prisma.color.findMany({
      where: {
        ...notDeleted,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
      },
      orderBy: {
        name: 'asc',
      }
    })

    if(!colors) {
      return {
        success: false,
        error: en.failed_to_get_category_selector_data,
      }
    }

    return {
      success: true,
      data: colors
    }
  } catch(error) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating product:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.product_update_failed,
    };
  }
}