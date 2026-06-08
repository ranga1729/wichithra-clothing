'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination";
import ResetFilterButton from "@/components/ResetFilterButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDebounce } from "@/hooks/useDebounce";
import { en } from "@/lib/i18n/en";
import { InventoryFilter } from "@/types/filter-types";
import { initialPaginator, Paginator } from "@/types/table-types";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getInventory, deleteInventoryItem } from "./actions";
import { getColumns } from "./columns";
import { useRouter } from "next/navigation";
import AddNewButton from "@/components/AddNewButton";
import { InventorySchema } from "@/schemas/admin-schemas";

const initialFilter: InventoryFilter = {
  productName: "",
  sku: "",
};

export default function InventoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

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

  const onEdit = (inventory: InventorySchema) => {
    router.push(`/admin/inventory/${inventory.variant.id}`);
  };

  const { mutate: onDelete } = useMutation({
    mutationFn: (inventory: InventorySchema) => deleteInventoryItem(inventory.variant.id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(en.inventory_item_deleted_successfully);
        queryClient.invalidateQueries({ queryKey: ["inventory"] });
      } else {
        toast.error(res.error || en.failed_to_delete_inventory_item);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_delete_inventory_item);
    },
  });

  const { data, isPending, error, isError } = useQuery({
    queryKey: ['inventory', 'list',
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
          <AddNewButton onClick={() => router.push("/admin/inventory/add-new")} />
        </div>
      </form>

      <TableWithPagination
        ref={tableRef}
        columns={getColumns({
          paginator,
          onEdit,
          onDelete,
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
