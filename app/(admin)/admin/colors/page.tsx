'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { Color } from "@/generated/prisma/client";
import { Paginator } from "@/types/table-types";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { getColors } from "./action";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0,
  })

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

  useEffect(() => {
    fetchData();
  }, [paginator.pageIndex, paginator.pageSize]);
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            // onEdit: onEdit,
            // onDelete: onDelete,
            paginator:paginator
          })}
          data={colors} 
          isLoading={isLoading}
          totalRecords={totalRecords} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>
    </div>
  );
}
