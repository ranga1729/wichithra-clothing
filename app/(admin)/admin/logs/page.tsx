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
import { initialPaginator, Paginator } from "@/types/table-types"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { getColumns } from "./columns"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { getAuditLogs } from "./actions"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { type DateRange } from "react-day-picker"
import { AuditLogFilter } from "@/schemas/admin-schemas"
import { AUDITLOGS_ACTION_OPTIONS } from "@/lib/utils"

const initialFilter: AuditLogFilter = {
  userName: "",
  action: "",
  dateFrom: "",
  dateTo: "",
}

export default function LogsPage() {
  const tableRef = useRef<TableWithPaginationRef>(null)
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<AuditLogFilter>(initialFilter)
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
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : "",
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : "",
    }))
    setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const handleReset = () => {
    setFilter(initialFilter)
    setDateRange(undefined)
    setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
  }

  const { data, isPending, error, isError } = useQuery({
    queryKey: ["audit-logs", "list",
      {
        pageSize: paginator.pageSize,
        pageIndex: paginator.pageIndex,
        filter: debouncedFilter,
      },
    ],
    queryFn: async () => {
      const response = await getAuditLogs(paginator, debouncedFilter)
      if (!response.success) {
        toast.error(response.error || en.failed_to_fetch_data)
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

      {/* Page header */}
      <Item variant="muted">
        <ItemContent>
          <ItemTitle className="text-2xl">System Logs</ItemTitle>
          <ItemDescription className="whitespace-normal line-clamp-none">
            Audit trail of all system mutations including creates, updates, and deletes performed by administrators.
          </ItemDescription>
        </ItemContent>
      </Item>

      <form className="flex flex-col gap-3 border py-3 px-2 rounded-md dark:border dark:border-neutral-600">
        <FieldGroup className="flex flex-row flex-wrap justify-start items-end gap-3 w-full">

          {/* User Name */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel htmlFor="userName">User Name</FieldLabel>
            <Input
              type="text"
              id="userName"
              name="userName"
              placeholder="First or last name"
              value={filter.userName}
              onChange={handleFilterChange}
            />
          </Field>

          {/* Action Filter */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel>Action</FieldLabel>
            <Select
              value={filter.action || "__all__"}
              onValueChange={(val) => {
                setFilter((prev) => ({
                  ...prev,
                  action: val === "__all__" ? "" : val,
                }))
                setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__all__">All actions</SelectItem>
                  {AUDITLOGS_ACTION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {/* Date Range */}
          <Field className="grid items-center gap-2 w-60 max-w-sm">
            <FieldLabel>Date Range</FieldLabel>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date-picker-range"
                  className="justify-start font-normal px-2.5 bg-transparent dark:border dark:border-neutral-600"
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

        </FieldGroup>

        <div className="flex flex-row items-center justify-start">
          <ResetFilterButton onClick={handleReset} />
        </div>
      </form>

      <TableWithPagination
        ref={tableRef}
        columns={getColumns({ paginator })}
        data={data?.logs ?? []}
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0}
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />
    </div>
  )
}
