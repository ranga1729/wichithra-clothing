import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Category } from "@/generated/prisma/client"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Copy, Ellipsis, ExternalLink, Eye, Pencil, ToggleLeft, ToggleRight, Trash } from "lucide-react"
import toast from "react-hot-toast"

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
    header: () => <div className="text-center">Description</div>,
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        /* 2. Switch to w-full so it matches the <td> element size */
        <div className="max-w-md text-wrap">
          {description}
        </div>
      );
    },
  },
  {
    accessorKey: "sizeGuide",
    id: "sizeGuide",
    header: () => <div className="text-center">Size Guide</div>,
    cell: ({ row }) => {
      if (!row.original.sizeGuide) return <p className="text-center">-</p>;

      const url = row.original.sizeGuide.toString();

      const handleCopy = () => {
        navigator.clipboard.writeText(url);
        toast.success("Link copied!");
      };

      const handleOpen = () => {
        window.open(url, "_blank", "noopener,noreferrer");
      };

      return (
        <div className="flex items-center gap-2 min-w-0 max-w-md">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 border p-3 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-100"
            onClick={handleOpen}
          >
            <ExternalLink className="h-3.5 w-3.5 " />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 border p-3 dark:bg-neutral-700 dark:hover:bg-neutral-600 dark:active:bg-neutral-500 bg-neutral-200 hover:bg-neutral-300 active:bg-neutral-100"
            onClick={handleCopy}
          >
            <Copy className="h-3.5 w-3.5 " />
          </Button>
          <span className="flex-1 min-w-0 text-sm text-muted-foreground truncate">
            {url}
          </span>
        </div>
      );
    },
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
              <Button variant="outline" className="dark:border dark:border-neutral-600 dark:hover:bg-neutral-600" size={'sm'}><Ellipsis /></Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => onEdit && onEdit(row.original)} >
                  <Button variant="ghost" size={'sm'} >
                    <Pencil height={10} width={10} />
                  </Button> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete && onDelete(row.original)} >
                  <Button variant="ghost" size={'sm'} >
                    <Trash color="red" height={10} width={10} />
                  </Button> Delete
                </DropdownMenuItem>
                {
                  row.original.isActive ? 
                  <DropdownMenuItem onClick={() => toggleActiveStatus && toggleActiveStatus(row.original)} >
                    <Button variant="ghost" size={'sm'} >
                      <ToggleLeft color="red" height={10} width={10} />
                    </Button> Deactivate
                  </DropdownMenuItem> :
                  <DropdownMenuItem onClick={() => toggleActiveStatus && toggleActiveStatus(row.original)} >
                    <Button variant="ghost" size={'sm'} >
                      <ToggleRight color="green" height={10} width={10} />
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
