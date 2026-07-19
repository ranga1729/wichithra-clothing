'use client'

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Item, ItemContent, ItemTitle, ItemDescription, ItemMedia, ItemActions } from "@/components/ui/item"
import { getProductsForSelector, addProductToCollection } from "@/app/(admin)/admin/collections/actions"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"
import { Check, Search, SearchX, Shirt } from "lucide-react"
import { cn } from "@/lib/utils"
import SaveButton from "@/components/SaveButton"

interface Props {
  collectionId: string
  isModalOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function AddProductModal(props : Props) {
  const queryClient = useQueryClient()
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  // fetch currently available products
  const { data: products, isPending: isLoadingProducts } = useQuery({
    queryKey: ["productsForSelector"],
    queryFn: async () => {
      const response = await getProductsForSelector()
      if (!response.success) {
        throw new Error(response.error || en.failed_to_load_product_selector_data)
      }
      return response.data as Array<{
        id: string
        name: string
        slug: string
        category: { name: string }
        productImages: { imageUrl: string; isPrimary: boolean; sortOrder: number }[]
      }>
    },
    enabled: props.isModalOpen,
  })

  // add product into a collection
  const { mutate: addProduct, isPending: isAdding } = useMutation({
    mutationFn: () => addProductToCollection(props.collectionId, selectedProductId!),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["collectionProducts", props.collectionId] })
        toast.success(en.product_added_to_collection)
        setSelectedProductId(null)
        setSearchQuery("")
        props.onOpenChange(false)
      } else {
        toast.error(response.error || en.failed_to_add_product_to_collection)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_add_product_to_collection)
    },
  })

  const filteredProducts = products?.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? []

  const handleSave = () => {
    if (!selectedProductId) return
    addProduct()
  }

  const handleCancel = () => {
    setSelectedProductId(null)
    setSearchQuery("")
    props.onOpenChange(false)
  }

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <DialogHeader>
          <DialogTitle>{en.add_product_to_collection_title}</DialogTitle>
          <DialogDescription>{en.add_product_to_collection_subtitle}</DialogDescription>
        </DialogHeader>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* product list */}
        <div className="flex-1 overflow-y-auto max-h-[50vh] -mx-6 px-6">
          {isLoadingProducts ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              {en.loading}
            </div>
          ) : filteredProducts.length === 0 ? (
            // No search result indicator
            <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground">
              <SearchX className="size-5" />
              <span className="font-semibold">{en.no_search_result_found}</span>
            </div>
          ) : (
            // render the product list
            <div className="flex flex-col gap-1">
              {filteredProducts.map((product) => {
                const primaryImage = product.productImages.find((img) => img.isPrimary) ?? product.productImages[0]
                const isSelected = selectedProductId === product.id

                return (
                  <Item
                    key={product.id}
                    variant={isSelected ? "muted" : "default"}
                    size="sm"
                    className={cn(
                      "cursor-pointer transition-colors",
                      isSelected && "border-primary/50 bg-primary/5"
                    )}
                    onClick={() => setSelectedProductId(isSelected ? null : product.id)}
                  >
                    {/* The image */}
                    <ItemMedia variant="image">
                      {primaryImage ? (
                        <img
                          src={primaryImage.imageUrl}
                          alt={product.name}
                          className="size-10 rounded-sm object-cover"
                        />
                      ) : (
                        // fallback image
                        <div className="flex size-10 items-center justify-center rounded-sm bg-muted">
                          <Shirt className="size-4 text-muted-foreground" />
                        </div>
                      )}
                    </ItemMedia>

                    {/* Item details */}
                    <ItemContent>
                      <ItemTitle>{product.name}</ItemTitle>
                      <ItemDescription>{product.category.name}</ItemDescription>
                    </ItemContent>
                    <ItemActions>
                      {isSelected && (
                        <Check className="size-4 text-primary" />
                      )}
                    </ItemActions>
                  </Item>
                )
              })}
            </div>
          )}
        </div>

        {/* dialog footer */}
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleCancel} disabled={isAdding}>
            {en.cancel}
          </Button>
          <SaveButton
            isPending={isAdding}
            disabled={!selectedProductId}
            onClick={handleSave}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
