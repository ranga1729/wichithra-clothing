'use server'

import { en } from "@/lib/i18n/en";
import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { colorSchema, ColorSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { ColorFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { SUPABASE_BUCKET, SUPABASE_FOLDERS, uploadImage, deleteImage } from "@/components/providers/supabase/storage";

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
        data: { colorId: existingColor.id },
        message: en.color_created_successfully,
      }
    }

    const newColor = await prisma.color.create({
      data: {
        name: validatedData.name,
        hexCode: validatedData.hexCode ?? null,
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
      data: { colorId: newColor.id },
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

  const updatedColor = await prisma.color.update({
    where: {
      id: color.id
    },
    data: {
      name: validatedData.name,
      hexCode: validatedData.hexCode ?? null,
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

export async function updateColorSwatch(colorId: string, formData: FormData): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const file = formData.get("file") as File;
    if (!file || !file.size) return { success: false, error: en.failed_to_upload_image };

    const color = await prisma.color.findUnique({
      where: { id: colorId, ...notDeleted },
      select: { id: true, swatchImageUrl: true },
    });
    if (!color) return { success: false, error: en.color_doesnt_exist };

    if (color.swatchImageUrl) {
      try {
        const oldUrl = new URL(color.swatchImageUrl);
        const oldPath = oldUrl.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (oldPath) await deleteImage(oldPath).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    const ext = file.name.split(".").pop();
    const storagePath = `${SUPABASE_FOLDERS.SWATCHES}/${colorId}.${ext}`;
    const publicUrl = await uploadImage(file, storagePath, file.type);

    await prisma.color.update({
      where: { id: colorId },
      data: { swatchImageUrl: publicUrl },
    });

    revalidatePath("/admin/colors");
    return { success: true, data: { imageUrl: publicUrl } };

  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Error updating color swatch:", error.message);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_upload_image };
  }
}

export async function removeColorSwatch(colorId: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const color = await prisma.color.findUnique({
      where: { id: colorId, ...notDeleted },
      select: { id: true, swatchImageUrl: true },
    });
    if (!color) return { success: false, error: en.color_doesnt_exist };

    if (color.swatchImageUrl) {
      try {
        const url = new URL(color.swatchImageUrl);
        const path = url.pathname.split(`/object/public/${SUPABASE_BUCKET}/`)[1];
        if (path) await deleteImage(path).catch(() => null);
      } catch { /* ignore URL parse errors */ }
    }

    await prisma.color.update({
      where: { id: colorId },
      data: { swatchImageUrl: null },
    });

    revalidatePath("/admin/colors");
    return { success: true };

  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Error removing color swatch:", error.message);
    if (error instanceof Error) return { success: false, error: error.message };
    return { success: false, error: en.failed_to_remove_image };
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