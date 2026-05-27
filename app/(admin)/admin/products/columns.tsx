import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SimpleProductSchema } from "@/schemas/admin-schemas"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Ellipsis, Eye, Pencil, ToggleLeft, ToggleRight, Trash } from "lucide-react"

type ColumnProps = {
  onEdit?: (product: SimpleProductSchema) => void
  onView?: (product: SimpleProductSchema) => void
  onDelete?: (product: SimpleProductSchema) => void
  toggleActiveStatus?: (product: SimpleProductSchema) => void
  paginator?: Paginator
}

export const getColumns = ({
  onView,
  onEdit,
  onDelete,
  toggleActiveStatus,
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
    id: "maincolor",
    header: () => { return <div className="text-center">Main Color</div> },
    cell: ({row}) => {
      const colorName = row.original.mainColor?.name
      const hexCode = row.original.mainColor?.hexCode;
      return (
        <div className="flex flex-row gap-1 items-center justify-end">
          {colorName} <div className="w-4 h-4 border border-neutral-500 rounded-full" style={{backgroundColor: `#${hexCode}`}}></div>
        </div>
      )
    }
  },
  {
    id: "basePrice",
    header: () => { return <div className="text-center">Base Price</div> },
    cell: ({row}) => {
      return (
        <div className="text-right">
          {row.original.basePrice?.toString() + " LKR"}
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
    id: "isActive",
    header: () => { return <div className="text-center">Is Active</div> },
    cell: ({ row }) => {
      const value = row.original.isActive;
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
    id: "status",
    header: () => { return <div className="text-center">Status</div> },
    cell: ({ row }) => {
      const text = row.original.status.toString()
      return (
        <div className="flex flex-row items-center justify-center">
        <p className={"border border-neutral-400 flex w-fit items-center justify-center rounded-full px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-800"}>
          {text.charAt(0).toUpperCase() + text.slice(1)}
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
