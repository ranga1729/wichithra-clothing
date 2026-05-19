import { Paginator } from "@/types/table-types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTotalPages(paginator: Paginator): number {
  if (paginator.pageSize <= 0) return 0; // prevent division by zero
  if(paginator.totalRecords) {
    return Math.ceil(paginator.totalRecords / paginator.pageSize);
  }
  return 0;
}

export const formatLabel = (str:string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();