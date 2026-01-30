'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import { useEffect, useRef, useState } from "react";
import { getColumns } from "./columns";
import { DropDownOptions, Paginator, Sorter } from "@/types/table-types";
import { Design } from "@/types/common-types";
import toast from "react-hot-toast";
import { deleteDesign, getDesign } from "./action";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CirclePlus, RotateCcw, Search } from "lucide-react";
import SortDropDown from "@/components/custom/general/SortDropDown";
import { DesignFilter } from "@/types/filter-types";
import AddNewModal from "./addNewModal";
import EditModal from "./editModal";

const InitialSorter:Sorter = {
  sortColumn: "name",
  sortOrder: "asc",
}
const InitiaFilter:DesignFilter = {
 name : "",
 slug : "",
}

const SortColumns: DropDownOptions[] = [
  { name: "Name", value: "name"},
  { name: "Slug", value: "slug"},
]

export default function DesignPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginator, setPaginator] = useState<Paginator>({
    pageSize: 10,
    pageIndex: 0,
    totalRecords: 0,
  })
  const [sorter, setSorter] = useState<Sorter>(InitialSorter);
  const [filter, setFilter] = useState<DesignFilter>(InitiaFilter);
  const [isAddNewModalOpen, setIsAddNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState<Design>();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getDesign(paginator, filter, sorter);

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        setDesigns(response.data.categories)
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

  const onEdit = (design:Design) => {
    setSelectedDesign(design)
    setIsEditModalOpen(true);
  }

  const onDelete = async (design:Design) => {
    try {
      const response = await deleteDesign(design.id);

      if(!response.success && response.error) {
        toast.error(response.error);
      }
      
      if(response.success) {
        fetchData();
        toast.success(response.message || "Design deleted successfully")
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
                <Label htmlFor="name">Name</Label>
                <Input type="text" id="name" placeholder="Name" value={filter.name} name="name" onChange={handleFilterChange} />
              </div>
              <div className="grid w-60 max-w-sm items-center gap-2">
                <Label htmlFor="Slug">Slug</Label>
                <Input type="text" id="Slug" placeholder="Slug" value={filter.slug} name="slug" onChange={handleFilterChange} />
              </div>

              <div className="flex flex-col gap-2 w-60">
                <Label htmlFor="sort">Sort</Label>
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
              <Button size={"default"} type="button" onClick={handleSearch}> <Search /> Apply Filter</Button>
              <Button size={"default"} type="button" onClick={handleReset}> <RotateCcw /> Reset Filter</Button>
              <Button size={"default"} type="button" onClick={() => setIsAddNewModalOpen(true)}> <CirclePlus /> Create New</Button>
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
          data={designs} 
          isLoading={isLoading}
          totalRecords={totalRecords} 
          initialPageSize={10}
          onPaginationChange={setPaginator}
        />
      </div>

      <AddNewModal isModalOpen={isAddNewModalOpen} onOpenChange={setIsAddNewModalOpen} />
      <EditModal isModalOpen={isEditModalOpen} onOpenChange={setIsEditModalOpen} selectedDesign={selectedDesign} />
    </div>
  );
}
