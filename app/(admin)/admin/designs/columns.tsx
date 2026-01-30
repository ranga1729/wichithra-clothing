import { Button } from "@/components/ui/button"
import { Design } from "@/types/common-types"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Pencil, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (design: Design) => void
  onDelete?: (design: Design) => void
  paginator?: Paginator
}

export const getColumns = ({
  onEdit,
  onDelete,
  paginator
}: ColumnProps): ColumnDef<Design>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {return (paginator?.pageSize! * (paginator?.pageIndex!) + (row.index + 1))},
  },
  {
    accessorKey: "name",
    id: "name",
    header: () => { return <div className="text-center">Name</div> },
  },
  {
    accessorKey: "slug",
    id: "slug",
    header: () => { return <div className="text-center">Slug</div> },
  },
  {
    accessorKey: "description",
    id: "description",
    header: () => { return <div className="text-center">Description</div> },
  },
  {
    accessorKey: "id",
    id: "actions",
    header: () => { return <div className="text-center">Actions</div> },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row gap-2 justify-center items-center">
          <Button
            variant="outline"
            onClick={() => onEdit && onEdit(row.original)}
            size={'sm'}
          >
            <Pencil />
          </Button>
          <Button
            variant="outline"
            onClick={() => onDelete && onDelete(row.original)}
            size={'sm'}
          >
            <Trash />
          </Button>
        </div>
      )
    },
  },
]
