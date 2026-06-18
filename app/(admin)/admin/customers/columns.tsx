import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CustomerSchema } from "@/schemas/admin-schemas";
import { Paginator } from "@/types/table-types";
import { ColumnDef } from "@tanstack/react-table";
import { Clock, Ellipsis, Trash, UserX } from "lucide-react";

type ColumnProps = {
  paginator?: Paginator;
  viewOrders?: (id:string) => void;
  blacklistCustomer?: (id:string) => void;
  deleteCustomer?: (id: string) => void;
};

const Dash = () => <span className="text-neutral-300">—</span>;

export const getColumns = ({ paginator, viewOrders, blacklistCustomer, deleteCustomer }: ColumnProps): ColumnDef<CustomerSchema>[] => [
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
    id: "mobile",
    header: () => <div className="text-center">Contact(Mobile)</div>,
    cell: ({ row }) => {
      const mobile = row.original.phoneNumbers.find((p) => p.type === "MOBILE");
      if (!mobile) return <Dash />;
      const number = `${mobile.countryCode ?? ""} ${mobile.phoneNumber}`.trim();
      return <div className="text-sm">{number}</div>;
    },
  },
  {
    id: "home",
    header: () => <div className="text-center">Contact(Home)</div>,
    cell: ({ row }) => {
      const home = row.original.phoneNumbers.find((p) => p.type === "HOME");
      if (!home) return <Dash />;
      const number = `${home.countryCode ?? ""} ${home.phoneNumber}`.trim();
      return <div className="text-sm">{number}</div>;
    },
  },
  {
    id: "address",
    header: () => <div className="text-center">Address</div>,
    cell: ({ row }) => {
      const addr = row.original.addresses[0];
      if (!addr) return <Dash />;
      const parts = [
        addr.houseNo,
        addr.addressLine1,
        addr.addressLine2,
        addr.city,
        addr.province,
        addr.zipcode,
        addr.country,
      ].filter(Boolean);
      return (
        <div className="max-w-56 truncate text-sm" title={parts.join(", ")}>
          {parts.join(", ")}
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
  {
    id: "actions",
    header: () => <div className="text-center">Actions</div>,
    cell: ({ row }) => (
      <div className="flex flex-row gap-2 justify-center items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => viewOrders && viewOrders(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <Clock/>
                </Button>{" "}
                View Past Orders
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => blacklistCustomer && blacklistCustomer(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <UserX color="red"/>
                </Button>{" "}
                Blacklist Customer
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => deleteCustomer && deleteCustomer(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <Trash color="red"/>
                </Button>{" "}
                Delete Customer
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
