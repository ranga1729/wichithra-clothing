'use server'

import { ProductStatus } from "@/generated/prisma/enums";
import { en } from "@/lib/i18n/en";
import { notDeleted, prisma } from "@/lib/prisma";
import { basicProductInfoSchema, BasicProductInfoSchema, productSchema, ProductSchema, ProductStatusSchema } from "@/schemas/admin-schemas";
import { ApiResponse } from "@/types/auth-types";
import { ProductFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { revalidatePath } from "next/cache";

export async function getProducts(paginator: Paginator, filter: ProductFilter):Promise<ApiResponse> {
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
      }),
      ...(filter.category && {
        category: {
          slug: filter.category
        }
      }),
      ...(filter.mainColor && {
        mainColorId: filter.mainColor // UUIDs must be exact matches
      }),
    }

    // const validSortOrder = ['asc', 'desc'].includes(sorter.sortOrder as string) ? sorter.sortOrder as string : 'asc';
    // const sortableColumns = ["name", "slug", "sortOrder"];
    // const orderBy = sortableColumns.includes(sorter.sortColumn as string) ? {[sorter.sortColumn as string]: validSortOrder} : undefined;

    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        basePrice: true,
        discountPercentage: true,
        isFeatured: true,
        isActive: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
          }
        },
        mainColor: {
          select: {
            id: true,
            name: true,
            hexCode: true,
          }
        },
        
      },
      where: whereClause,
      skip: skip,
      take: pageSize,
      orderBy: {name: 'asc'},
    })

    const totalRecords = await prisma.product.count({
      where: whereClause
    });

    const serializedProducts = JSON.parse(JSON.stringify(products));

    if(!products) {
      return {
        success: false,
        message: en.data_retrieval_failed,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        products : serializedProducts,
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

export async function getProductById(productId: string):Promise<ApiResponse> {
  try {
    const selectedProduct = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        brand: true,
        material: true,
        careInstructions: true,
        basePrice: true,
        discountPercentage: true,
        isFeatured: true,
        isActive: true,
        status: true,

        category: {
          select: {
            id: true,
            name: true,
          }
        },
        mainColor: {
          select: {
            id: true,
            name: true,
            hexCode: true,
          }
        },
        productDesigns: {
          select: {
            id: true,
            productId: true,
            designId: true,
            design: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        productColors: {
          select: {
            id: true,
            productId: true,
            colorId: true,
            isMainColor: true,
            colorImageUrl: true,
            color: {
              select: {
                id: true,
                name: true,
                hexCode: true,
              }
            }
          }
        },
        productImages: {
          select: {
            id: true,
            productId: true,
            colorId: true,
            imageUrl: true,
            isPrimary: true,
            sortOrder: true,
          },
          orderBy: {
            sortOrder: 'asc',
          }
        },
        productSizes: {
          select: {
            id: true,
            productId: true,
            sizeId: true,
            isActive: true,
            size: {
              select: {
                id: true,
                name: true,
                description: true,
                sortOrder: true,
              }
            }
          },
          orderBy: {
            size: {
              sortOrder: 'asc',
            }
          }
        },
      },
    });

    const serializedProducts = JSON.parse(JSON.stringify(selectedProduct));

    if(!selectedProduct) {
      return {
        success: false,
        message: en.data_retrieval_failed,
        error: en.data_retrieval_failed
      }
    }

    return {
      success: true,
      data: {
        product : serializedProducts,
      }
    };

  } catch(error:any) {
    return { 
      success: false,
      error: error.message || en.data_retrieval_failed 
    };
  }
}

export async function changeBasicInfo(data: BasicProductInfoSchema):Promise<ApiResponse> {
  try {
    const validatedData = basicProductInfoSchema.parse(data);

    const existingProduct = await prisma.product.findUnique({
      where: {id : validatedData.id},
      select: {
        id: true,
        name: true,
        slug: true,
        brand: true,
        material: true,
        careInstructions: true,
        description: true,
        basePrice: true,
        discountPercentage: true,
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        name: validatedData.name,
        slug: validatedData.slug,
        brand: validatedData.brand,
        material: validatedData.material,
        careInstructions: validatedData.careInstructions,
        description: validatedData.description,
        basePrice: validatedData.basePrice,
        discountPercentage: validatedData.discountPercentage,
      }
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
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

export async function toggleActiveStatus(id: string):Promise<ApiResponse> {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {id : id},
      select: {
        id: true,
        isActive: true,
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        isActive : !existingProduct.isActive,
      }
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
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

export async function toggleFeaturedStatus(id: string):Promise<ApiResponse> {
  try {
    const existingProduct = await prisma.product.findUnique({
      where: {id : id},
      select: {
        id: true,
        isFeatured: true,
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        isFeatured : !existingProduct.isFeatured,
      }
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
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

export async function changeProductStatus(id: string, newStatus: ProductStatus):Promise<ApiResponse> {
  try {
    const validation = ProductStatusSchema.safeParse(newStatus);

    if (!validation.success) {
      return { 
        success: false, 
        error: "Invalid status value provided" 
      };
    }

    const validatedStatus = validation.data
    
    const existingProduct = await prisma.product.findUnique({
      where: {id : id},
      select: {
        id: true,
        status: true
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const updatedProduct = await prisma.product.update({
      where: { id: existingProduct.id },
      data: {
        status: validatedStatus as ProductStatus
      }
    });

    if (!updatedProduct) {
      return {
        success: false,
        error: en.product_update_failed,
      };
    }

    revalidatePath(`/admin/products/${updatedProduct.id}`);

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
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

export async function changeProductSizes(productId: string, newSizes: string[]):Promise<ApiResponse> {
  try {    
    const existingProduct = await prisma.product.findUnique({
      where: {id : productId},
      select: {
        id: true,
        productSizes: true
      }
    })

    if(!existingProduct) {
      return {
        success: false,
        error: en.product_doesnt_exist
      };
    }

    const existingSizeIds = existingProduct.productSizes.map(s => s.sizeId);

    const toAdd = newSizes.filter(id => !existingSizeIds.includes(id));
    const toRemove = existingSizeIds.filter(id => !newSizes.includes(id));

    await prisma.$transaction([
      prisma.productSize.deleteMany({
        where: {
          productId: existingProduct.id,
          sizeId: {in: toRemove}
        }
      }),
      ...toAdd.map(sizeId => 
        prisma.productSize.create({
          data: {
            productId: existingProduct.id,
            sizeId,
            isActive: true
          }
        })
      )
    ])

    revalidatePath(`/admin/products/${productId}`);

    return {
      success: true,
      message: en.product_updated_successfully,
    };

  } catch(error) {
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