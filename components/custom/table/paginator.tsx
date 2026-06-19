import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { getTotalPages } from "@/lib/utils"; 
import type { Paginator } from "@/types/table-types"; 
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  paginatorState: Paginator,
  PaginatorSetter: React.Dispatch<React.SetStateAction<Paginator>>;
}

export default function TablePaginator(props : Props) {

  const handleSelectChange = (name: keyof Paginator, value: string) => {
    const newPageSize = Number(value);
    
    props.PaginatorSetter((prev) => {
      const newState = {
        ...prev,
        [name]: newPageSize
      };
      
      // If changing pageSize, adjust pageIndex to ensure we don't go beyond available pages
      if (name === 'pageSize') {
        const totalPages = Math.ceil(prev.totalRecords! / newPageSize);
        const maxPageIndex = Math.max(0, totalPages - 1);
        
        // If current pageIndex would be out of bounds, reset to last valid page
        if (prev.pageIndex > maxPageIndex) {
          newState.pageIndex = maxPageIndex;
        }
      }
      return newState;
    });
  };

  return <div className="mt-2">
    <div className="flex justify-center dark:border dark:border-neutral-600 items-center space-x-6 lg:space-x-8 border py-2 rounded-md">
      <div className="flex items-center space-x-2">
        <p className="text-sm font-medium">Rows per page</p>
        <Select
          value={String(props.paginatorState.pageSize)}
          onValueChange={(value) => handleSelectChange("pageSize", value)}
          name="pageSize"
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={props.paginatorState.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 25, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {props.paginatorState.pageIndex + 1} of{" "}
        {getTotalPages(props.paginatorState)}
      </div>
      <div className="flex items-center space-x-2">
        {/* First page button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="size-8 lg:flex dark:border dark:border-neutral-700 dark:hover:bg-neutral-700" 
          onClick={() => props.PaginatorSetter((prev) => ({...prev, pageIndex: 0}))} 
          disabled={props.paginatorState.pageIndex === 0 || getTotalPages(props.paginatorState) === 0}
        >
          <span className="sr-only">Go to first page</span>
          <ChevronsLeft />
        </Button>

        {/* Previous page button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="size-8 dark:border dark:border-neutral-700 dark:hover:bg-neutral-700" 
          onClick={() => props.PaginatorSetter((prev) => ({...prev, pageIndex: prev.pageIndex - 1}))} 
          disabled={props.paginatorState.pageIndex === 0 || getTotalPages(props.paginatorState) === 0}
        >
          <span className="sr-only">Go to previous page</span>
          <ChevronLeft />
        </Button>

        {/* Next page button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="size-8 dark:border dark:border-neutral-700 dark:hover:bg-neutral-700" 
          onClick={() => props.PaginatorSetter((prev) => ({...prev, pageIndex: prev.pageIndex + 1}))} 
          disabled={getTotalPages(props.paginatorState) === 0 || props.paginatorState.pageIndex >= getTotalPages(props.paginatorState) - 1}
        >
          <span className="sr-only">Go to next page</span>
          <ChevronRight />
        </Button>

        {/* Last page button */}
        <Button 
          variant="outline" 
          size="icon" 
          className="size-8 lg:flex dark:border dark:border-neutral-700 dark:hover:bg-neutral-700" 
          onClick={() => props.PaginatorSetter((prev) => ({...prev, pageIndex: Math.max(0, getTotalPages(prev) - 1)}))} 
          disabled={getTotalPages(props.paginatorState) === 0 || props.paginatorState.pageIndex >= getTotalPages(props.paginatorState) - 1}
        >
          <span className="sr-only">Go to last page</span>
          <ChevronsRight />
        </Button>
      </div>
    </div>
  </div>
}