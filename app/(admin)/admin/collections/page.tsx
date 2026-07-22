'use client'

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import AddNewButton from "@/components/AddNewButton"
import { Accordion, AccordionItem, AccordionContent } from "@/components/ui/accordion"
import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item"
import { getCollections } from "@/app/(admin)/admin/collections/actions"
import { CollectionSchema } from "@/schemas/admin-schemas"
import { en } from "@/lib/i18n/en"
import { ListX } from "lucide-react"
import CollectionTrigger from "@/components/custom/admin/collections/CollectionTrigger"
import CreateCollectionModal from "@/app/(admin)/admin/collections/CreateCollectionModal"
import AddProductModal from "@/app/(admin)/admin/collections/AddProductModal"
import CollectionContent from "./CollectionContent"

export default function CollectionsManagement() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [addProductCollectionId, setAddProductCollectionId] = useState<string | null>(null)
  const [openItems, setOpenItems] = useState<string[]>([])

  // React query to fetch all collections
  const { data: collections, isPending } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const response = await getCollections()
      if (!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data)
      }
      return response.data as CollectionSchema[]
    },
  })

  return (
    <div className="flex flex-col gap-3">

      {/* Page header */}
      <Item variant="muted">
        <ItemContent>
          <ItemTitle className="text-2xl">Collections</ItemTitle>
          <ItemDescription>
            Organize your inventory by creating themed collections and grouping related products for the storefront.
          </ItemDescription>
        </ItemContent>
      </Item>

      {/* AddNewButton */}
      <div className="flex flex-row justify-end items-center">
        <AddNewButton onClick={() => setIsCreateModalOpen(true)} />
      </div>

      {/* Collection accordian */}
      <div>

        {/* Palceholder - showed when no collections exists */}
        {isPending ? (
          <div className="flex items-center justify-center rounded-lg border py-8 text-sm text-muted-foreground">
            {en.loading}
          </div>
        ) : !collections || collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-5 rounded-lg border p-8 text-sm font-semibold text-muted-foreground">
            <ListX className="size-8" />
            No collections yet. Create your first collection to get started.
          </div>
        ) : (

          // showed when collections exists
          <Accordion
            type="multiple"
            value={openItems}
            onValueChange={setOpenItems}
            className="rounded-lg border"
          >
            {collections.map((collection) => (
              // Represent one collection
              <AccordionItem
                key={collection.id}
                value={collection.id}
                className="border-b px-4 last:border-b-0"
              >
                {/* Collection trigger */}
                <CollectionTrigger
                  collection={collection}
                  onAddProduct={(id) => setAddProductCollectionId(id)}
                />
                {/* body of the accordian item. shows products */}
                <AccordionContent className="pb-6">
                  <CollectionContent collectionId={collection.id} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <CreateCollectionModal
        isModalOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      />

      {addProductCollectionId && (
        <AddProductModal
          collectionId={addProductCollectionId}
          isModalOpen={!!addProductCollectionId}
          onOpenChange={(open) => {
            if (!open) setAddProductCollectionId(null)
          }}
        />
      )}
    </div>
  )
}
