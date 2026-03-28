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
import CustomColorSelector from "@/components/custom/general/CustomColorSelector";
import toast from "react-hot-toast";
import { getColorSelectorData } from "../colors/action";
import { getCategorySelectorData } from "../categories/action";
import { useDebounce } from "@/hooks/useDebounce";

const initiaFilter:ProductFilter = {
  name: "",
  slug: "",
  category: "",
  mainColor: "",
}

export default function ProductsPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const router = useRouter();
  
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<ProductFilter>(initiaFilter)

  const debouncedFilter = useDebounce(filter, 500);

  const onEdit = (product:SimpleProductSchema) => {
    router.push(`/admin/products/${product.id}`);
  }

  const handleFilterChange = (e:React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log(name, value)
    setFilter(prevFilter => ({
        ...prevFilter, [name]: value
    }));
  }

  const handleSelectorChange = (name: string, value: string) => {
    console.log(name, value)
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

  const { data : colorSelectorData } = useQuery({
    queryKey: ['colors'],
    queryFn: async () => {
      const response = await getColorSelectorData()
      if(!response.success) {
        toast.error(response.error ?? en.failed_to_load_color_filter_data)
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

  useEffect(() => {
    console.log("test: ", filter)
  }, [filter])

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
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="name"> {en.main_color } </Label>
            <CustomColorSelector 
              placeholder={"Main Color"}
              onValueChange={(val) => handleSelectorChange("mainColor", val)}
              value={filter.mainColor} 
              optionsObject={colorSelectorData}            
            >
            </CustomColorSelector>
          </div>
        </div>
        
        <div className="flex flex-row items-center justify-between">
          <ResetFilterButton onClick={handleReset} />
          {/* <AddNewButton onClick={() => setIsAddNewModalOpen(true)} /> */}
        </div>
      </form>
      
      <TableWithPagination 
        ref={tableRef}
        columns={getColumns({
          onEdit: onEdit,
          // onDelete: onDelete,
          // toggleActiveStatus: toggleActiveStatus
          onView: onEdit,
          paginator:paginator
        })}
        data={data?.products ?? []} 
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0} 
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />
    </div>
  )
}