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
import { PAYMENT_METHOD_OPTIONS } from "@/lib/data-objects"
import { initialPaginator, Paginator } from "@/types/table-types"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useEffect, useRef, useState, useCallback } from "react"
import toast from "react-hot-toast"
import { type DateRange } from "react-day-picker"
import { getColumns } from "./columns"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { getPayments, cancelOrderAndRefund, refundOnly } from "./actions"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { PaymentFilter } from "@/schemas/admin-schemas"
import { CancelOrderModal } from "@/components/custom/admin/cancel-order-modal"
import { RefundPaymentModal } from "@/components/custom/admin/refund-payment-modal"

const initialFilter: PaymentFilter = {
  search: "",
  paymentMethod: "",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
}

export default function PaymentsPage() {
  const queryClient = useQueryClient()
  const tableRef = useRef<TableWithPaginationRef>(null)
  const [paginator, setPaginator] = useState<Paginator>(initialPaginator)
  const [filter, setFilter] = useState<PaymentFilter>(initialFilter)
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null)
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null)

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
    queryKey: ["payments", "list",
      {
        pageSize: paginator.pageSize,
        pageIndex: paginator.pageIndex,
        filter: debouncedFilter,
      },
    ],
    queryFn: async () => {
      const response = await getPayments(paginator, debouncedFilter)
      if (!response.success) {
        throw new Error(response.error || en.failed_to_load_payments)
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

  const invalidateQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["payments"] })
  }, [queryClient])

  const cancelAndRefundMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      cancelOrderAndRefund(paymentId, reason),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || en.order_cancelled_and_refunded)
        invalidateQueries()
        setCancelOrderId(null)
      } else {
        toast.error(response.error || en.failed_to_cancel_order_and_refund)
      }
    },
    onError: (error) => {
      toast.error(error.message || en.failed_to_cancel_order_and_refund)
    },
  })

  const refundOnlyMutation = useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) =>
      refundOnly(paymentId, reason),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || en.payment_refunded_successfully)
        invalidateQueries()
        setRefundPaymentId(null)
      } else {
        toast.error(response.error || en.failed_to_refund_payment)
      }
    },
    onError: (error) => {
      toast.error(error.message || en.failed_to_refund_payment)
    },
  })

  return (
    <div className="flex flex-col gap-3">

      {/* Page header */}
      <Item variant="muted">
        <ItemContent>
          <ItemTitle className="text-2xl">Payments</ItemTitle>
          <ItemDescription className="whitespace-normal line-clamp-none">
            View and manage all payment transactions. Refund payments or cancel orders with refunds.
          </ItemDescription>
        </ItemContent>
      </Item>

      <form className="flex flex-col gap-3 border py-3 px-2 rounded-md dark:border dark:border-neutral-600">
        <FieldGroup className="flex flex-row flex-wrap justify-start items-end gap-3 w-full">

          {/* Search by Order Number or Customer Name */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel htmlFor="search">Search</FieldLabel>
            <Input
              type="text"
              id="search"
              name="search"
              placeholder="Order number or customer name"
              value={filter.search}
              onChange={handleFilterChange}
            />
          </Field>

          {/* Payment Method Filter */}
          <Field className="grid w-60 max-w-sm items-center gap-2">
            <FieldLabel>Payment Method</FieldLabel>
            <Select
              value={filter.paymentMethod || "__all__"}
              onValueChange={(val) => {
                setFilter((prev) => ({
                  ...prev,
                  paymentMethod: val === "__all__" ? "" : val,
                }))
                setPaginator((prev) => ({ ...prev, pageIndex: 0 }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="__all__">All methods</SelectItem>
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
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

          {/* Min Amount */}
          <Field className="grid w-40 max-w-sm items-center gap-2">
            <FieldLabel htmlFor="minAmount">Min Amount</FieldLabel>
            <Input
              type="number"
              id="minAmount"
              name="minAmount"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={filter.minAmount}
              onChange={handleFilterChange}
            />
          </Field>

          {/* Max Amount */}
          <Field className="grid w-40 max-w-sm items-center gap-2">
            <FieldLabel htmlFor="maxAmount">Max Amount</FieldLabel>
            <Input
              type="number"
              id="maxAmount"
              name="maxAmount"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={filter.maxAmount}
              onChange={handleFilterChange}
            />
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
          onCancelOrderAndRefund: (id) => setCancelOrderId(id),
          onRefundOnly: (id) => setRefundPaymentId(id),
        })}
        data={data?.payments ?? []}
        isLoading={isPending}
        totalRecords={data?.totalRecords ?? 0}
        initialPageSize={10}
        onPaginationChange={setPaginator}
      />

      {/* Cancel Order & Refund Modal */}
      <CancelOrderModal
        open={!!cancelOrderId}
        onOpenChange={(open) => {
          if (!open) setCancelOrderId(null)
        }}
        onConfirm={(reason) => {
          if (cancelOrderId) {
            cancelAndRefundMutation.mutate({ paymentId: cancelOrderId, reason })
          }
        }}
        isLoading={cancelAndRefundMutation.isPending}
      />

      {/* Refund Only Modal */}
      <RefundPaymentModal
        open={!!refundPaymentId}
        onOpenChange={(open) => {
          if (!open) setRefundPaymentId(null)
        }}
        onConfirm={(reason) => {
          if (refundPaymentId) {
            refundOnlyMutation.mutate({ paymentId: refundPaymentId, reason })
          }
        }}
        isLoading={refundOnlyMutation.isPending}
      />
    </div>
  )
}
