'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { DropDownOptions, Paginator, Sorter } from "@/types/table-types";
import toast from "react-hot-toast";
import { deleteCategory, getCategories, toggleActiveStatusOfCategory } from "./action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CirclePlus, RotateCcw, Search } from "lucide-react";
import SortDropDown from "@/components/custom/general/SortDropDown";
import { CategoryFilter } from "@/types/filter-types";
import EditModal from "./editModal";
import { en } from "@/lib/i18n/en";
import AddNewModal from "./AddNewModal";
import { Category } from "@/generated/prisma/client";

const InitialSorter:Sorter = {
  sortColumn: "name",
  sortOrder: "asc",
}
const InitiaFilter:CategoryFilter = {
 name : "",
 slug : "",
}

const SortColumns: DropDownOptions[] = [
  { name: "Name", value: "name"},
  { name: "Slug", value: "slug"},
  { name: "Sort Order", value: "sortOrder"}
]

export default function CategoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0,
  })
  const [sorter, setSorter] = useState<Sorter>(InitialSorter);
  const [filter, setFilter] = useState<CategoryFilter>(InitiaFilter);
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getCategories(paginator, filter, sorter);

      if(!response.success && response.message) {
        toast.error(response.message);
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

  const handleSearch = async () => {
    fetchData();
  }

  const handleReset = () => {
    setFilter(InitiaFilter);
    setSorter(InitialSorter);
  }

  const onEdit = (category:Category) => {
    setSelectedCategory(category)
    setIsEditModalOpen(true);
  }

  const onDelete = async (category:Category) => {
    try {
      const response = await deleteCategory(category.id);

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        toast.success(response.message || en.category_deleted_successfully)
        fetchData();
      }
    } catch(error:any) {
      toast.error(error.message);
    }
  }

  const toggleActiveStatus = async (category: Category) => {
    try {
      const response = await toggleActiveStatusOfCategory(category.id);
      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        toast.success(response.message || en.active_status_toggled)
        fetchData();
      }
    } catch(error:any) {
      toast.error(error.message);
    }
  }

  const handleSorterChange = (value: string, name: string) => {
    setSorter(prevSorter => ({
      ...prevSorter,
      [name]:value
    }))
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter(prevFilter => ({
        ...prevFilter,
        [name]: value
    }));
  }

  useEffect(() => {
    fetchData();
  }, [paginator.pageIndex, paginator.pageSize]);
  
  return (
    <div className="w-full h-full dark:bg-neutral-800 bg-neutral-100">
      <div className="container flex flex-col gap-3 mx-auto p-5">
        <div className="">
          <form className="flex flex-col gap-3">
            <div className="flex flex-row justify-start items-center gap-3 w-full border py-3 px-2 rounded-md">
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="name"> {en.name} </Label>
                <Input type="text" id="name" placeholder="Name" value={filter.name} name="name" onChange={handleFilterChange} />
              </div>
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="Slug"> {en.slug} </Label>
                <Input type="text" id="Slug" placeholder="Slug" value={filter.slug} name="slug" onChange={handleFilterChange} />
              </div>

              <div className="flex flex-col gap-2 w-60">
                <Label htmlFor="sort"> {en.slug} </Label>
                <SortDropDown
                  id="sort"
                  sortColumnOptions={SortColumns}
                  columnValue={sorter.sortColumn}
                  orderValue={sorter.sortOrder}
                  onSorterChange ={handleSorterChange}
                />
              </div>

            </div>
            
            <div className="flex flex-row gap-2">
              <Button size={"default"} type="button" onClick={handleSearch}> <Search /> {en.apply_filters} </Button>
              <Button size={"default"} type="button" onClick={handleReset}> <RotateCcw /> {en.reset_filters} </Button>
              <Button size={"default"} type="button" onClick={() => setIsAddNewModalOpen(true)}> <CirclePlus /> {en.add_new} </Button>
            </div>
          </form>
        </div>

        <TableWithPagination 
          ref={tableRef}
          columns={getColumns({
            onEdit: onEdit,
            onDelete: onDelete,
            toggleActiveStatus: toggleActiveStatus,
            paginator:paginator
          })}
          data={categories} 
          isLoading={isLoading}
          totalRecords={totalRecords} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>

      <AddNewModal isModalOpen={isAddNewModalOpen} onOpenChange={setIsAddNewModalOpen} />
      <EditModal isModalOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} selectedCategory={selectedCategory} />
    </div>
  );
}
