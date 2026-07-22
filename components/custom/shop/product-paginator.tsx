'use client'

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination"

interface Props {
  pageIndex: number
  totalRecords: number
  pageSize: number
  onPageChange: (page: number) => void
}

export default function ProductPaginator({ pageIndex, totalRecords, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(totalRecords / pageSize)

  if (totalPages <= 1) return null

  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      pages.push(0)
      const start = Math.max(1, pageIndex - 1)
      const end = Math.min(totalPages - 2, pageIndex + 1)

      if (start > 1) pages.push("ellipsis")
      for (let i = start; i <= end; i++) pages.push(i)
      if (end < totalPages - 2) pages.push("ellipsis")

      pages.push(totalPages - 1)
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (pageIndex > 0) onPageChange(pageIndex - 1)
            }}
            aria-disabled={pageIndex === 0}
            className={pageIndex === 0 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pageNumbers.map((page, idx) =>
          page === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${idx}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={page}>
              <PaginationLink
                href="#"
                isActive={page === pageIndex}
                onClick={(e) => {
                  e.preventDefault()
                  onPageChange(page)
                }}
              >
                {page + 1}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (pageIndex < totalPages - 1) onPageChange(pageIndex + 1)
            }}
            aria-disabled={pageIndex >= totalPages - 1}
            className={pageIndex >= totalPages - 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
