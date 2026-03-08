import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ---------------------------------------------------------------------------
// Soft-delete helpers — use these explicitly in your server actions
// ---------------------------------------------------------------------------

/** Standard where clause that excludes soft-deleted records */
export const notDeleted = { deletedAt: null } as const;

/** Use when you want to find ALL records including soft-deleted ones */
export const includingDeleted = {} as const;

/** Use when you want ONLY soft-deleted records */
export const onlyDeleted = { deletedAt: { not: null } } as const;