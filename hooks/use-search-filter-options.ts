"use client"

import { useQuery } from "@tanstack/react-query"
import { getSearchFilterOptions } from "@/app/(shop)/search/actions"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"

export function useSearchFilterOptions() {
  return useQuery({
    queryKey: ["searchFilterOptions"],
    queryFn: async () => {
      const response = await getSearchFilterOptions()
      if (!response.success || !response.data) {
        toast.error(response.error ?? en.failed_to_load_filter_options)
        return null
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}
