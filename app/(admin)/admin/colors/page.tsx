'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { Color } from "@/generated/prisma/client";
import { initialPaginator, Paginator } from "@/types/table-types";
import { useRef, useState } from "react";
import { getColumns } from "./columns";
import { en } from "@/lib/i18n/en";
import AddNewModal from "./addNewModal";
import EditModal from "./editModal";
import { ColorFilter } from "@/types/filter-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteColorById, getColors } from "./action";
import toast from "react-hot-toast";
import ResetFilterButton from "@/components/ResetFilterButton";
import AddNewButton from "@/components/AddNewButton";
import { useDebounce } from "@/hooks/useDebounce";

const InitiaFilter:ColorFilter = {
 name : "",
 hexCode : "",
}

export default function ColorsPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const queryClient = useQueryClient();
  
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<ColorFilter>(InitiaFilter);
  
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>();

  const debouncedFilter = useDebounce(filter, 500);

  const onEdit = (color: Color) => {
    setSelectedColor(color)
    setIsEditModalOpen(true);
  }

  const handleEditModalOpenChange = (newOpen: boolean) => {
    setIsEditModalOpen(newOpen);
    setSelectedColor(undefined);
  };

  const handleReset = () => {
    setFilter(InitiaFilter);
    setPaginator((prev) => ({...prev, pageIndex: 0}))
  }

  const handleFilterChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
        ...prevFilter, [name]: value
    }));
  }

  // react queries  
  const { data, isPending } = useQuery({
    queryKey: ['colors', 'list', {
      pageSize: paginator.pageSize, 
      pageIndex: paginator.pageIndex,
      filter: debouncedFilter
    }],
    queryFn: () => getColors(paginator, debouncedFilter),
    placeholderData: (prevData) => prevData,
  })

  const { mutate: deleteColor } = useMutation({
    mutationFn: (id: string) => deleteColorById(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['colors'] });
        toast.success(response.message || en.color_deleted_successfully);
      } else {
        toast.error(response.error || en.failed_to_delete_color);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_delete_color);
    },
  });
  
  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-col gap-3">
        <div className="flex flex-row justify-start items-center gap-3 w-full border py-3 px-2 rounded-md">
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="name"> {en.name } </Label>
            <Input 
              type="text" 
              id="name" 
              placeholder="Name" 
              value={filter.name} 
              name="name" 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="relative">
            <Item className="absolute left-1 top-6.5 p-1 m-0" variant={"default"} > # </Item>
            <div className="grid w-60 max-w-sm items-center gap-2">
              <Label htmlFor="hexcode"> {en.hexCode } </Label>
              <Input 
                type="text" 
                id="hexCode" 
                placeholder="HexCode" 
                value={filter.hexCode} 
                name="hexCode" className="pl-5" 
                onChange={handleFilterChange} 
              />
            </div>
          </div>
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <ResetFilterButton onClick={handleReset} />
          <AddNewButton onClick={() => setIsAddNewModalOpen(true)} />
        </div>
      </form>

      <TableWithPagination 
        ref={tableRef}
        columns= {getColumns({
          onEdit: onEdit,
          onDelete: (color: Color) => deleteColor(color.id),
          paginator: paginator
        })}
        data={data?.data.colors ?? []} 
        isLoading={isPending}
        totalRecords={data?.data.totalRecords ?? 0} 
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />

      <AddNewModal 
        isModalOpen={isAddNewModalOpen} 
        onOpenChange={setIsAddNewModalOpen} 
      />
      <EditModal 
        isModalOpen={isEditModalOpen} 
        onOpenChange={handleEditModalOpenChange} 
        selectedColor={selectedColor} 
      />
    </div>
  );
}
