'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { Size } from "@/generated/prisma/client";
import { Paginator } from "@/types/table-types";
import { getSizes } from "./action";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [sizes, setSizes] = useState<Size[]>([]);
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

      const response = await getSizes();

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        setSizes(response.data.sizes)
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
    <div>
      <TableWithPagination 
        ref={tableRef}
        columns={getColumns({
          // onEdit: onEdit,
          // onDelete: onDelete,
          paginator:paginator
        })}
        data={sizes} 
        isLoading={isLoading}
        totalRecords={totalRecords} 
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />
    </div>
  );
}
