'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { DropDownOptions, initialPaginator, Paginator, Sorter } from "@/types/table-types";
import toast from "react-hot-toast";
import { deleteCategoryById, getCategories, toggleActiveStatusById } from "./action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import SortDropDown from "@/components/custom/general/SortDropDown";
import { CategoryFilter } from "@/types/filter-types";
import EditModal from "./editModal";
import { en } from "@/lib/i18n/en";
import AddNewModal from "./AddNewModal";
import { Category } from "@/generated/prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import ResetFilterButton from "@/components/ResetFilterButton";
import AddNewButton from "@/components/AddNewButton";
import { useDebounce } from "@/hooks/useDebounce";

const InitialSorter:Sorter = {
  sortColumn: "name",
  sortOrder: "asc",
}
const InitiaFilter:CategoryFilter = {
 name : "",
 slug : "",
}

const SortColumns: DropDownOptions[] = [
  { name: "Name", value: "name"},
  { name: "Slug", value: "slug"},
  { name: "Sort Order", value: "sortOrder"}
]

export default function CategoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const queryClient = useQueryClient();

  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [sorter, setSorter] = useState<Sorter>(InitialSorter);
  const [filter, setFilter] = useState<CategoryFilter>(InitiaFilter);

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const debouncedFilter = useDebounce(filter, 500);
  const debouncedSorter = useDebounce(sorter, 500);

  const handleReset = () => {
    setFilter(InitiaFilter);
    setSorter(InitialSorter);
  }

  const onEdit = (category:Category) => {
    setSelectedCategory(category)
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

  // react queries  
  const { data, isPending, error, isError } = useQuery({
    queryKey: ['categories', 'list', {
      pageSize: paginator.pageSize, 
      pageIndex: paginator.pageIndex,
      sorter: debouncedSorter,
      filter : debouncedFilter
    }],
    queryFn: async () => {
      const response = await getCategories(paginator, debouncedFilter, debouncedSorter)
      if(!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data);
      }
      return response.data
    },
    placeholderData: (prevData) => prevData,
  })

  const { mutate: deleteCategory } = useMutation({
    mutationFn: (id: string) => deleteCategoryById(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast.success(response.message || en.color_deleted_successfully);
      } else {
        toast.error(response.error || en.failed_to_delete_color);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.Failed_to_delete_category)
    }
  })

  const { mutate: toggleActiveStatus } = useMutation({
    mutationFn: (id: string) => toggleActiveStatusById(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast.success(response.message || en.active_status_toggled);
      } else {
        toast.error(response.error || en.failed_to_toggle_active_status);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_toggle_active_status)
    }
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [error, isError])
  
  return (
    <div>
      <div className="flex flex-col gap-3">
        <div>
          <form className="flex flex-col gap-3">
            <div className="flex flex-row justify-start items-center gap-3 w-full border py-3 px-2 rounded-md">
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="name"> {en.name} </Label>
                <Input type="text" id="name" placeholder="Name" value={filter.name} name="name" onChange={handleFilterChange} />
              </div>
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="Slug"> {en.slug} </Label>
                <Input type="text" id="Slug" placeholder="Slug" value={filter.slug} name="slug" onChange={handleFilterChange} />
              </div>

              <div className="flex flex-col gap-2 w-60">
                <Label htmlFor="sort"> {en.sort} </Label>
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
              <AddNewButton onClick={() => setIsAddNewModalOpen(true)} />
            </div>
          </form>
        </div>

        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            onEdit: onEdit,
            onDelete: (category: Category) => deleteCategory(category.id),
            toggleActiveStatus: (category: Category) => toggleActiveStatus(category.id),
            paginator:paginator
          })}
          data={data?.categories ?? []} 
          isLoading={isPending}
          totalRecords={data?.totalRecords ?? 0} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>

      <AddNewModal isModalOpen={isAddNewModalOpen} onOpenChange={setIsAddNewModalOpen} />
      <EditModal isModalOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} selectedCategory={selectedCategory} />
    </div>
  );
}
