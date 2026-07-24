import { AgeGroup, GenderTarget } from "@/generated/prisma/enums";
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

export const GetGenderBadgeStyle: Record<GenderTarget, { label: string; className: string }> = {
  MALE: { label: "Male", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  FEMALE: { label: "Female", className: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" },
  UNISEX: { label: "Unisex", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" },
  BOYS: { label: "Boys", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" },
  GIRLS: { label: "Girls", className: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" },
  KIDS: { label: "Kids", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
}

export const GetAgeGroupBadgeStyle: Record<AgeGroup, { label: string; className: string }> = {
  INFANT: { label: "Infant", className: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" },
  TODDLER: { label: "Toddler", className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" },
  KIDS: { label: "Kids", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" },
  TEEN: { label: "Teen", className: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  ADULT: { label: "Adult", className: "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300" },
}

export const AUDITLOGS_ACTION_BADGE_STYLES: Record<string, string> = {
  CREATE: "border-green-500 bg-green-100 text-green-800",
  UPDATE: "border-blue-500 bg-blue-100 text-blue-800",
  DELETE: "border-red-500 bg-red-100 text-red-800",
  LOGIN: "border-purple-500 bg-purple-100 text-purple-800",
}

export const AUDITLOGS_ACTION_OPTIONS = [
  { value: "CREATE", label: "Create" },
  { value: "UPDATE", label: "Update" },
  { value: "DELETE", label: "Delete" },
  { value: "LOGIN", label: "Login" },
]