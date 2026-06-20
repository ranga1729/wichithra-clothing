'use client'

import TableWithPagination from "@/components/custom/table/TableWithPagination";
import { initialPaginator, Paginator } from "@/types/table-types";
import { useEffect, useState } from "react";
import { getColumns } from "./columns";
import { getCustomers } from "./actions";
import { useQuery } from "@tanstack/react-query";
import { CustomerFilter } from "@/types/filter-types";
import ResetFilterButton from "@/components/ResetFilterButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { en } from "@/lib/i18n/en";
import toast from "react-hot-toast";
import { useDebounce } from "@/hooks/useDebounce";

const initialFilter: CustomerFilter = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export default function CustomersPage() {
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator);
  const [filter, setFilter] = useState<CustomerFilter>(initialFilter);

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
    queryKey: ["customers", "list",
      {
        pageSize: paginator.pageSize,
        pageIndex: paginator.pageIndex,
        filter: debouncedFilter,
      },
    ],
    queryFn: async () => {
      const response = await getCustomers(paginator, debouncedFilter);
      if (!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data);
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
        <div className="flex flex-row justify-start items-center gap-3 w-full">
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="name">Name</Label>
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
            <Label htmlFor="email">{en.email}</Label>
            <Input
              type="text"
              id="email"
              placeholder="Email"
              value={filter.email}
              name="email"
              onChange={handleFilterChange}
            />
          </div>
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="text"
              id="phone"
              placeholder="Phone number"
              value={filter.phone}
              name="phone"
              onChange={handleFilterChange}
            />
          </div>
          <div className="grid w-60 max-w-sm items-center gap-2">
            <Label htmlFor="address">Address</Label>
            <Input
              type="text"
              id="address"
              placeholder="City, province, address..."
              value={filter.address}
              name="address"
              onChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="flex flex-row items-center justify-between">
          <ResetFilterButton onClick={handleReset} />
        </div>
      </form>

      <TableWithPagination
        columns={getColumns({ paginator })}
        data={data?.customers ?? []}
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0}
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />
    </div>
  );
}
