'use client'

import { CollectionProductSchema } from "@/schemas/admin-schemas"
import { getCollectionProducts } from "./actions"
import { useQuery } from "@tanstack/react-query"
import { en } from "@/lib/i18n/en"
import { ListX } from "lucide-react"
import CollectionItem from "@/components/custom/admin/collections/CollectionItem"

interface Props {
  collectionId: string
}
export default function CollectionContent(props : Props) {

  // React query to fetch products of a certain collection
  const { data: products, isPending } = useQuery({
    queryKey: ["collectionProducts", props.collectionId],
    queryFn: async () => {
      const response = await getCollectionProducts(props.collectionId)
      if (!response.success) {
        throw new Error(response.error || en.failed_to_load_collection_products)
      }
      return response.data as CollectionProductSchema[]
    },
  })

  // Loading animation
  if (isPending) {
    return (
      <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
        {en.loading}
      </div>
    )
  }

  // empty collection indicator
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <ListX className="size-8" />
        <span className="font-semibold">
        {en.no_products_in_collection}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {products.map((product) => (
        
        // Render products in the collection
        <CollectionItem
          key={product.id}
          product={product}
          collectionId={props.collectionId}
        />
      ))}
    </div>
  )
}
