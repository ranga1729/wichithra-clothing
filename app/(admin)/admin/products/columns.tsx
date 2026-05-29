import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleProductSchema } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Eye, Pencil, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (product: SimpleProductSchema) => void
  onView?: (product: SimpleProductSchema) => void
  onDelete?: (product: SimpleProductSchema) => void
  paginator?: Paginator
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
  paginator
}: ColumnProps): ColumnDef<SimpleProductSchema>[] => [
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
    cell: ({ row }) => {
      const desc = row.original.description;
      return (
        <div className="max-w-48 truncate text-neutral-500 text-sm">
          {desc ?? <span className="text-neutral-300">—</span>}
        </div>
      );
    },
  },
  {
    id: "categoryName",
    header: () => { return <div className="text-center">Category</div> },
    cell: ({row}) => {
      const categoryName = row.original.category.name;
      return (
        <div>
          {categoryName}
        </div>
      )
    }
  },
  {
    id: "gender",
    header: () => { return <div className="text-center">Gender</div> },
    cell: ({row}) => {
      const gender = row.original.gender;
      const formattedGender = gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      return (
        <div className="text-left">
          {formattedGender}
        </div>
      )
    }
  },
  {
    id: "ageGroup",
    header: () => { return <div className="text-center">Age Group</div> },
    cell: ({row}) => {
      const ageGroup = row.original.ageGroup;
      const formattedAgeGroup = ageGroup.charAt(0).toUpperCase() + ageGroup.slice(1).toLowerCase();
      return (
        <div className="text-left">
          {formattedAgeGroup}
        </div>
      )
    }
  },
  {
    accessorKey: "discountPercentage",
    id: "discountPercentage",
    header: () => { return <div className="text-center">Discount %</div> },
    cell: ({row}) => {
      return (
        <div className="text-right">
          {row.original.discountPercentage + " %"}
        </div>
      )
    }
  },
  {
    id: "isFeatured",
    header: () => { return <div className="text-center">Is Featured</div> },
    cell: ({ row }) => {
      const value = row.original.isFeatured
      const text = value.toString()
      return (
        <div className="flex flex-row items-center justify-center">
          <p className={`border flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${
              value
                ? "border-green-500 bg-green-100 text-green-800"
                : "border-red-500 bg-red-100 text-red-800"
            }`}>
            {text.charAt(0).toUpperCase() + text.slice(1)}
          </p>
        </div>
      )
    },
  },
  {
    id: "status",
    header: () => { return <div className="text-center">Status</div> },
    cell: ({ row }) => {
      const status = row.original.status;
      const text = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
      const statusStyles: Record<string, string> = {
        AVAILABLE: "border-green-500 bg-green-100 text-green-800",
        OUTOFSTOCK: "border-amber-700 bg-amber-100 text-amber-800",
        DISCONTINUED: "border-red-500 bg-red-100 text-red-800",
        DRAFT: "border-yellow-500 bg-yellow-100 text-yellow-800",
      };
      const style = statusStyles[status] ?? "border-neutral-400 bg-neutral-100 text-neutral-800";
      return (
        <div className="flex flex-row items-center justify-center">
          <p className={`border flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${style}`}>
            {text}
          </p>
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
                <DropdownMenuItem onClick={() => onView && onView(row.original)} >
                  <Button variant="ghost" size={'sm'} >
                    <Eye />
                  </Button> View
                </DropdownMenuItem>
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
