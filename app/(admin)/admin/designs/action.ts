'use server'

import { notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { DesignFilter } from "@/types/filter-types";
import { Paginator, Sorter } from "@/types/table-types";
import { DesignSchema, designSchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";
import { en } from "@/lib/i18n/en";

export async function getDesign(paginator: Paginator, filter: DesignFilter, sorter: Sorter):Promise<ApiResponse> {
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
      ...(filter.slug && {
        slug: {
          contains: filter.slug as string,
          mode: 'insensitive'
        }
      })
    }

    const validSortOrder = ['asc', 'desc'].includes(sorter.sortOrder as string) ? sorter.sortOrder as string : 'asc';
    const sortableColumns = ["name", "slug"];
    const orderBy = sortableColumns.includes(sorter.sortColumn as string) ? {[sorter.sortColumn as string]: validSortOrder} : undefined;

    const designs = await prisma.design.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
      },
      where: whereClause,
      orderBy: orderBy,
      skip: skip,
      take: pageSize
    })

    const totalRecords = await prisma.design.count({
      where: whereClause
    })

    if(!designs) {
      return {
        success: false,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        designs : designs,
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

export async function createDesign(newDesign: DesignSchema):Promise<ApiResponse> {
  try {
    const validatedData = designSchema.parse(newDesign);

    const existingDesings = await prisma.design.findMany({
      where: {
        OR: [
          {name: newDesign.name},
          {slug: newDesign.slug}
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true
      }
    });

    if(existingDesings.length > 0) {
      const activeConflicts = existingDesings.filter((design) => design.deletedAt === null);

      if(activeConflicts.length > 0) {
        const nameConflicts = activeConflicts.find((design) => design.name === validatedData.name);
        const slugConflicts = activeConflicts.find((design) => design.slug === validatedData.slug);

        if(nameConflicts && slugConflicts) {
          return {
            success: false,
            error: en.design_name_and_slug_already_exist
          }
        }
        if(nameConflicts) {
          return {
            success: false,
            error: en.design_name_already_exists
          }
        }
        if(slugConflicts) {
          return {
            success: false,
            error: en.design_slug_already_exists
          }
        }
      }

      const softDeletedId = existingDesings.map((design) => design.id);

      await prisma.design.deleteMany({
        where: {
          id: {in: softDeletedId}
        }
      })
    }

    const design = await prisma.design.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
      }
    });

    if(!design) {
      return {
        success: false,
        error: en.failed_to_create_design,
      };
    }

    revalidatePath("/admin/design");

    return {
      success: true,
      message: en.design_created_successfully,
    };
  } catch (error:any) {
    console.error("Error creating design:", error.message);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.failed_to_create_design,
    };
  }
}

export async function deleteDesign(id: string):Promise<ApiResponse> {
  try {
    const design = await prisma.design.findUnique({
      where: {id : id},
      select: {
        id: true,
      }
    })

    if(!design) {
      return {
        success: false,
        error: en.design_doesnt_exist
      }
    }

    const deletedDesign = await prisma.design.update({
      where: {
        id: design.id
      },
      data: {
        deletedAt: new Date(),
      }
    });

    if(!deletedDesign) {
      return {
        success: false,
        error: en.design_delete_failed
      }
    }
    
    revalidatePath('/admin/categories');

    return {
      success: true,
      message: en.design_deleted_successfully
    }
  } catch(error:any) {
    console.error("Error deleting design:", error.message);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.design_delete_failed,
    };
  }
}

export async function updateDesignById(id: string, updatedDesign: DesignSchema): Promise<ApiResponse> {
  try {
    const validatedData = designSchema.parse(updatedDesign);

    const existingDesign = await prisma.design.findUnique({
      where: { id: id, },
      select: {
        id: true,
      }
    });

    if (!existingDesign) {
      return {
        success: false,
        error: en.design_doesnt_exist
      };
    }

    const conflicts = await prisma.design.findMany({
      where: {
        OR: [
          {name: updatedDesign.name},
          {slug: updatedDesign.slug}
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true
      }
    });

    if(conflicts.length > 0) {
      const activeConflicts = conflicts.filter((design) => design.deletedAt === null);

      if(activeConflicts.length > 0 ) {
        const nameConflicts = activeConflicts.find((design) => design.name === validatedData.name);
        const slugConflicts = activeConflicts.find((design) => design.slug === validatedData.slug);

        if(nameConflicts && slugConflicts) {
          return {
            success: false,
            error: en.design_name_and_slug_already_exist
          }
        }

        if(nameConflicts) {
          return {
            success: false,
            error: en.design_name_already_exists
          }
        }
        if(slugConflicts) {
          return {
            success: false,
            error: en.design_slug_already_exists
          }
        }
      }

      const softDeletedId = conflicts.map((design) => design.id);

      await prisma.design.deleteMany({
        where: {
          id: {in: softDeletedId}
        }
      })
    }

    const design = await prisma.design.update({
      where: { id: existingDesign.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
      }
    });

    if (!design) {
      return {
        success: false,
        error: en.design_update_failed,
      };
    }

    revalidatePath("/admin/design");

    return {
      success: true,
      message: en.design_updated_successfully,
      data: { design: design }
    };
  } catch (error) {
    console.error("Error updating design:", error);
    
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: en.design_update_failed,
    };
  }
}