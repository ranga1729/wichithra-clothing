import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Color } from "@/generated/prisma/client"
import { Paginator } from "@/types/table-types"
import { ColumnDef } from "@tanstack/react-table"
import { Copy, Ellipsis, ExternalLink, Pencil, Trash } from "lucide-react"
import toast from "react-hot-toast"

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
    header: () => { return <div className="text-center">HexCode/Swatch Url</div> },
    cell: ({ row }) => {
      const hex = row.original.hexCode;
      const swatchUrl = row.original.swatchImageUrl;

      if (swatchUrl) {
        const handleCopy = () => {
          navigator.clipboard.writeText(swatchUrl);
          toast.success("Link copied!");
        };

        const handleOpen = () => {
          window.open(swatchUrl, "_blank", "noopener,noreferrer");
        };

        return (
          <div className="flex items-center gap-2 min-w-0 max-w-md w-md">
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
              {swatchUrl}
            </span>
          </div>
        );
      }

      if (hex) {
        return (
          <div className="flex flex-row items-center justify-center">
            <p className="border border-neutral-300 flex w-fit items-center justify-center rounded-md px-1 py-1 text-xs font-medium bg-neutral-200 text-neutral-800">
              {"#" + hex}
            </p>
          </div>
        );
      }

      return <span className="text-neutral-400 text-xs">—</span>;
    },
  },
  {
    id: "preview",
    header: () => { return <div className="text-center">Color/Swatch Preview</div> },
    cell: ({ row }) => {
      const hex = row.original.hexCode;
      const swatchUrl = row.original.swatchImageUrl;
      return (
        <div className="flex flex-row items-center justify-center">
          {swatchUrl ? (
            <img
              src={swatchUrl}
              alt={row.original.name}
              className="w-15 h-8 rounded-sm border border-neutral-500 object-cover"
            />
          ) : hex ? (
            <div className="border border-neutral-500 rounded-sm w-15 h-8" style={{ backgroundColor: "#" + hex }}></div>
          ) : (
            <div className="border border-neutral-300 rounded-full w-7 h-7" />
          )}
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
              <Button variant="outline" className="dark:border dark:border-neutral-600 dark:hover:bg-neutral-600" size={'sm'}><Ellipsis /></Button>
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
