import { CustomerSchema } from "@/schemas/admin-schemas";
import { Paginator } from "@/types/table-types";
import { ColumnDef } from "@tanstack/react-table";

type ColumnProps = {
  paginator?: Paginator;
};

export const getColumns = ({ paginator }: ColumnProps): ColumnDef<CustomerSchema>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {
      return paginator!.pageSize * paginator!.pageIndex + (row.index + 1);
    },
  },
  {
    id: "name",
    header: () => <div className="text-center">Name</div>,
    cell: ({ row }) => {
      const { firstName, lastName } = row.original;
      return <div>{firstName} {lastName}</div>;
    },
  },
  {
    accessorKey: "email",
    id: "email",
    header: () => <div className="text-center">Email</div>,
  },
  {
    id: "isActive",
    header: () => <div className="text-center">Is Active</div>,
    cell: ({ row }) => {
      const value = row.original.isActive;
      const text = value.toString();
      return (
        <div className="flex flex-row items-center justify-center">
          <p
            className={`border flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
              value
                ? "border-green-500 bg-green-100 text-green-800"
                : "border-red-500 bg-red-100 text-red-800"
            }`}
          >
            {text.charAt(0).toUpperCase() + text.slice(1)}
          </p>
        </div>
      );
    },
  },
  {
    id: "isVerified",
    header: () => <div className="text-center">Is Verified</div>,
    cell: ({ row }) => {
      const value = row.original.isVerified;
      const text = value.toString();
      return (
        <div className="flex flex-row items-center justify-center">
          <p
            className={`border flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
              value
                ? "border-green-500 bg-green-100 text-green-800"
                : "border-amber-500 bg-amber-100 text-amber-800"
            }`}
          >
            {text.charAt(0).toUpperCase() + text.slice(1)}
          </p>
        </div>
      );
    },
  },
  {
    id: "createdAt",
    header: () => <div className="text-center">Joined</div>,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="text-sm text-neutral-600">
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      );
    },
  },
];
