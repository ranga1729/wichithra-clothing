'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { useRef, useState } from "react";
import { getColumns } from "./columns";
import { DropDownOptions, initialPaginator, Paginator, Sorter } from "@/types/table-types";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SortDropDown from "@/components/custom/general/SortDropDown";
import { DesignFilter } from "@/types/filter-types";
import { en } from "@/lib/i18n/en";
import { Design } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ResetFilterButton from "@/components/ResetFilterButton";
import AddNewButton from "@/components/AddNewButton";
import { useDebounce } from "@/hooks/useDebounce";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { deleteDesignById, getDesigns } from "./action";
import UpdateModal from "./UpdateModal";
import AddNewModal from "./AddNewModal";

const InitialSorter:Sorter = {
  sortColumn: "name",
  sortOrder: "asc",
}
const InitiaFilter:DesignFilter = {
  name : "",
  slug : "",
}

const SortColumns: DropDownOptions[] = [
  { name: "Name", value: "name"},
  { name: "Slug", value: "slug"},
]

export default function DesignPage() {
  const queryClient = useQueryClient();
  const tableRef = useRef<TableWithPaginationRef>(null);

  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [sorter, setSorter] = useState<Sorter>(InitialSorter);
  const [filter, setFilter] = useState<DesignFilter>(InitiaFilter);

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design>();

  const debouncedFilter = useDebounce(filter, 500);
  const debouncedSorter = useDebounce(sorter, 500);

  const handleReset = () => {
    setFilter(InitiaFilter);
    setSorter(InitialSorter);
  }

  const onEdit = (design:Design) => {
    setSelectedDesign(design)
    setIsEditModalOpen(true);
  }

  const handleSorterChange = (value: string, name: string) => {
    setSorter(prevSorter => ({
      ...prevSorter,
      [name]:value
    }))
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
        ...prevFilter,
        [name]: value
    }));
  }

  //react queries
  const { data, isPending } = useQuery({
    queryKey: ['designs', 'lists', {
      pageSize: paginator.pageSize, 
      pageIndex: paginator.pageIndex,
      sorter: debouncedSorter,
      filter: debouncedFilter
    }],
    queryFn: () => getDesigns(paginator, debouncedFilter, debouncedSorter,),
    placeholderData: (prevData) => prevData,
  })

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (id: string) => deleteDesignById(id),
    onSuccess: (response) => {
      if(response.success) {
        queryClient.invalidateQueries({ queryKey: ['designs'] });
        toast.success(response.message || en.category_deleted_successfully);
      } else {
        toast.error(response.error || en.Failed_to_delete_category);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.Failed_to_delete_category);
    },
  })
  
  return (
    <div>
      <div className="flex flex-col gap-3">
        {/* Page header */}
        <Item variant="muted">
          <ItemContent>
            <ItemTitle className="text-2xl">Designs</ItemTitle>
            <ItemDescription className="whitespace-normal line-clamp-none">
              Structural alterations and surface alterations applied to a bacis structure(category) of an apparel item. <br/>
              ex: Baggy Tshirt (Tshirt is the category, Baggy is the design)
            </ItemDescription>
          </ItemContent>
        </Item>
        
        <form className="flex flex-col gap-3 border py-3 px-2 rounded-md dark:border dark:border-neutral-600">
          <div className="flex flex-row justify-start items-center gap-3 w-full">
            <div className="grid w-60 max-w-sm items-center gap-2">
              <Label htmlFor="name"> {en.name } </Label>
              <Input type="text" id="name" placeholder="Name" value={filter.name} name="name" onChange={handleFilterChange} />
            </div>
            <div className="grid w-60 max-w-sm items-center gap-2">
              <Label htmlFor="Slug"> {en.slug } </Label>
              <Input type="text" id="Slug" placeholder="Slug" value={filter.slug} name="slug" onChange={handleFilterChange} />
            </div>

            <div className="flex flex-col gap-2 w-60">
              <Label htmlFor="sort"> {en.sort } </Label>
              <SortDropDown
                id="sort"
                sortColumnOptions={SortColumns}
                columnValue={sorter.sortColumn}
                orderValue={sorter.sortOrder}
                onSorterChange ={handleSorterChange}
              />
            </div>

          </div>
          
          <div className="flex flex-row gap-2 items-center justify-between">
            <ResetFilterButton onClick={handleReset} />
          </div>
        </form>

        <div className="flex flex-row gap-2 items-center justify-end">
          <AddNewButton onClick={() => setIsAddNewModalOpen(true)} />
        </div>

        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            onEdit: onEdit,
            onDelete: (category) => deleteCategory(category.id),
            paginator:paginator
          })}
          data={data?.data?.designs ?? []} 
          isLoading={isPending}
          totalRecords={data?.data?.totalRecords ?? 0} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>

      <AddNewModal isModalOpen={isAddNewModalOpen} onOpenChange={setIsAddNewModalOpen} />
      <UpdateModal isModalOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} selectedDesign={selectedDesign} />
    </div>
  );
}
