'use server'

import { en } from "@/lib/i18n/en";
import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { baseColorSchema, BaseColorSchema, UpdateColorSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { ColorFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { SUPABASE_FOLDERS, moveTempToPermanent, deleteImage, extractStoragePathFromUrl } from "@/components/providers/supabase/storage";
import { Prisma } from "@/generated/prisma/client";
import { createAuditLog } from "@/app/(admin)/admin/logs/actions";
import { ColorListResponseSchema, CreateColorResponseSchema, DeleteColorResponseSchema, UpdateColorResponseSchema } from "@/schemas/server-action-responses";

// Helper: Name conflict check (soft-delete aware)
async function checkNameConflicts(name: string, excludeId?: string): Promise<string | null> {
  const where: Prisma.ColorWhereInput = {
    ...includingDeleted,
    ...(excludeId && { id: { not: excludeId } }),
    name: { equals: name, mode: "insensitive" },
  };

  const conflicts = await prisma.color.findMany({
    where,
    select: { id: true, name: true, deletedAt: true },
  });

  if (conflicts.length === 0) return null;

  const activeConflict = conflicts.find((c) => c.deletedAt === null);
  if (activeConflict) return en.name_already_exists;

  const softDeletedConflict = conflicts.find((c) => c.deletedAt !== null);
  if (softDeletedConflict) return en.name_already_exists_in_a_deleted_record;

  return null;
}

// Helper: Process swatch image from temp URL to permanent location
// If newUrl is a temp URL, moves it to permanent. If null, removes old.
// Returns the final public URL or null.
async function processSwatchImage(newUrl: string | null | undefined, entityId: string, oldUrl: string | null): Promise<string | null> {
  // Removal: newUrl is null/empty and old exists
  if ((!newUrl || newUrl === "") && oldUrl) {
    try {
      const oldPath = extractStoragePathFromUrl(oldUrl);
      if (oldPath) await deleteImage(oldPath).catch(() => null);
    } catch { /* ignore */ }
    return null;
  }

  // New URL provided
  if (newUrl) {
    const isTempUrl = newUrl.includes(`/${SUPABASE_FOLDERS.TEMP}/`);

    if (isTempUrl) {
      // Delete old if exists
      if (oldUrl) {
        try {
          const oldPath = extractStoragePathFromUrl(oldUrl);
          if (oldPath) await deleteImage(oldPath).catch(() => null);
        } catch { /* ignore */ }
      }

      // Extract temp path from URL and move to permanent
      const tempPath = extractStoragePathFromUrl(newUrl);
      if (tempPath) {
        const { publicUrl } = await moveTempToPermanent(tempPath, SUPABASE_FOLDERS.SWATCHES, entityId);
        return publicUrl;
      }
    }

    // Non-temp URL (already permanent) — return as-is
    return newUrl;
  }

  // No change
  return oldUrl;
}

// ─── GET Colors (List) ──────────────────────────────────────────────────────
export async function getColors(paginator: Paginator, filter: ColorFilter): Promise<ApiResponse<ColorListResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: Prisma.ColorWhereInput = {
      ...notDeleted,
      ...(filter.name && {
        name: { contains: filter.name, mode: "insensitive" },
      }),
      ...(filter.hexCode && {
        hexCode: { contains: filter.hexCode, mode: "insensitive" },
      }),
    };

    const [colors, totalRecords] = await prisma.$transaction([
      prisma.color.findMany({
        select: {
          id: true,
          name: true,
          hexCode: true,
          swatchImageUrl: true,
          isActive: true,
        },
        where: whereClause,
        orderBy: { name: "asc" },
        skip,
        take: pageSize,
      }),
      prisma.color.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: { colors, totalRecords },
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message ?? en.data_retrieval_failed,
    };
  }
}

// CREATE Color
export async function createColor(newColor: BaseColorSchema): Promise<ApiResponse<CreateColorResponseSchema>> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = baseColorSchema.parse(newColor);

    const nameError = await checkNameConflicts(validatedData.name);
    if (nameError) {
      return { success: false, error: nameError };
    }

    const color = await prisma.color.create({
      data: {
        name: validatedData.name,
        hexCode: validatedData.hexCode ?? null,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
        isActive: true,
      },
    });

    // Move swatch image from temp to permanent if provided
    if (validatedData.swatchImageUrl) {
      const finalUrl = await processSwatchImage(validatedData.swatchImageUrl, color.id, null);
      if (finalUrl !== validatedData.swatchImageUrl) {
        await prisma.color.update({
          where: { id: color.id },
          data: { swatchImageUrl: finalUrl },
        });
        color.swatchImageUrl = finalUrl;
      }
    }

    revalidatePath("/admin/colors");

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "Color",
      entityId: color.id,
      newValues: color,
      description: `Created color "${color.name}"`,
    });

    return {
      success: true,
      data: { color },
      message: en.color_created_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Create color error:", error);

    return {
      success: false,
      error: en.failed_to_create_color,
    };
  }
}

