import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

function createPrismaClient() {
  const basePrisma = new PrismaClient({ adapter });

  //filter out soft-deleted rows from find and update queries
  return basePrisma.$extends({
    name: 'softDelete',
    query: {
      $allModels: {
        async findUnique({ model, operation, args, query }) {
          if (modelHasSoftDelete(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },

        async findFirst({ model, operation, args, query }) {
          if (modelHasSoftDelete(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },

        async findMany({ model, operation, args, query }) {
          if (modelHasSoftDelete(model)) {
            if (args.where) {
              if ((args.where as any).deletedAt === undefined) {
                args.where = { ...args.where, deletedAt: null } as any;
              }
            } else {
              args.where = { deletedAt: null } as any;
            }
          }
          return query(args);
        },

        async update({ model, operation, args, query }) {
          if (modelHasSoftDelete(model)) {
            args.where = { ...args.where, deletedAt: null } as any;
          }
          return query(args);
        },

        async updateMany({ model, operation, args, query }) {
          if (modelHasSoftDelete(model)) {
            if (args.where !== undefined) {
              args.where = { ...args.where, deletedAt: null } as any;
            } else {
              args.where = { deletedAt: null } as any;
            }
          }
          return query(args);
        },

        async count({ model, operation, args, query }) {
          if (modelHasSoftDelete(model)) {
            if (args.where) {
              if ((args.where as any).deletedAt === undefined) {
                args.where = { ...args.where, deletedAt: null } as any;
              }
            } else {
              args.where = { deletedAt: null } as any;
            }
          }
          return query(args);
        },
      },
    },
  });
}

// Helper function to check if model has soft delete
function modelHasSoftDelete(model: string): boolean {
  const modelsWithSoftDelete = [
    'User',
    'Role',
    'Category',
    'Design',
    'Color',
    'Size',
    'Product',
    'Inventory',
  ];
  return modelsWithSoftDelete.includes(model);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;