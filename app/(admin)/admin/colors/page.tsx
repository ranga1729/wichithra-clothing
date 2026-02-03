'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { Color } from "@/generated/prisma/client";
import { Paginator } from "@/types/table-types";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { deleteColor, getColors } from "./action";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { CirclePlus } from "lucide-react";
import { en } from "@/lib/i18n/en";
import AddNewModal from "./addNewModal";
import EditModal from "./editModal";

export default function DashboardPage() {
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

  const tableRef = useRef<TableWithPaginationRef>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getColors(paginator);

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        setColors(response.data.sizes)
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
        toast.success(response.message || en.messages.design_deleted_successfully)
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
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
        <div className="flex flex-row gap-2 items-center justify-end">
          <Button size={"default"} type="button" onClick={() => setIsAddNewModalOpen(true)}> <CirclePlus />{en.common.buttons.add_new} </Button>
        </div>
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
