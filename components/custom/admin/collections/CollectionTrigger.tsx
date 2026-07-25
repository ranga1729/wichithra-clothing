'use client'

import { ChevronDownIcon, Plus, Trash2 } from "lucide-react"
import { Accordion as AccordionPrimitive } from "radix-ui"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { CollectionSchema } from "@/schemas/admin-schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toggleCollectionActiveStatus, deleteCollection } from "@/app/(admin)/admin/collections/actions"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"
import DeleteConfitmationModal from "@/app/(admin)/admin/collections/DeleteConfirmation"

interface Props {
  collection: CollectionSchema
  onAddProduct: (collectionId: string) => void
}

export default function CollectionTrigger(props:Props) {
  const queryClient = useQueryClient()

  // React query to toggle the active status
  const { mutate: toggleActive, isPending: isToggling } = useMutation({
    mutationFn: () => toggleCollectionActiveStatus(props.collection.id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["collections"] })
        toast.success(en.active_status_toggled)
      } else {
        toast.error(response.error || en.failed_to_toggle_collection_active_status)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_toggle_collection_active_status)
    },
  })

  // react query to delete a collection
  const { mutate: deleteMutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteCollection(props.collection.id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["collections"] })
        toast.success(en.collection_deleted_successfully)
      } else {
        toast.error(response.error || en.failed_to_delete_collection)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_delete_collection)
    },
  })

  const isProcessing = isToggling || isDeleting

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger className="flex flex-1 items-center justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180 data-[state=open]:border-b data-[state=open]:pb-4 group">
        <div className="flex flex-col gap-1">

          {/* Title of the collection */}
          <div className="flex items-center gap-2 group-hover:underline">
            {props.collection.name}

            {/* Active status Indicator */}
            {!props.collection.isActive && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium border border-destructive text-destructive no-underline inline-block">
                Inactive
              </span>
            )}
          </div>
          
          {/* Description of the collection */}
          {props.collection.description && (
            <span className="text-[12px] font-normal text-muted-foreground line-clamp-1">
              {props.collection.description}
            </span>
          )}
        </div>

        {/* Arrow-down */}
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>

      {/* Trigger's action center */}
      <div className="flex items-center gap-1 py-4 pl-2">
        {/* active status toggler */}
        <Switch
          size="sm"
          checked={props.collection.isActive}
          onCheckedChange={() => toggleActive()}
          disabled={isProcessing}
          className="data-[state=checked]:bg-green-500"
        />

        {/* Triiger add new modal */}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => props.onAddProduct(props.collection.id)}
          disabled={isProcessing}
          className="text-muted-foreground hover:text-foreground"
        >
          <Plus className="size-3.5" />
        </Button>

        <DeleteConfitmationModal deleteMutate={deleteMutate} isProcessing={isProcessing} />
      </div>
    </AccordionPrimitive.Header>
  )
}
