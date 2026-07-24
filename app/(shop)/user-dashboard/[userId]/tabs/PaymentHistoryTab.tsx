"use client"

import { useQuery } from "@tanstack/react-query"
import { CreditCard } from "lucide-react"

import { getPaymentHistory } from "../actions"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Props {
  userId: string
}

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  COMPLETED: "bg-green-100 text-green-800 border-green-200",
  FAILED: "bg-red-100 text-red-800 border-red-200",
  REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
  PARTIALLY_REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
}

export default function PaymentHistoryTab({ userId }: Props) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["paymentHistory", userId],
    queryFn: () => getPaymentHistory(userId),
  })

  const payments = data?.success ? data.data : []

  if (isLoading) return <PaymentHistorySkeleton />
  if (isError) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Failed to load payment history.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  if (!payments || payments.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <CreditCard className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No payment records found.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment ID</TableHead>
              <TableHead>Order #</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment: Record<string, unknown>) => {
              const paymentId = payment.id as string
              const amount = payment.amount as number
              const method = payment.method as string | null
              const status = payment.status as string
              const paidAt = payment.paidAt as string | null
              const createdAt = payment.createdAt as string
              const order = payment.order as { id: string; status: string; orderNumber: string } | null
              const displayDate = paidAt || createdAt

              return (
                <TableRow key={paymentId}>
                  <TableCell className="font-mono text-xs">{paymentId.slice(-8)}</TableCell>
                  <TableCell className="font-mono text-xs">{order?.orderNumber?.slice(-8) ?? paymentId.slice(-8)}</TableCell>
                  <TableCell>LKR {Number(amount).toLocaleString()}</TableCell>
                  <TableCell>{method ?? "\u2014"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800 border-gray-200"}`}>
                      {status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(displayDate).toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" })}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function PaymentHistorySkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: 6 }).map((_, i) => (
                <TableHead key={i}><Skeleton className="h-4 w-16" /></TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}><Skeleton className="h-4 w-20" /></TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
