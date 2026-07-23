'use server'

import { notDeleted, prisma } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { CreateCollectionSchema, createCollectionSchema } from "@/schemas/admin-schemas";
import { revalidatePath } from "next/cache";
import { en } from "@/lib/i18n/en";
import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { createAuditLog } from "@/app/(admin)/admin/logs/actions";

export async function getCollections(): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const collections = await prisma.collection.findMany({
      where: { ...notDeleted },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(collections)),
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_fetch_data;
    return {
      success: false,
      error: message,
    };
  }
}

export async function createCollection(data: CreateCollectionSchema): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const validatedData = createCollectionSchema.parse(data);

    const existingCollections = await prisma.collection.findMany({
      where: {
        OR: [
          { name: { equals: validatedData.name, mode: 'insensitive' } },
          { slug: { equals: validatedData.slug, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        slug: true,
        deletedAt: true,
      },
    });

    if (existingCollections.length > 0) {
      const activeConflicts = existingCollections.filter((c) => c.deletedAt === null);
      const softDeletedConflicts = existingCollections.filter((c) => c.deletedAt !== null);

      if (activeConflicts.length > 0) {
        const nameConflict = activeConflicts.find((c) => c.name.toLowerCase() === validatedData.name.toLowerCase());
        const slugConflict = activeConflicts.find((c) => c.slug.toLowerCase() === validatedData.slug.toLowerCase());

        if (nameConflict && slugConflict) {
          return { success: false, error: en.name_and_slug_already_exists };
        }
        if (nameConflict) {
          return { success: false, error: en.name_already_exists };
        }
        if (slugConflict) {
          return { success: false, error: en.slug_already_exists };
        }
      }

      if (softDeletedConflicts.length > 0) {
        const softDeletedIds = softDeletedConflicts.map((c) => c.id);
        await prisma.collection.deleteMany({
          where: { id: { in: softDeletedIds } },
        });
      }
    }

    const collection = await prisma.collection.create({
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        description: validatedData.description,
      },
    });

    if (!collection) {
      return { success: false, error: en.failed_to_create_collection };
    }

    revalidatePath("/admin/collections");

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "Collection",
      entityId: collection.id,
      newValues: { name: collection.name, slug: collection.slug },
      description: `Created collection "${collection.name}"`,
    });

    return {
      success: true,
      message: en.collection_created_successfully,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_create_collection;
    return {
      success: false,
      error: message,
    };
  }
}

export async function deleteCollection(id: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!collection) {
      return { success: false, error: en.collection_doesnt_exist };
    }

    const deleted = await prisma.collection.update({
      where: { id: collection.id },
      data: { deletedAt: new Date() },
    });

    if (!deleted) {
      return { success: false, error: en.failed_to_delete_collection };
    }

    revalidatePath("/admin/collections");

    createAuditLog({
      userId: user.userId,
      action: "DELETE",
      entity: "Collection",
      entityId: id,
      description: `Deleted collection`,
    });

    return {
      success: true,
      message: en.collection_deleted_successfully,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_delete_collection;
    return {
      success: false,
      error: message,
    };
  }
}

export async function toggleCollectionActiveStatus(id: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const collection = await prisma.collection.findUnique({
      where: { id },
      select: { id: true, isActive: true },
    });

    if (!collection) {
      return { success: false, error: en.collection_doesnt_exist };
    }

    const updated = await prisma.collection.update({
      where: { id: collection.id },
      data: { isActive: !collection.isActive },
    });

    if (!updated) {
      return { success: false, error: en.failed_to_toggle_collection_active_status };
    }

    revalidatePath("/admin/collections");

    createAuditLog({
      userId: user.userId,
      action: "UPDATE",
      entity: "Collection",
      entityId: id,
      newValues: { isActive: !collection.isActive },
      description: `Toggled active status to ${!collection.isActive}`,
    });

    return {
      success: true,
      message: en.active_status_toggled,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_toggle_collection_active_status;
    return {
      success: false,
      error: message,
    };
  }
}

export async function getCollectionProducts(collectionId: string): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { id: true },
    });

    if (!collection) {
      return { success: false, error: en.collection_doesnt_exist };
    }

    const productCollections = await prisma.productCollection.findMany({
      where: { collectionId },
      select: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            gender: true,
            ageGroup: true,
            category: {
              select: { name: true },
            },
            productImages: {
              select: {
                imageUrl: true,
                isPrimary: true,
                sortOrder: true,
              },
              orderBy: { sortOrder: "asc" },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const products = productCollections.map((pc) => pc.product);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_load_collection_products;
    return {
      success: false,
      error: message,
    };
  }
}

export async function getProductsForSelector(): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const products = await prisma.product.findMany({
      where: { ...notDeleted },
      select: {
        id: true,
        name: true,
        slug: true,
        category: {
          select: { name: true },
        },
        productImages: {
          select: {
            imageUrl: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: { sortOrder: "asc" },
          take: 1,
        },
      },
      orderBy: { name: "asc" },
    });

    return {
      success: true,
      data: JSON.parse(JSON.stringify(products)),
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_load_product_selector_data;
    return {
      success: false,
      error: message,
    };
  }
}

export async function addProductToCollection(collectionId: string, productId: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const collection = await prisma.collection.findUnique({
      where: { id: collectionId },
      select: { id: true },
    });

    if (!collection) {
      return { success: false, error: en.collection_doesnt_exist };
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return { success: false, error: en.product_doesnt_exist };
    }

    const existing = await prisma.productCollection.findUnique({
      where: {
        productId_collectionId: { productId, collectionId },
      },
    });

    if (existing) {
      return { success: false, error: en.product_already_in_collection };
    }

    await prisma.productCollection.create({
      data: { productId, collectionId },
    });

    revalidatePath("/admin/collections");

    createAuditLog({
      userId: user.userId,
      action: "CREATE",
      entity: "ProductCollection",
      entityId: productId,
      description: `Added product to collection`,
    });

    return {
      success: true,
      message: en.product_added_to_collection,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_add_product_to_collection;
    return {
      success: false,
      error: message,
    };
  }
}

export async function removeProductFromCollection(collectionId: string, productId: string): Promise<ApiResponse> {
  try {
    const user = await requireRole(["admin", "super-admin"]);

    const existing = await prisma.productCollection.findUnique({
      where: {
        productId_collectionId: { productId, collectionId },
      },
    });

    if (!existing) {
      return { success: false, error: en.product_already_in_collection };
    }

    await prisma.productCollection.delete({
      where: {
        productId_collectionId: { productId, collectionId },
      },
    });

    revalidatePath("/admin/collections");

    createAuditLog({
      userId: user.userId,
      action: "DELETE",
      entity: "ProductCollection",
      entityId: productId,
      description: `Removed product from collection`,
    });

    return {
      success: true,
      message: en.product_removed_from_collection,
    };
  } catch (error: unknown) {
    if (error instanceof AuthError) throw error;
    const message = error instanceof Error ? error.message : en.failed_to_remove_product_from_collection;
    return {
      success: false,
      error: message,
    };
  }
}
