'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { Paginator } from "@/types/table-types";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import toast from "react-hot-toast";
import { getProducts } from "./action";
import { SimpleProductSchema } from "@/schemas/admin-schemas";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const [products, setProducts] = useState<SimpleProductSchema[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0,
  })
    
  const tableRef = useRef<TableWithPaginationRef>(null);

  const router = useRouter();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getProducts();

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        setProducts(response.data.products)
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

  const onEdit = (product:SimpleProductSchema) => {
    router.push(`/admin/products/${product.id}`);
  }

  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            onEdit: onEdit,
            // onDelete: onDelete,
            // toggleActiveStatus: toggleActiveStatus
            onView: onEdit,
            paginator:paginator
          })}
          data={products} 
          isLoading={isLoading}
          totalRecords={totalRecords} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>
    </div>
  )
}