'use client'

import { useEffect, useCallback, useImperativeHandle, forwardRef, useState } from "react";
import type { Paginator } from "@/types/table-types";
import { DataTable } from "./data-table";
import TablePaginator from "./paginator";

interface TableWithPaginationProps {
  columns: any[];
  data: any[];
  isLoading?: boolean;
  totalRecords: number;
  initialPageSize?: number;
  onPaginationChange: (paginator: Paginator) => void;
  loadingComponent?: React.ReactNode;
  className?: string;
}

// Methods that parent can call on the table
export interface TableWithPaginationRef {
  getPaginator: () => Paginator;
  setPaginator: (paginator: Paginator | ((prev: Paginator) => Paginator)) => void;
  resetPagination: () => void;
  goToFirstPage: () => void;
  goToLastPage: () => void;
  goToPage: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
}

const TableWithPagination = forwardRef<TableWithPaginationRef, TableWithPaginationProps>(({
  columns,
  data,
  isLoading = false,
  totalRecords,
  initialPageSize = 10,
  onPaginationChange,
  loadingComponent,
  className = ""
}, ref) => {
  
  const [paginator, setPaginatorState] = useState<Paginator>({
    pageSize: initialPageSize,
    pageIndex: 0,
    totalRecords: totalRecords,
  });

  // Update total records when prop changes
  useEffect(() => {
    setPaginatorState(prev => ({
      ...prev,
      totalRecords: totalRecords
    }));
  }, [totalRecords]);

  // Enhanced setPaginator that handles page size changes properly
  const setPaginator = useCallback((newPaginator: Paginator | ((prev: Paginator) => Paginator)) => {
    setPaginatorState(prev => {
      const updated = typeof newPaginator === 'function' ? newPaginator(prev) : newPaginator;
      
      // If page size changed, adjust page index to stay within bounds
      if (updated.pageSize !== prev.pageSize) {
        const totalPages = Math.ceil(updated.totalRecords! / updated.pageSize);
        const maxPageIndex = Math.max(0, totalPages - 1);
        
        if (updated.pageIndex > maxPageIndex) {
          updated.pageIndex = maxPageIndex;
        }
      }
      
      return updated;
    });
  }, []);

  // Notify parent when pagination changes
  useEffect(() => {
    onPaginationChange(paginator);
  }, [paginator, onPaginationChange]);

  // Expose methods to parent component
  useImperativeHandle(ref, () => ({
    getPaginator: () => paginator,
    
    setPaginator,
    
    resetPagination: () => {
      setPaginator(prev => ({ ...prev, pageIndex: 0 }));
    },
    
    goToFirstPage: () => {
      setPaginator(prev => ({ ...prev, pageIndex: 0 }));
    },
    
    goToLastPage: () => {
      setPaginator(prev => {
        const totalPages = Math.ceil(prev.totalRecords! / prev.pageSize);
        return { ...prev, pageIndex: Math.max(0, totalPages - 1) };
      });
    },
    
    goToPage: (pageIndex: number) => {
      setPaginator(prev => {
        const totalPages = Math.ceil(prev.totalRecords! / prev.pageSize);
        const validPageIndex = Math.max(0, Math.min(pageIndex, totalPages - 1));
        return { ...prev, pageIndex: validPageIndex };
      });
    },
    
    setPageSize: (pageSize: number) => {
      setPaginator(prev => ({ ...prev, pageSize }));
    }
  }), [paginator, setPaginator]);

  // Default loading component
  const DefaultLoadingComponent = () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-b-full h-8 w-8 border-b-2 border-gray-900"></div>
      <span className="ml-2">Loading...</span>
    </div>
  );

  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />;
  }

  return (
    <div className={`w-full flex flex-col ${className}`}>
      <h1 className="text-gray-500 font-semibold text-sm">Total Records : {paginator.totalRecords}</h1>
      <DataTable columns={columns} data={data} />
      <TablePaginator 
        paginatorState={paginator} 
        PaginatorSetter={setPaginator}
      />
    </div>
  );
});

TableWithPagination.displayName = 'TableWithPagination';

export default TableWithPagination;