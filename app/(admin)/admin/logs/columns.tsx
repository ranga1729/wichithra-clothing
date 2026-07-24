import { AUDITLOGS_ACTION_BADGE_STYLES } from "@/lib/utils"
import { AuditLogRow } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"

type ColumnProps = {
  paginator?: Paginator
}

export const getColumns = ({
  paginator,
}: ColumnProps): ColumnDef<AuditLogRow>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {
      return (paginator?.pageSize ?? 0) * (paginator?.pageIndex ?? 0) + (row.index + 1)
    },
  },
  {
    accessorKey: "user",
    id: "user",
    header: () => <div className="text-center">User</div>,
    cell: ({ row }) => {
      const user = row.original.user
      return (
        <div className="flex flex-col items-center">
          <span className="font-medium">{user.firstName} {user.lastName}</span>
          <span className="text-xs text-muted-foreground">{user.email}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "action",
    id: "action",
    header: () => <div className="text-center">Action</div>,
    cell: ({ row }) => {
      const action = row.original.action
      const badgeClass = AUDITLOGS_ACTION_BADGE_STYLES[action] ?? "border-gray-500 bg-gray-100 text-gray-800"
      return (
        <div className="flex items-center justify-center">
          <span className={`border flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${badgeClass}`}>
            {action}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "entity",
    id: "entity",
    header: () => <div className="text-center">Entity</div>,
    cell: ({ row }) => {
      return (
        <div className="flex flex-col items-center">
          <span className="font-medium">{row.original.entity}</span>
          {row.original.entityId && (
            <span className="text-xs text-muted-foreground max-w-[120px] truncate" title={row.original.entityId}>
              {row.original.entityId}
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    id: "description",
    header: () => <div className="text-center">Description</div>,
    cell: ({ row }) => {
      return (
        <div className="max-w-xs text-wrap text-sm">
          {row.original.description ?? "-"}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    id: "createdAt",
    header: () => <div className="text-center">Date & Time</div>,
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt)
      return (
        <div className="flex flex-col items-center text-sm">
          <span>{date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          <span className="text-xs text-muted-foreground">{date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
        </div>
      )
    },
  },
]
