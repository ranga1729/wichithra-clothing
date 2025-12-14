'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/Table";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { Paginator, Sorter } from "@/types/table-types";
import { Category } from "@/types/common-types";
import toast from "react-hot-toast";
import { getCategories } from "./action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { CirclePlus, RotateCcw, Search } from "lucide-react";
import { CategoryFilter } from "@/schemas/filters";
import SortDropDown, { SortDropDownOptions } from "@/components/custom/general/SortDropDown";

export default function CategoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0)
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0,
  })

  const { register, control, getValues, reset } = useForm<CategoryFilter>({
    defaultValues: {
      name: "",
      slug: "",
      sortColumn: "name",
      sortOrder: "asc",
    }
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
      const { name, slug, sortColumn, sortOrder } = getValues();
      const filter : CategoryFilter = {
        name : name,
        slug : slug
      }

      const sorter : Sorter = {
        sortColumn : sortColumn,
        sortOrder : sortOrder
      }

      const response = await getCategories(paginator, filter, sorter);
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

  const SortColumns: SortDropDownOptions[] = [
    { name: "Name", value: "name"},
    { name: "Slug", value: "slug"},
    { name: "Sort Order", value: "sortOrder"}
  ]

  const handleSearch = async () => {
    fetchData();
  }

  const handleReset = () => {
    reset();
  }
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
        <div className="">
          <form className="flex flex-col gap-3">
            <div className="flex flex-row justify-start items-center gap-3 w-full border py-3 px-2 rounded-md">
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="name">Name</Label>
                <Input type="text" id="name" placeholder="Name" {...register("name")} />
              </div>
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="Slug">Slug</Label>
                <Input type="text" id="Slug" placeholder="Slug" {...register("slug")} />
              </div>

              <Controller
                name="sortColumn"
                control={control}
                render={({ field: columnField }) => (
                  <Controller
                    name="sortOrder"
                    control={control}
                    render={({ field: orderField }) => (
                      <div className="flex flex-col gap-2 w-60">
                        <Label htmlFor="sort">Sort</Label>
                        <SortDropDown
                          id="sort"
                          sortColumnOptions={SortColumns}
                          columnValue={columnField.value}
                          orderValue={orderField.value}
                          onColumnChange={columnField.onChange}
                          onOrderChange={orderField.onChange}
                        />
                      </div>
                    )}
                  />
                )}
              />

            </div>
            
            <div className="flex flex-row gap-2">
              <Button size={"default"} type="button" onClick={handleSearch}> <Search /> Apply Filter</Button>
              <Button size={"default"} type="button" onClick={handleReset}> <RotateCcw /> Reset Filter</Button>
              <Button size={"default"} type="button" onClick={() => console.log("show the modal")}> <CirclePlus /> Create New</Button>
            </div>
          </form>
        </div>

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
