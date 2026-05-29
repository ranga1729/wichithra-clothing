import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { InventorySchema } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Pencil, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (inventory: InventorySchema) => void
  onDelete?: (inventory: InventorySchema) => void
  paginator?: Paginator
}

export const getColumns = ({
  onEdit,
  onDelete,
  paginator,
}: ColumnProps): ColumnDef<InventorySchema>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {
      return paginator?.pageSize! * paginator?.pageIndex! + (row.index + 1)
    },
  },
  {
    id: "category",
    header: () => <div className="text-center">Category</div>,
    cell: ({ row }) => (
      <div>{row.original.variant.product.category.name}</div>
    ),
  },
  {
    id: "product",
    header: () => <div className="text-center">Product</div>,
    cell: ({ row }) => (
      <div>{row.original.variant.product.name}</div>
    ),
  },
  {
    id: "color",
    header: () => <div className="text-center">Color</div>,
    cell: ({ row }) => {
      const { name, hexCode } = row.original.variant.color
      return (
        <div className="flex flex-row items-center justify-end gap-1">
          {name}
          <div
            className="w-4 h-4 border border-neutral-500 rounded-full"
            style={{ backgroundColor: hexCode ? `#${hexCode}` : undefined }}
          />
        </div>
      )
    },
  },
  {
    id: "size",
    header: () => <div className="text-center">Size</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.variant.size.name}</div>
    ),
  },
  {
    id: "sku",
    header: () => <div className="text-center">SKU</div>,
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.original.variant.sku}</div>
    ),
  },
  {
    id: "quantity",
    header: () => <div className="text-center">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity}</div>
    ),
  },
  {
    id: "reservedQuantity",
    header: () => <div className="text-center">Reserved</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.reservedQuantity}</div>
    ),
  },
  {
    id: "costPrice",
    header: () => <div className="text-center">Cost Price</div>,
    cell: ({ row }) => {
      const price = row.original.variant.costPrice
      return (
        <div className="text-right">
          {price != null ? `${price} LKR` : "—"}
        </div>
      )
    },
  },
  {
    id: "sellingPrice",
    header: () => <div className="text-center">Selling Price</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.variant.sellingPrice} LKR</div>
    ),
  },
  {
    id: "discountPercentage",
    header: () => <div className="text-center">Discount</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.variant.product.discountPercentage}%</div>
    ),
  },
  {
    id: "lowStockThreshold",
    header: () => <div className="text-center">Low Stock At</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.lowStockThreshold ?? 5}</div>
    ),
  },
  {
    id: "isActive",
    header: () => <div className="text-center">Active</div>,
    cell: ({ row }) => {
      const active = row.original.variant.isActive
      return (
        <div className="flex flex-row items-center justify-center">
          <p
            className={`border border-neutral-400 flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
              active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {active ? "Active" : "Inactive"}
          </p>
        </div>
      )
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
              <DropdownMenuItem onClick={() => onEdit && onEdit(row.original)}>
                <Button variant="ghost" size="sm">
                  <Pencil />
                </Button>{" "}
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete && onDelete(row.original)}>
                <Button variant="ghost" size="sm">
                  <Trash color="red" />
                </Button>{" "}
                Delete
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
