'use client'

import { ColorFilter } from "@/types/filter-types";
import { Paginator } from "@/types/table-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createColor, deleteColor, getColors, updateColor } from "./action";
import { ColorSchema } from "@/schemas/admin-schemas";
import toast from "react-hot-toast";
import { en } from "@/lib/i18n/en";

export const colorKeys = {
  all: ['colors'] as const,
  list: (paginator: Paginator, filter: ColorFilter) =>
    ['colors', 'list', { paginator, filter }] as const,
}

export function useGetColors(paginator: Paginator, filter: ColorFilter) {
  return useQuery({
    queryKey: colorKeys.list(paginator, filter),
    queryFn: () => getColors(paginator, filter),
    placeholderData: (previousData) => previousData,
  })
}

export function useCreateColor(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ColorSchema) => createColor(data),
    onSuccess: (response) => {
      if(response.success) {
        console.log("####################")
        queryClient.invalidateQueries({ queryKey: colorKeys.all })
        //toast.success(en.color_created_successfully)
        onSuccess?.()
      } else {
        console.log("####################")
        //toast.error(response.error || en.failed_to_create_color)
      }
    },
    onError: (error: Error) => {
      console.log("####################")
      toast.error(error.message || en.failed_to_create_color)
    },
  })
}

export function useUpdateColor(onSuccess?: () => void) {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ColorSchema }) => updateColor(id, data),
    onSuccess: (response) => {
      if(response.success) {
        queryClient.invalidateQueries({ queryKey: colorKeys.all })
        toast.success(en.color_updated_successfully)
        onSuccess?.()
      } else {
        toast.error(response.error || en.color_update_failed)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.color_update_failed)
    },
  })
}

export function useDeleteColor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteColor(id),
    onSuccess: (response) => {
      if(response.success) {
        queryClient.invalidateQueries({ queryKey: colorKeys.all})
        toast.success(response.message || en.color_deleted_successfully)
      } else {
        toast.error(response.error || en.failed_to_delete_color)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_delete_color)
    },
  })
}