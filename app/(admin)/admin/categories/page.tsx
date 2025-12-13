'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/Table";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { Paginator } from "@/types/table-types";
import { Category } from "@/types/common-types";
import toast from "react-hot-toast";
import { getCategories } from "./action";

export default function CategoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0)
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0
  })

  const onEdit = (category:Category) => {
    console.log("Edit: ", category.id)
  }
  const onDelete = (category:Category) => {
    console.log("Delete: ", category.id)
  }

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await getCategories(paginator);
      console.log(response.data)

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        setCategories(response.data.categories)
        setTotalRecords(response.data.totalRecords)
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // I guess this is unnecessary cuz the below useEffect execute at the beginning
  // useEffect(() => {
  //   fetchData()
  // }, [])

  useEffect(() => {
    fetchData();
  }, [paginator.pageIndex, paginator.pageSize]);
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container mx-auto p-5">
        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            onEdit: onEdit,
            onDelete: onDelete,
            paginator:paginator
          })}
          data={categories} 
          isLoading={isLoading}
          totalRecords={totalRecords} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>
    </div>
  );
}
