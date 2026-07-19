'use client'

import { Item, ItemContent, ItemTitle, ItemDescription, ItemMedia, ItemActions } from "@/components/ui/item"
import { Button } from "@/components/ui/button"
import { X, Shirt } from "lucide-react"
import { CollectionProductSchema } from "@/schemas/admin-schemas"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { removeProductFromCollection } from "@/app/(admin)/admin/collections/actions"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"
import GenderIndicator from "./GenderIndicator"
import AgeGroupIndicator from "./AgeGroupIndicator"

interface Props {
  product: CollectionProductSchema
  collectionId: string
}

export default function CollectionItem(props : Props) {
  const queryClient = useQueryClient()

  const primaryImage = props.product.productImages.find((img) => img.isPrimary) ?? props.product.productImages[0]

  // React query to remove a product from a collection
  const { mutate: removeProduct, isPending } = useMutation({
    mutationFn: () => removeProductFromCollection(props.collectionId, props.product.id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["collectionProducts", props.collectionId] })
        toast.success(en.product_removed_from_collection)
      } else {
        toast.error(response.error || en.failed_to_remove_product_from_collection)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_remove_product_from_collection)
    },
  })

  return (
    <Item variant="outline" size="sm">

      {/* Show product image */}
      <ItemMedia variant="image">
        {primaryImage ? (
          <img
            src={primaryImage.imageUrl}
            alt={props.product.name}
            className="size-10 rounded-sm object-cover"
          />
        ) : (
          // fallback image
          <div className="flex size-10 items-center justify-center rounded-sm bg-muted">
            <Shirt className="size-4 text-muted-foreground" />
          </div>
        )}
      </ItemMedia>

      {/* Product content */}
      <ItemContent>
        <ItemTitle>{props.product.name}</ItemTitle>
        <ItemDescription className="flex flex-wrap items-center gap-1.5">
          <span>{props.product.category.name}</span>
          <GenderIndicator gender={props.product.gender} className="text-[10px]" />
          <AgeGroupIndicator ageGroup={props.product.ageGroup} className="text-[10px]" />
        </ItemDescription>
      </ItemContent>

      {/* remove button */}
      <ItemActions>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => removeProduct()}
          disabled={isPending}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="size-3.5" />
        </Button>
      </ItemActions>
    </Item>
  )
}
