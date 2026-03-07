'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { Color } from "@/generated/prisma/client";
import { Paginator } from "@/types/table-types";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { deleteColor, getColors } from "./action";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { CirclePlus, RotateCcw, Search } from "lucide-react";
import { en } from "@/lib/i18n/en";
import AddNewModal from "./addNewModal";
import EditModal from "./editModal";
import { ColorFilter } from "@/types/filter-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";

const InitiaFilter:ColorFilter = {
 name : "",
 hexCode : "",
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0,
  })
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState<Color>();
  const [filter, setFilter] = useState<ColorFilter>(InitiaFilter);

  const tableRef = useRef<TableWithPaginationRef>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getColors(paginator, filter);

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        setColors(response.data.colors)
        setTotalRecords(response.data.totalRecords)
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const onDelete = async (color: Color) => {
    try {
      const response = await deleteColor(color.id);

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        fetchData();
        toast.success(response.message || en.design_deleted_successfully)
      }
    } catch(error:any) {
      toast.error(error.message);
    }
  }

  const onEdit = (color: Color) => {
    setSelectedColor(color)
    setIsEditModalOpen(true);
  }

  useEffect(() => {
    fetchData();
  }, [paginator.pageIndex, paginator.pageSize]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsEditModalOpen(newOpen);
    setSelectedColor(undefined);
  };

  const handleSearch = () => {
    fetchData();
  }

  const handleReset = () => {
    setFilter(InitiaFilter);
  }

  const handleFilterChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
        ...prevFilter,
        [name]: value
    }));
  }
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
        <form className="flex flex-col gap-3">
          <div className="flex flex-row justify-start items-center gap-3 w-full border py-3 px-2 rounded-md">
            <div className="grid w-60 max-w-sm items-center gap-2">
              <Label htmlFor="name"> {en.name } </Label>
              <Input type="text" id="name" placeholder="Name" value={filter.name} name="name" onChange={handleFilterChange} />
            </div>
            <div className="relative">
              <Item className="absolute left-1 top-6.5 p-1 m-0" variant={"default"} > # </Item>
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="hexcode"> {en.hexCode } </Label>
                <Input type="text" id="hexCode" placeholder="HexCode" value={filter.hexCode} name="hexCode" className="pl-5" onChange={handleFilterChange} />
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
          data={colors} 
          isLoading={isLoading}
          totalRecords={totalRecords} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />

        <AddNewModal isModalOpen={isAddNewModalOpen} onOpenChange={setIsAddNewModalOpen} fetchData={fetchData} />
        <EditModal isModalOpen={isEditModalOpen} onOpenChange={handleOpenChange} selectedColor={selectedColor} fetchData={fetchData} />
      </div>
    </div>
  );
}
