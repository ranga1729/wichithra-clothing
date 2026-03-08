'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { Color } from "@/generated/prisma/client";
import { Paginator } from "@/types/table-types";
import { useRef, useState } from "react";
import { getColumns } from "./columns";
import { deleteColor } from "./action";
import { Button } from "@/components/ui/button";
import { CirclePlus, RotateCcw, Search } from "lucide-react";
import { en } from "@/lib/i18n/en";
import AddNewModal from "./addNewModal";
import EditModal from "./editModal";
import { ColorFilter } from "@/types/filter-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { useDeleteColor, useGetColors } from "./useColors";

const InitiaFilter:ColorFilter = {
 name : "",
 hexCode : "",
}

const initialPaginator: Paginator = {
  pageSize: 10,
  pageIndex: 0,
  totalRecords: 0,
}

export default function ColorsPage() {
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<ColorFilter>(InitiaFilter);
  const [activeFilter, setActiveFilter] = useState<ColorFilter>(InitiaFilter)
  
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>();

  const tableRef = useRef<TableWithPaginationRef>(null);

  const { data, isLoading } = useGetColors(paginator, activeFilter);

  const { mutate: deleteColor } = useDeleteColor();

  const onDelete = (color: Color) => deleteColor(color.id)

  const onEdit = (color: Color) => {
    setSelectedColor(color)
    setIsEditModalOpen(true);
  }

  const handleOpenChange = (newOpen: boolean) => {
    setIsEditModalOpen(newOpen);
    setSelectedColor(undefined);
  };

  const handleSearch = () => {
    setPaginator((prev) => ({...prev, pageIndex: 0}))
    setActiveFilter(filter);
  }

  const handleReset = () => {
    setFilter(InitiaFilter);
    setActiveFilter(InitiaFilter);
    setPaginator((prev) => ({...prev, pageIndex: 0}))
  }

  const handleFilterChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
        ...prevFilter, [name]: value
    }));
  }

  const handleEditOpenChange = (open: boolean) => {
    setIsEditModalOpen(open)
    if (!open) setSelectedColor(undefined)
  }
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
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
          
          <div className="flex flex-row gap-2 items-center justify-between">
            <div className="flex flex-row gap-2">
              <Button size={"default"} type="button" onClick={handleSearch}> <Search /> {en.apply_filters} </Button>
              <Button size={"default"} type="button" onClick={handleReset}> <RotateCcw /> {en.reset_filters} </Button>
            </div>
            <Button size={"default"} type="button" onClick={() => setIsAddNewModalOpen(true)}> <CirclePlus />{en.add_new} </Button>
          </div>
        </form>

        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            onEdit: onEdit,
            onDelete: onDelete,
            paginator:paginator
          })}
          data={data?.data.colors ?? []} 
          isLoading={isLoading}
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
          onOpenChange={handleOpenChange} 
          selectedColor={selectedColor} 
        />
      </div>
    </div>
  );
}
