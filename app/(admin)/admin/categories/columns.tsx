import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Category } from "@/types/common-types"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Pencil, ToggleLeft, ToggleRight, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (category: Category) => void
  onDelete?: (category: Category) => void
  toggleActiveStatus?: (category: Category) => void
  paginator?: Paginator
}

export const getColumns = ({
  onEdit,
  onDelete,
  toggleActiveStatus,
  paginator
}: ColumnProps): ColumnDef<Category>[] => [
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
    accessorKey: "sizeGuide",
    id: "sizeGuide",
    header: () => { return <div className="text-center">Size Guide</div> },
    cell: ({row}) => {
      return row.original.sizeGuide ? <div>
        {row.original.sizeGuide.toString()}
      </div> : (<p className="text-center"> - </p>)
    }
  },
  {
    accessorKey: "isActive",
    id: "isActive",
    header: () => { return <div className="text-center">Is Active</div> },
    cell: ({ row }) => {
      const value = row.original.isActive
      const text = value.toString()
      return (
        <div className="flex flex-row items-center justify-center">
        <p className={`border border-neutral-400 flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
            value
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
        </p>
        </div>
      )
    },
  },
  {
    accessorKey: "sortOrder",
    id: "sortOrder",
    header: () => { return <div className="text-center">Sort Order</div> },
    cell: ({ row }) => {
      const value = row.original.sortOrder;
      return (
        <p className="flex items-center justify-center">
          {value}
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
                {
                  row.original.isActive ? 
                  <DropdownMenuItem onClick={() => toggleActiveStatus && toggleActiveStatus(row.original)} >
                    <Button variant="ghost" size={'sm'} >
                      <ToggleLeft color="red" size={'sm'} />
                    </Button> Deactivate
                  </DropdownMenuItem> :
                  <DropdownMenuItem onClick={() => toggleActiveStatus && toggleActiveStatus(row.original)} >
                    <Button variant="ghost" size={'sm'} >
                      <ToggleRight color="green" size={'sm'} />
                    </Button> Active
                  </DropdownMenuItem>
                }
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>          
        </div>
      )
    },
  },
]
