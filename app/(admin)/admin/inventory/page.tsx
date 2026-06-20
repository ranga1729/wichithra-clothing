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
import { getInventory, deleteInventoryItem, getColorSelectorData, getProductSelectorData } from "./actions";
import { ClothingSize } from "@/generated/prisma/enums";
import { getColumns } from "./columns";
import { useRouter } from "next/navigation";
import AddNewButton from "@/components/AddNewButton";
import { InventorySchema } from "@/schemas/admin-schemas";
import SearchableSelect from "@/components/custom/general/SearchableSelect";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialFilter: InventoryFilter = {
  productId: "",
  sku: "",
  colorId: "",
  size: "",
};

export default function InventoryPage() {
  const tableRef = useRef<TableWithPaginationRef>(null);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [paginator, setPaginator] = useState<Paginator>(initialPaginator);
  const [filter, setFilter] = useState<InventoryFilter>(initialFilter);

  const debouncedFilter = useDebounce(filter, 500);

  const { data: products } = useQuery({
    queryKey: ["productSelector"],
    queryFn: async () => {
      const res = await getProductSelectorData()
      if (!res.success) toast.error(res.error ?? en.data_retrieval_failed)
      return res.data ?? []
    },
  })

  const { data: colors } = useQuery({
    queryKey: ["colorSelector"],
    queryFn: async () => {
      const res = await getColorSelectorData()
      if (!res.success) toast.error(res.error ?? en.data_retrieval_failed)
      return res.data ?? []
    },
  })

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
      <form className="flex flex-col gap-3 border py-3 px-2 rounded-md dark:border dark:border-neutral-600">
        <div className="flex flex-row flex-wrap justify-start items-end gap-3 w-full">
          <div className="w-60 max-w-sm">
            <SearchableSelect
              items={(products as any[]) ?? []}
              itemToStringValue={(p: any) => p?.name ?? ""}
              value={((products as any[]) ?? []).find((p: any) => p.id === filter.productId) ?? null}
              onValueChange={(item: any) => setFilter((prev) => ({ ...prev, productId: item?.id ?? "" }))}
              label={en.name}
              placeholder="All products"
              emptyMessage="No products found."
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
          <div className="w-60 max-w-sm">
            <SearchableSelect
              items={(colors as any[]) ?? []}
              itemToStringValue={(c: any) => c?.name ?? ""}
              value={((colors as any[]) ?? []).find((c: any) => c.id === filter.colorId) ?? null}
              onValueChange={(item: any) => setFilter((prev) => ({ ...prev, colorId: item?.id ?? "" }))}
              label="Color"
              placeholder="All colors"
              emptyMessage="No colors found."
              renderItem={(color: any) => (
                <span className="flex items-center gap-2">
                  {color.hexCode && (
                    <span
                      className="h-3 w-3 shrink-0 rounded-full border border-neutral-400"
                      style={{ backgroundColor: `#${color.hexCode}` }}
                    />
                  )}
                  {color.name}
                </span>
              )}
            />
          </div>
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label>Size</Label>
            <Select
              value={filter.size || "__all__"}
              onValueChange={(val) =>
                setFilter((prev) => ({ ...prev, size: val === "__all__" ? "" : val }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All sizes" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__all__">All sizes</SelectItem>
                  {Object.values(ClothingSize).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-row items-center justify-start">
          <ResetFilterButton onClick={handleReset} />
        </div>
      </form>

      <div className="flex flex-row items-center justify-end">
        <AddNewButton onClick={() => router.push("/admin/inventory/add-new")} />
      </div>

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
