import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleInventorySchema } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Pencil, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (inventory: SimpleInventorySchema) => void
  onDelete?: (inventory: SimpleInventorySchema) => void
  paginator?: Paginator
}

export const getColumns = ({
  onEdit,
  onDelete,
  paginator,
}: ColumnProps): ColumnDef<SimpleInventorySchema>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {
      return paginator?.pageSize! * paginator?.pageIndex! + (row.index + 1)
    },
  },
  {
    id: "product",
    header: () => <div className="text-center">Product</div>,
    cell: ({ row }) => (
      <div>{row.original.productSize.product.name}</div>
    ),
  },
  {
    id: "sku",
    header: () => <div className="text-center">SKU</div>,
    cell: ({ row }) => (
      <div className="font-mono text-xs">{row.original.sku}</div>
    ),
  },
  {
    id: "size",
    header: () => <div className="text-center">Size</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.original.productSize.size.name}</div>
    ),
  },
  {
    id: "color",
    header: () => <div className="text-center">Color</div>,
    cell: ({ row }) => {
      const { name, hexCode } = row.original.productColor.color
      return (
        <div className="flex flex-row items-center justify-center gap-1">
          {name}
          <div
            className="w-4 h-4 border border-neutral-500 rounded-full"
            style={{ backgroundColor: `#${hexCode}` }}
          />
        </div>
      )
    },
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
      <div className="text-right">{row.original.reservedQuantity ?? 0}</div>
    ),
  },
  {
    id: "available",
    header: () => <div className="text-center">Available</div>,
    cell: ({ row }) => {
      const available = row.original.quantity - (row.original.reservedQuantity ?? 0)
      return <div className="text-right">{available}</div>
    },
  },
  {
    id: "lowStockThreshold",
    header: () => <div className="text-center">Low Stock At</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.lowStockThreshold ?? 5}</div>
    ),
  },
  {
    id: "costPrice",
    header: () => <div className="text-center">Cost Price</div>,
    cell: ({ row }) => {
      const price = row.original.costPrice
      return (
        <div className="text-right">
          {price != null ? `${price} LKR` : "—"}
        </div>
      )
    },
  },
  {
    id: "stockStatus",
    header: () => <div className="text-center">Stock Status</div>,
    cell: ({ row }) => {
      const { quantity, reservedQuantity, lowStockThreshold } = row.original
      const available = quantity - (reservedQuantity ?? 0)
      const threshold = lowStockThreshold ?? 5

      let label: string
      let colorClass: string

      if (available <= 0) {
        label = "Out of Stock"
        colorClass = "bg-red-100 text-red-800"
      } else if (available <= threshold) {
        label = "Low Stock"
        colorClass = "bg-yellow-100 text-yellow-800"
      } else {
        label = "In Stock"
        colorClass = "bg-green-100 text-green-800"
      }

      return (
        <div className="flex flex-row items-center justify-center">
          <p
            className={`border border-neutral-400 flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}
          >
            {label}
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