// UPDATE Color
export async function updateColorById(data: UpdateColorSchema): Promise<ApiResponse<UpdateColorResponseSchema>> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = await import("@/schemas/admin-schemas").then(m =>
      m.updateColorSchema.parse(data)
    );

    const nameError = await checkNameConflicts(validatedData.name, validatedData.id);
    if (nameError) {
      return { success: false, error: nameError };
    }

    const existingColor = await prisma.color.findUnique({
      where: { id: validatedData.id, ...notDeleted },
      select: { id: true, swatchImageUrl: true },
    });

    if (!existingColor) {
      return { success: false, error: en.color_doesnt_exist };
    }

    // Process swatch image (handles temp→permanent move, removal, or no change)
    const finalSwatchUrl = await processSwatchImage(
      validatedData.swatchImageUrl,
      validatedData.id,
      existingColor.swatchImageUrl
    );

    const color = await prisma.color.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        hexCode: validatedData.hexCode ?? null,
        isActive: validatedData.isActive,
        swatchImageUrl: finalSwatchUrl,
      },
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
        isActive: true,
      },
    });

    revalidatePath("/admin/colors");

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Color",
      entityId: color.id,
      newValues: color,
      description: `Updated color "${color.name}"`,
    });

    return {
      success: true,
      data: { color },
      message: en.color_updated_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Update color error:", error);

    return {
      success: false,
      error: en.color_update_failed,
    };
  }
}

// DELETE Color (Soft Delete)
export async function deleteColorById(id: string): Promise<ApiResponse<DeleteColorResponseSchema>> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const color = await prisma.color.findFirst({
      where: { id, ...notDeleted },
      select: {
        id: true,
        swatchImageUrl: true,
        _count: {
          select: {
            variants: true,
            productImages: true,
          },
        },
      },
    });

    if (!color) {
      return {
        success: false,
        error: en.color_doesnt_exist,
      };
    }

    if (color._count.variants > 0 || color._count.productImages > 0) {
      return {
        success: false,
        error: en.color_is_assigned_to_products,
      };
    }

    // Delete the swatch image if exists
    if (color.swatchImageUrl) {
      try {
        const path = extractStoragePathFromUrl(color.swatchImageUrl);
        if (path) await deleteImage(path).catch(() => null);
      } catch { /* ignore */ }
    }

    const deletedColor = await prisma.color.update({
      where: { id: color.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
        swatchImageUrl: null,
      },
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
        isActive: true,
        deletedAt: true,
      },
    });

    revalidatePath("/admin/colors");

    createAuditLog({
      userId: user.userId,
      action: "DELETE",
      entity: "Color",
      entityId: deletedColor.id,
      description: `Deleted color "${deletedColor.name}"`,
    });

    return {
      success: true,
      data: { color: deletedColor },
      message: en.color_deleted_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Delete color error:", error);
    return {
      success: false,
      error: en.failed_to_delete_color,
    };
  }
}

// GET Selector Data
export async function getColorSelectorData(): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const colors = await prisma.color.findMany({
      where: { ...notDeleted, isActive: true },
      select: {
        id: true,
        name: true,
        hexCode: true,
        swatchImageUrl: true,
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: colors,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Get selector error:", error);

    return {
      success: false,
      error: en.failed_to_get_color_selector_data,
    };
  }
}
