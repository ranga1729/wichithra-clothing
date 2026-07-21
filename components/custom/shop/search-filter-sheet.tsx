"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useShopFiltersStore } from "@/lib/zustand-stores/shop-filters-store"
import { useSearchFilterOptions } from "@/hooks/use-search-filter-options"
import { SearchFilterBadge } from "./search-filter-badge"
import { SearchPriceRange } from "./search-price-range"
import { en } from "@/lib/i18n/en"
import { ClothingSize } from "@/generated/prisma/enums"

interface SearchFilterSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onApply: () => void
}

export function SearchFilterSheet({
  open,
  onOpenChange,
  onApply,
}: SearchFilterSheetProps) {
  const { data: options, isLoading } = useSearchFilterOptions()

  const {
    selectedCategories,
    selectedDesigns,
    selectedColors,
    selectedSizes,
    priceRange,
    toggleCategory,
    toggleDesign,
    toggleColor,
    toggleSize,
    setPriceRange,
    reset,
  } = useShopFiltersStore()

  const handleClearAll = () => {
    reset()
    if (options) {
      setPriceRange([options.priceRange.min, options.priceRange.max])
    }
  }

  const handleApply = () => {
    onApply()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{en.filter}</SheetTitle>
          <SheetDescription>{en.filter_description}</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
            </div>
          ) : !options ? null : (
            <Accordion
              type="multiple"
              defaultValue={["category", "size", "color", "design", "price"]}
              className="w-full"
            >
              <AccordionItem value="category">
                <AccordionTrigger>{en.category}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {options.categories.map((cat) => (
                      <SearchFilterBadge
                        key={cat.value}
                        label={cat.name}
                        selected={selectedCategories.includes(cat.name)}
                        onClick={() => toggleCategory(cat.name)}
                      />
                    ))}
                    {options.categories.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        {en.no_results_found}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="size">
                <AccordionTrigger>{en.size}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {options.sizes.map((size) => (
                      <SearchFilterBadge
                        key={size}
                        label={size}
                        selected={selectedSizes.includes(size)}
                        onClick={() => toggleSize(size as ClothingSize)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="color">
                <AccordionTrigger>{en.color}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {options.colors.map((color) => (
                      <SearchFilterBadge
                        key={color.name}
                        label={color.name}
                        variant="color"
                        hexCode={color.hexCode}
                        swatchImageUrl={color.swatchImageUrl}
                        selected={selectedColors.includes(color.name)}
                        onClick={() => toggleColor(color.name)}
                      />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="design">
                <AccordionTrigger>{en.design}</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-wrap gap-2">
                    {options.designs.map((design) => (
                      <SearchFilterBadge
                        key={design.value}
                        label={design.name}
                        selected={selectedDesigns.includes(design.value)}
                        onClick={() => toggleDesign(design.value)}
                      />
                    ))}
                    {options.designs.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        {en.no_results_found}
                      </p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="price" className="border-b-0">
                <AccordionTrigger>{en.price_range}</AccordionTrigger>
                <AccordionContent>
                  {options.priceRange.min !== options.priceRange.max ? (
                    <SearchPriceRange
                      min={options.priceRange.min}
                      max={options.priceRange.max}
                      value={
                        priceRange[0] === 0 && priceRange[1] === 0
                          ? [options.priceRange.min, options.priceRange.max]
                          : priceRange
                      }
                      onValueChange={setPriceRange}
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Fixed price: {options.priceRange.min}
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>

        <SheetFooter className="flex-row gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="flex-1"
          >
            {en.clear_all}
          </Button>
          <Button onClick={handleApply} className="flex-1">
            {en.apply_filters}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
