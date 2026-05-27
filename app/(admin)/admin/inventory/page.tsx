'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import ResetFilterButton from "@/components/ResetFilterButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { en } from "@/lib/i18n/en";
import { SimpleInventorySchema } from "@/schemas/admin-schemas";
import { InventoryFilter } from "@/types/filter-types";
import { initialPaginator, Paginator } from "@/types/table-types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getInventory } from "./actions";
import { getColumns } from "./columns";

const initialFilter: InventoryFilter = {
  productName: "",
  sku: "",
};

export default function InventoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);

  const [paginator, setPaginator] = useState<Paginator>(initialPaginator);
  const [filter, setFilter] = useState<InventoryFilter>(initialFilter);

  const debouncedFilter = useDebounce(filter, 500);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilter(initialFilter);
    setPaginator((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const { data, isPending, error, isError } = useQuery({
    queryKey: [
      'inventory',
      'list',
      {
        pageSize: paginator.pageSize,
        pageIndex: paginator.pageIndex,
        filter: debouncedFilter,
      },
    ],
    queryFn: async () => {
      const response = await getInventory(paginator, debouncedFilter);
      if (!response.success) {
        throw new Error(response.error || en.inventory_data_retrieval_failed);
      }
      return response.data;
    },
    placeholderData: (prevData) => prevData,
  });

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [error, isError]);

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-col gap-3">
        <div className="flex flex-row justify-start items-center gap-3 w-full border py-3 px-2 rounded-md">
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="productName">{en.name}</Label>
            <Input
              type="text"
              id="productName"
              placeholder="Product name"
              value={filter.productName}
              name="productName"
              onChange={handleFilterChange}
            />
          </div>
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              type="text"
              id="sku"
              placeholder="SKU"
              value={filter.sku}
              name="sku"
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <ResetFilterButton onClick={handleReset} />
        </div>
      </form>

      <TableWithPagination
        ref={tableRef}
        columns={getColumns({
          paginator,
        })}
        data={data?.inventory ?? []}
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0}
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />
    </div>
  );
}
