import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { orderStatusStyles, paymentMethodStyles, paymentStatusStyles } from "@/lib/data-objects"
import { PaymentRow } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { Ellipsis, RotateCcw, X } from "lucide-react"

type ColumnProps = {
  paginator?: Paginator
  onCancelOrderAndRefund: (id: string) => void
  onRefundOnly: (id: string) => void
}

export const getColumns = ({
  paginator,
  onCancelOrderAndRefund,
  onRefundOnly,
}: ColumnProps): ColumnDef<PaymentRow>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {
      return (paginator?.pageSize ?? 0) * (paginator?.pageIndex ?? 0) + (row.index + 1)
    },
  },
  {
    id: "orderNumber",
    header: () => <div>Order Number</div>,
    cell: ({ row }) => (
      <div className="font-mono text-xs font-semibold">{row.original.order.orderNumber}</div>
    ),
  },
  {
    id: "customerName",
    header: () => <div>Customer</div>,
    cell: ({ row }) => {
      const { firstName, lastName } = row.original.order.user
      return <div className="text-sm">{firstName} {lastName}</div>
    },
  },
  {
    id: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right text-sm font-semibold">
        {Number(row.original.amount).toFixed(2)} {row.original.currency}
      </div>
    ),
  },
  {
    id: "method",
    header: () => <div className="text-center">Method</div>,
    cell: ({ row }) => {
      const method = row.original.method
      const badgeClass = paymentMethodStyles[method] ?? "bg-neutral-100 text-neutral-800"
      return (
        <div className="flex items-center justify-center">
          <span className={`border border-neutral-300 rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
            {method.replace(/_/g, " ")}
          </span>
        </div>
      )
    },
  },
  {
    id: "paymentStatus",
    header: () => <div className="text-center">Payment Status</div>,
    cell: ({ row }) => {
      const status = row.original.status
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
    id: "orderStatus",
    header: () => <div className="text-center">Order Status</div>,
    cell: ({ row }) => {
      const status = row.original.order.status
      const style = orderStatusStyles[status] ?? "bg-neutral-100 text-neutral-800"
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
    id: "gatewayTransactionId",
    header: () => <div className="text-center">Transaction ID</div>,
    cell: ({ row }) => {
      const txId = row.original.gatewayTransactionId
      return (
        <div className="flex justify-center">
          <span
            className="text-xs text-muted-foreground max-w-[140px] truncate font-mono"
            title={txId ?? undefined}
          >
            {txId ?? "—"}
          </span>
        </div>
      )
    },
  },
  {
    id: "paidAt",
    header: () => <div className="text-center">Paid At</div>,
    cell: ({ row }) => {
      const date = row.original.paidAt ? new Date(row.original.paidAt) : null
      if (!date) return <div className="text-center text-sm text-muted-foreground">—</div>
      return (
        <div className="flex flex-col items-center text-sm">
          <span>{format(date, "dd MMM yyyy")}</span>
          <span className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</span>
        </div>
      )
    },
  },
  {
    id: "refundedAt",
    header: () => <div className="text-center">Refunded At</div>,
    cell: ({ row }) => {
      const date = row.original.refundedAt ? new Date(row.original.refundedAt) : null
      if (!date) return <div className="text-center text-sm text-muted-foreground">—</div>
      return (
        <div className="flex flex-col items-center text-sm">
          <span>{format(date, "dd MMM yyyy")}</span>
          <span className="text-xs text-muted-foreground">{format(date, "hh:mm a")}</span>
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
              <DropdownMenuItem onClick={() => onCancelOrderAndRefund(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <X color="red" />
                </Button>{" "}
                Cancel Order &amp; Refund
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRefundOnly(row.original.id)}>
                <Button variant="ghost" size="sm">
                  <RotateCcw color="blue" />
                </Button>{" "}
                Refund Only
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
