import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Color } from "@/generated/prisma/client"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Pencil, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (size: Color) => void
  onDelete?: (size: Color) => void
  paginator?: Paginator
}

export const getColumns = ({
  onEdit,
  onDelete,
  paginator
}: ColumnProps): ColumnDef<Color>[] => [
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
    accessorKey: "hexCode",
    id: "hexCode",
    header: () => { return <div className="text-center">HexCode</div> },
    cell: ({ row }) => {
      const hex = row.original.hexCode;
      return (
        <div className="flex flex-row items-center justify-center">
          <p className={"border border-neutral-300 flex w-fit items-center justify-center rounded-md px-1 py-1 text-xs font-medium bg-neutral-200 text-neutral-800"}>
            { "#" + hex }
          </p>
        </div>
      )
    },
  },
  {
    id: "preview",
    header: () => { return <div className="text-center">Preview</div> },
    cell: ({ row }) => {
      const hex = row.original.hexCode?.toString();
      return (
        <div className="flex flex-row items-center justify-center">
          <div className="border border-neutral-500 rounded-full w-7 h-7" style={{ backgroundColor: "#" + hex }}></div>
        </div>
      )
    },
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
