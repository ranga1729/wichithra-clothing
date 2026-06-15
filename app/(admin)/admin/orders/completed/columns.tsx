import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { paymentStatusStyles } from "@/lib/data-objects"
import { CompletedOrderSchema } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Check, Ellipsis, LayoutList, X } from "lucide-react"

type ColumnProps = {
  paginator?: Paginator
  onMove: (id:string) => void,
  onCancel: (id:string) => void,
  onView: (id:string) => void,
}


export const getColumns = ({ onCancel, onMove, onView, paginator }: ColumnProps): ColumnDef<CompletedOrderSchema>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {
      return paginator?.pageSize! * paginator?.pageIndex! + (row.index + 1)
    },
  },
  {
    id: "orderNumber",
    header: () => <div>Order Number</div>,
    cell: ({ row }) => (
      <div className="font-mono text-xs font-semibold">{row.original.orderNumber}</div>
    ),
  },
  {
    id: "createdAt",
    header: () => <div>Created Date</div>,
    cell: ({ row }) => (
      <div className="text-sm">{format(new Date(row.original.createdAt), "dd MMM yyyy")}</div>
    ),
  },
  {
    id: "customerName",
    header: () => <div>Customer</div>,
    cell: ({ row }) => {
      const { firstName, lastName } = row.original.user
      return <div>{firstName} {lastName}</div>
    },
  },
  {
    id: "paymentStatus",
    header: () => <div className="text-center">Payment Status</div>,
    cell: ({ row }) => {
      const status = row.original.paymentStatus
      const style = paymentStatusStyles[status] ?? "bg-neutral-100 text-neutral-800"
      return (
        <div className="flex justify-center">
          <span className={`border border-neutral-300 rounded-full px-3 py-1 text-xs font-medium ${style}`}>
            {status.replace(/_/g, " ")}
          </span>
        </div>
      )
    },
  },
  {
    id: "subtotal",
    header: () => <div className="text-right">Subtotal</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm">{Number(row.original.subtotal).toFixed(2)} LKR</div>
    ),
  },
  {
    id: "discountAmount",
    header: () => <div className="text-right">Discount</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm">{Number(row.original.discountAmount).toFixed(2)} LKR</div>
    ),
  },
  {
    id: "shippingFee",
    header: () => <div className="text-right">Shipping</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm">{Number(row.original.shippingFee).toFixed(2)} LKR</div>
    ),
  },
  {
    id: "taxAmount",
    header: () => <div className="text-right">Tax</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm">{Number(row.original.taxAmount).toFixed(2)} LKR</div>
    ),
  },
  {
    id: "totalAmount",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm font-semibold">{Number(row.original.totalAmount).toFixed(2)} LKR</div>
    ),
  },
  {
    id: "notes",
    header: () => <div>Notes</div>,
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
        {row.original.notes ?? "—"}
      </div>
    ),
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
              <DropdownMenuItem onClick={() => onView && onView(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <LayoutList/>
                </Button>{" "}
                View Order Items
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMove && onMove(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <Check color="green"/>
                </Button>{" "}
                Move to Ongoing Orders
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCancel && onCancel(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <X color="red" />
                </Button>{" "}
                Cancel Order
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
