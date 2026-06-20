'use client'

import TableWithPagination, { TableWithPaginationRef } from "@/components/custom/table/TableWithPagination"
import ResetFilterButton from "@/components/ResetFilterButton"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/useDebounce"
import { en } from "@/lib/i18n/en"
import { NewOrderFilter } from "@/types/filter-types"
import { initialPaginator, Paginator } from "@/types/table-types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { type DateRange } from "react-day-picker"
import toast from "react-hot-toast"
import { getNewOrders } from "./actions"
import { getColumns } from "./columns"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { PAYMENT_STATUS_OPTIONS } from "@/lib/data-objects"

const initialFilter: NewOrderFilter = {
  orderNumber: "",
  customerName: "",
  createdDateFrom: "",
  createdDateTo: "",
  paymentStatus: "",
}

export default function NewOrdersPage() {
  const router = useRouter()
  const tableRef = useRef<TableWithPaginationRef>(null)
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<NewOrderFilter>(initialFilter)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)

  const debouncedFilter = useDebounce(filter, 500)

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFilter((prev) => ({ ...prev, [name]: value }))
    setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    setFilter((prev) => ({
      ...prev,
      createdDateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      createdDateTo: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    }))
    setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleReset = () => {
    setFilter(initialFilter)
    setDateRange(undefined)
    setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["new-orders", "list",
      {
        pageSize: paginator.pageSize,
        pageIndex: paginator.pageIndex,
        filter: debouncedFilter,
      },
    ],
    queryFn: async () => {
      const response = await getNewOrders(paginator, debouncedFilter)
      if (!response.success) {
        throw new Error(response.error || en.failed_to_load_orders)
      }
      return response.data
    },
    placeholderData: (prevData) => prevData,
  })

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message)
    }
  }, [error, isError])

  return (
    <div className="flex flex-col gap-3">
      <form className="flex flex-col gap-3 border py-3 px-2 rounded-md dark:border dark:border-neutral-600">
        <FieldGroup className="flex flex-row flex-wrap justify-start items-end gap-3 w-full ">
          
          {/* Order Number */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel htmlFor="orderNumber">Order Number</FieldLabel>
            <Input
              type="text"
              id="orderNumber"
              name="orderNumber"
              placeholder="e.g. WC-20260001"
              value={filter.orderNumber}
              onChange={handleFilterChange}
            />
          </Field>

          {/* Customer Name */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel htmlFor="customerName">Customer Name</FieldLabel>
            <Input
              type="text"
              id="customerName"
              name="customerName"
              placeholder="First or last name"
              value={filter.customerName}
              onChange={handleFilterChange}
            />
          </Field>

          {/* Created Date Range */}
          <Field className="grid items-center gap-2 w-60 max-w-sm">
            <FieldLabel>Date</FieldLabel >
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-range"
                  className="justify-start px-2.5 bg-transparent font-normal dark:border dark:border-neutral-600"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "dd MMM yyyy")} &ndash;{" "}
                        {format(dateRange.to, "dd MMM yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateRangeSelect}
                  numberOfMonths={2}
                  className="bg-neutral-600"
                />
              </PopoverContent>
            </Popover>
          </Field>

          {/* Payment Status */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel>Payment Status</FieldLabel>
            <Select
              value={filter.paymentStatus || "__all__"}
              onValueChange={(val) => {
                setFilter((prev) => ({
                  ...prev,
                  paymentStatus: val === "__all__" ? "" : val,
                }))
                setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__all__">All statuses</SelectItem>
                  {PAYMENT_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </FieldGroup>

        <div className="flex flex-row items-center justify-start">
          <ResetFilterButton onClick={handleReset} />
        </div>
      </form>

      <TableWithPagination
        ref={tableRef}
        columns={getColumns({
          paginator: paginator,
          onView: (id) => router.push(`/admin/orders/new/${id}`),
          onMove: (id) => console.log(id),
          onCancel: (id) => console.log(id),
        })}
        data={data?.orders ?? []}
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0}
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />
    </div>
  )
}