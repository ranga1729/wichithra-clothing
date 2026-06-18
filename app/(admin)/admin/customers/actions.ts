'use server'

import { AuthError, requireRole } from "@/lib/server-auth-guard";
import { prisma, notDeleted } from "@/lib/prisma";
import { ApiResponse } from "@/types/auth-types";
import { Paginator } from "@/types/table-types";
import { CustomerFilter } from "@/types/filter-types";
import { en } from "@/lib/i18n/en";
import { ROLES } from "@/types/auth-types";

export async function getCustomers(paginator: Paginator, filter: CustomerFilter): Promise<ApiResponse> {
  try {
    await requireRole(["admin", "super-admin"]);

    const pageSize = Math.max(1, paginator.pageSize);
    const pageIndex = Math.max(0, paginator.pageIndex);
    const skip = pageIndex * pageSize;

    const whereClause: any = {
      ...notDeleted,
      roleId: ROLES.CUSTOMER,
      ...(filter.name && {
        OR: [
          {
            firstName: {
              contains: filter.name,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: filter.name,
              mode: 'insensitive',
            },
          },
        ],
      }),
      ...(filter.email && {
        email: {
          contains: filter.email,
          mode: 'insensitive',
        },
      }),
      ...(filter.phone && {
        phoneNumbers: {
          some: {
            phoneNumber: {
              contains: filter.phone,
              mode: 'insensitive',
            },
          },
        },
      }),
      ...(filter.address && {
        addresses: {
          some: {
            OR: [
              { houseNo: { contains: filter.address, mode: 'insensitive' } },
              { addressLine1: { contains: filter.address, mode: 'insensitive' } },
              { city: { contains: filter.address, mode: 'insensitive' } },
              { province: { contains: filter.address, mode: 'insensitive' } },
            ],
          },
        },
      }),
    };

    const customers = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        createdAt: true,
        phoneNumbers: {
          select: {
            phoneNumber: true,
            countryCode: true,
            type: true,
            isDefault: true,
          },
          where: { isActive: true },
          orderBy: { isDefault: 'desc' },
        },
        addresses: {
          select: {
            houseNo: true,
            addressLine1: true,
            addressLine2: true,
            city: true,
            province: true,
            zipcode: true,
            country: true,
            isDefault: true,
          },
          orderBy: { isDefault: 'desc' },
        },
      },
      where: whereClause,
      skip,
      take: pageSize,
      orderBy: { firstName: 'asc' },
    });

    const totalRecords = await prisma.user.count({ where: whereClause });

    const serializedCustomers = JSON.parse(JSON.stringify(customers));

    return {
      success: true,
      data: {
        customers: serializedCustomers,
        totalRecords,
      },
    };

  } catch (error: any) {
    if (error instanceof AuthError) throw error;
    return {
      success: false,
      error: error.message || en.data_retrieval_failed,
    };
  }
}
