'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { initialPaginator, Paginator } from "@/types/table-types";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { getProducts } from "./action";
import { SimpleProductSchema } from "@/schemas/admin-schemas";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ProductFilter } from "@/types/filter-types";
import ResetFilterButton from "@/components/ResetFilterButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { en } from "@/lib/i18n/en";
import CustomSelect from "@/components/custom/general/CustomSelect";
import toast from "react-hot-toast";
import { getCategorySelectorData } from "../facets/categories/action";
import { useDebounce } from "@/hooks/useDebounce";
import AddNewButton from "@/components/AddNewButton";
import AddNewModal from "./AddNewModal";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";

const initiaFilter:ProductFilter = {
  name: "",
  slug: "",
  category: "",
}

export default function ProductsPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const router = useRouter();
  
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<ProductFilter>(initiaFilter)

  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);

  const debouncedFilter = useDebounce(filter, 500);

  const onEdit = (product:SimpleProductSchema) => {
    router.push(`/admin/products/${product.id}`);
  }

  const handleFilterChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
        ...prevFilter, [name]: value
    }));
  }

  const handleSelectorChange = (name: string, value: string) => {
    setFilter(prevFilter => ({
        ...prevFilter, [name]: value
    }));
  }
  
  const handleReset = () => {
    setFilter(initiaFilter);
    setPaginator((prev) => ({...prev, pageIndex: 0}))
  }

  //react queries
  const { data, isPending, error, isError } = useQuery({
    queryKey: ['products', 'list', {
      pageSize: paginator.pageSize, 
      pageIndex: paginator.pageIndex,
      filter: debouncedFilter
    }],
    queryFn: async () => {
      const response = await getProducts(paginator, debouncedFilter)
      if(!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data);
      }
      return response.data
    },
    placeholderData: (prevdata) => prevdata
  })

  const { data : categorySelectorData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategorySelectorData()
      if(!response.success) {
        toast.error(response.error ?? en.failed_to_load_category_filter_data)
      }
      return response.data
    },
    placeholderData: (prevdata) => prevdata
  })

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [error, isError])

  return (
    <div className="flex flex-col gap-3">

        {/* Page header */}
        <Item variant="muted">
          <ItemContent>
            <ItemTitle className="text-2xl">Products</ItemTitle>
            <ItemDescription className="whitespace-normal line-clamp-none">
              A product is a construct represents a one product category and multiple Designs. <br/>
              (Ex: Baggy Tshirt with Crew Neck - Category: Tshirt, Designs: Baggy + Crew neck)
            </ItemDescription>
          </ItemContent>
        </Item>
        
      <form className="flex flex-col gap-3 border border-border bg-card py-3 px-2 rounded-md">
        <div className="flex flex-row justify-start items-center gap-3 w-full">
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
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="name"> {en.slug } </Label>
            <Input 
              type="text" 
              id="slug" 
              placeholder="Slug" 
              value={filter.slug} 
              name="slug" 
              onChange={handleFilterChange} 
            />
          </div>
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="name"> {en.category } </Label>
            <CustomSelect 
              placeholder={"Category"} 
              onValueChange={(val) => handleSelectorChange("category", val)} 
              DBRowsObject={categorySelectorData}
              value={filter.category}
            >
            </CustomSelect>
          </div>
        </div>
        
        <div className="flex flex-row items-center justify-start">
          <ResetFilterButton onClick={handleReset} />
        </div>
      </form>

      <div className="flex flex-row items-center justify-end">
        <AddNewButton onClick={() => setIsAddNewModalOpen(true)} />
      </div>
      
      <TableWithPagination 
        ref={tableRef}
        columns={getColumns({
          onEdit: onEdit,
          // onDelete: onDelete,
          onView: onEdit,
          paginator:paginator
        })}
        data={data?.products ?? []} 
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0} 
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />

      <AddNewModal isModalOpen={isAddNewModalOpen} onOpenChange={setIsAddNewModalOpen} />
    </div>
  )
}