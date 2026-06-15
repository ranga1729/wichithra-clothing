import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Size } from "@/generated/prisma/client"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Pencil, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (size: Size) => void
  onDelete?: (size: Size) => void
  paginator?: Paginator
}

export const getColumns = ({
  onEdit,
  onDelete,
  paginator
}: ColumnProps): ColumnDef<Size>[] => [
  {
    id: "index",
    header: "No.",
    cell: ({ row }) => {return (paginator?.pageSize! * (paginator?.pageIndex!) + (row.index + 1))},
  },
  {
    accessorKey: "name",
    id: "name",
    header: () => { return <div className="text-center">Name</div> },
    cell: ({ row }) => {
      const text = row.original.name;
      return (
        <div className="flex flex-row items-center justify-center">
          <p className={"border border-neutral-400 flex w-fit items-center justify-center rounded-md px-1.5 py-1 text-xs font-medium bg-neutral-200 text-neutral-800"}>
            {text}
          </p>
        </div>
      )
    },
  },
  {
    accessorKey: "description",
    id: "description",
    header: () => { return <div className="text-center">Description</div> },
  },
  {
    accessorKey: "sortOrder",
    id: "sotOrder",
    header: () => { return <div className="text-center">Sort Order</div> },
    cell: ({ row }) => {
      const sortOrder = row.original.sortOrder;
      return (
        <p className="flex items-center justify-center">
          {sortOrder}
        </p>
      )
    }
  },
  {
    accessorKey: "id",
    id: "actions",
    header: () => { return <div className="text-center">Actions</div> },
    cell: ({ row }) => {
      return (
        <div className="flex flex-row gap-2 justify-center items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size={'sm'}><Ellipsis /></Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit && onEdit(row.original)} >
                  <Button variant="ghost" size={'sm'} >
                    <Pencil />
                  </Button> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete && onDelete(row.original)} >
                  <Button variant="ghost" size={'sm'} >
                    <Trash color="red" />
                  </Button> Delete
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>          
        </div>
      )
    },
  },
]
