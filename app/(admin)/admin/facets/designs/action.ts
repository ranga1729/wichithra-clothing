'use server'

import { includingDeleted, notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { DesignFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { revalidatePath } from "next/cache";
import { en } from "@/lib/i18n/en";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { Prisma } from "@/generated/prisma/client";
import { createAuditLog } from "@/app/(admin)/admin/logs/actions";
import { CreateDesignResponseSchema, DeleteDesignResponseSchema, DesignListResponseSchema, UpdateDesignResponseSchema } from "@/schemas/server-action-responses";
import { baseDesignSchema, BaseDesignSchema, updateDesignSchema, UpdateDesignSchema } from "@/schemas/admin-schemas";
import { date } from "zod";

// ─── Helper: Slug conflict check (soft-delete aware) ──────────────────────
async function checkSlugConflicts(
  slug: string,
  excludeId?: string
): Promise<string | null> {
  const where: Prisma.DesignWhereInput = {
    ...includingDeleted,
    ...(excludeId && { id: { not: excludeId } }),
    OR: [{ slug: { equals: slug, mode: "insensitive" } }],
  };

  const conflicts = await prisma.design.findMany({
    where,
    select: { id: true, slug: true, deletedAt: true },
  });

  if (conflicts.length === 0) return null;

  const activeConflict = conflicts.find((c) => c.deletedAt === null);
  if (activeConflict) return en.slug_already_exists;

  const softDeletedConflict = conflicts.find((c) => c.deletedAt !== null);
  if (softDeletedConflict) return en.slug_already_exists_in_a_deleted_record;

  return null;
}

// GET Designs
export async function getDesigns(paginator: Paginator, filter: DesignFilter, sorter: Sorter): Promise<ApiResponse<DesignListResponseSchema>> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: Prisma.DesignWhereInput = {
      ...notDeleted,
      ...(filter.name && {
        name: { contains: filter.name, mode: "insensitive" },
      }),
      ...(filter.slug && {
        slug: { contains: filter.slug, mode: "insensitive" },
      }),
    };

    const validSortOrder = ["asc", "desc"].includes(sorter.sortOrder) ? (sorter.sortOrder as Prisma.SortOrder) : "asc";
    const sortableColumns = ["name", "slug"];
    const orderBy: Prisma.DesignOrderByWithRelationInput | undefined = sortableColumns.includes(sorter.sortColumn) ? { [sorter.sortColumn]: validSortOrder } : undefined;

    const [designs, totalRecords] = await prisma.$transaction([
      prisma.design.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          isActive: true,
        },
        where: whereClause,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.design.count({ where: whereClause }),
    ]);

    return {
      success: true,
      data: { 
        designs: designs,
        totalRecords: totalRecords
      },
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error(en.failed_to_create_category + ": ", error);

    return {
      success: false,
      error: error.message ?? en.data_retrieval_failed,
    };
  }
}

//CREATE Design
export async function createDesign(newDesign: BaseDesignSchema): Promise<ApiResponse<CreateDesignResponseSchema>> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = baseDesignSchema.parse(newDesign);

    const slugError = await checkSlugConflicts(validatedData.slug);

    if (slugError) {
      return { 
        success: false, 
        error: slugError 
      };
    }

    const design = await prisma.design.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description ?? null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
    });

    revalidatePath("/admin/design");

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "Design",
      entityId: design.id,
      newValues: design,
      description: `Created design "${design.name}"`,
    });

    return {
      success: true,
      data: { 
        design: design
      },
      message: en.design_created_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Create design error:", error);
    return {
      success: false,
      error: en.failed_to_create_design,
    };
  }
}

// DELETE Design (Soft Delete)
export async function deleteDesignById(id: string): Promise<ApiResponse<DeleteDesignResponseSchema>> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const design = await prisma.design.findFirst({
      where: { id : id, ...notDeleted },
      select: {
        id: true,
        _count: {
          select: { 
            productDesigns: true 
          },
        },
      },
    });

    if (!design) {
      return { 
        success: false, 
        error: en.design_doesnt_exist 
      };
    }

    if (design._count.productDesigns > 0) {
      return {
        success: false,
        error: en.design_is_assigned_to_products,
      };
    }

    const deletedDesign = await prisma.design.update({
      where: { id: design.id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        deletedAt: true,
      },
    });

    revalidatePath("/admin/design");

    createAuditLog({
      userId: user.userId,
      action: "DELETE",
      entity: "Design",
      entityId: deletedDesign.id,
      description: `Deleted design "${deletedDesign.name}"`,
    });

    return {
      success: true,
      data: { 
        design: deletedDesign 
      },
      message: en.design_deleted_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Delete design error:", error);

    return {
      success: false,
      error: en.design_delete_failed,
    };
  }
}

// ─── UPDATE Design ──────────────────────────────────────────────────────────
export async function updateDesignById(updatedDesign: UpdateDesignSchema): Promise<ApiResponse<UpdateDesignResponseSchema>> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = updateDesignSchema.parse(updatedDesign);

    const existingDesign = await prisma.design.findUnique({
      where: { id: validatedData.id, ...notDeleted },
      select: { id: true },
    });

    if (!existingDesign) {
      return { 
        success: false, 
        error: en.design_doesnt_exist 
      };
    }

    const slugError = await checkSlugConflicts(validatedData.slug, validatedData.id);
    if (slugError) {
      return { success: false, error: slugError };
    }

    const design = await prisma.design.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description ?? null,
        isActive: validatedData.isActive,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        deletedAt: true,
      },
    });

    revalidatePath("/admin/design");

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Design",
      entityId: design.id,
      newValues: design,
      description: `Updated design "${design.name}"`,
    });

    return {
      success: true,
      data: { 
        design  : design
      },
      message: en.design_updated_successfully,
    };
  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    console.error("Update design error:", error);

    return {
      success: false,
      error: en.design_update_failed,
    };
  }
}

