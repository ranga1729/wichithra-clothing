'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import SaveButton from "@/components/SaveButton"
import CancelButton from "@/components/CancelButton"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"
import { createInventoryItemSchema, CreateInventoryItemSchema } from "@/schemas/admin-schemas"
import SearchableSelect from "@/components/custom/general/SearchableSelect"
import {
  checkVariantExists,
  createInventoryItem,
  getColorSelectorData,
  getProductSelectorData,
} from "../actions"
import { ClothingSize } from "@/generated/prisma/enums"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { getCategorySelectorData } from "../../facets/categories/action"

export default function AddNewInventoryItem() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [categoryFilter, setCategoryFilter] = useState<string>("")

  const {
    register,
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInventoryItemSchema>({
    resolver: zodResolver(createInventoryItemSchema) as any,
    defaultValues: {
      productId: "",
      colorId: "",
      size: "" as ClothingSize,
      sku: "",
      isActive: true,
      quantity: 0,
      lowStockThreshold: 5,
    },
  })

  const { productId, colorId, size } = watch()

  // Reset dependent fields when product changes
  useEffect(() => {
    setValue("colorId", "")
    setValue("size", "" as ClothingSize)
  }, [productId, setValue])

  // Reset size when color changes
  useEffect(() => {
    setValue("size", "" as ClothingSize)
  }, [colorId, setValue])

  // queries
  const { data: categories } = useQuery({
    queryKey: ["categorySelectorData"],
    queryFn: async () => {
      const res = await getCategorySelectorData()
      if (!res.success) toast.error(res.error ?? en.failed_to_load_category_filter_data)
      return res.data ?? []
    },
    placeholderData: (prev) => prev,
  })

  const { data: products } = useQuery({
    queryKey: ["productSelector", { categoryFilter }],
    queryFn: async () => {
      const res = await getProductSelectorData(categoryFilter || undefined)
      if (!res.success) toast.error(res.error ?? en.data_retrieval_failed)
      return res.data ?? []
    },
    placeholderData: (prev) => prev,
  })

  const { data: colors } = useQuery({
    queryKey: ["colorSelector"],
    queryFn: async () => {
      const res = await getColorSelectorData()
      if (!res.success) toast.error(res.error ?? en.data_retrieval_failed)
      return res.data ?? []
    },
  })

  const { data: variantCheck, isFetching: isCheckingVariant } = useQuery({
    queryKey: ["variantCheck", productId, colorId, size],
    queryFn: async () => {
      const res = await checkVariantExists(productId, colorId, size)
      return res.data
    },
    enabled: !!(productId && colorId && size),
  })

  // mutation
  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: CreateInventoryItemSchema) => createInventoryItem(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["inventory"] })
        toast.success(en.inventory_item_created_successfully)
        router.push("/admin/inventory")
      } else {
        toast.error(response.error || en.failed_to_create_inventory_item)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_create_inventory_item)
    },
  })

  const onSubmit = (data: CreateInventoryItemSchema) => {
    if (variantCheck?.exists) {
      toast.error(en.variant_already_exists)
      return
    }
    submit(data)
  }

  const variantAllSelected = !!(productId && colorId && size)

  return (
    <div className="flex flex-col gap-5 w-4xl mx-auto">
      
      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-xl text-foreground">Add New Inventory Item</h1>
        <p className="text-sm text-muted-foreground">
          Select a product, color, and size to create a new product variant with inventory.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Variant Selection */}
        <div className="border border-border bg-card rounded-2xl p-5 flex flex-col gap-4">
          <h1 className="font-semibold text-foreground text-center">Variant Selection</h1>

          {/* Category filter — drives server-side product query */}
          <SearchableSelect
            items={(categories as any[]) ?? []}
            itemToStringValue={(c: any) => c?.name ?? ""}
            value={((categories as any[]) ?? []).find((c: any) => c.slug === categoryFilter) ?? null}
            onValueChange={(item: any) => {
              setCategoryFilter(item?.slug ?? "")
              setValue("productId", "")
            }}
            label="Filter by Category"
            placeholder="All categories"
            emptyMessage="No categories found."
          />

          {/* Product combobox — search and select in one component */}
          <Controller
            name="productId"
            control={control}
            render={({ field }) => {
              const selectedProduct =
                ((products as any[]) ?? []).find((p: any) => p.id === field.value) ?? null
              return (
                <SearchableSelect
                  items={(products as any[]) ?? []}
                  itemToStringValue={(p: any) => p?.name ?? ""}
                  value={selectedProduct}
                  onValueChange={(item: any) => field.onChange(item?.id ?? "")}
                  label="Product *"
                  id="productId"
                  placeholder="Search and select a product..."
                  emptyMessage="No products found."
                  error={errors.productId?.message as string | undefined}
                />
              )
            }}
          />

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            {/* Color combobox — search and select in one component */}
            <Controller
              name="colorId"
              control={control}
              render={({ field }) => {
                const selectedColor =
                  ((colors as any[]) ?? []).find((c: any) => c.id === field.value) ?? null
                return (
                  <SearchableSelect
                    items={(colors as any[]) ?? []}
                    itemToStringValue={(c: any) => c?.name ?? ""}
                    value={selectedColor}
                    className="flex-1 min-w-[200px]"
                    onValueChange={(item: any) => field.onChange(item?.id ?? "")}
                    label="Color *"
                    id="colorId"
                    placeholder="Search and select a color..."
                    disabled={!productId}
                    emptyMessage="No colors found."
                    error={errors.colorId?.message as string | undefined}
                    renderItem={(color: any) => (
                      <span className="flex items-center gap-2">
                        {color.hexCode && (
                          <span
                            className="h-3 w-3 shrink-0 rounded-full border border-neutral-400"
                            style={{ backgroundColor: `#${color.hexCode}` }}
                          />
                        )}
                        {color.name}
                      </span>
                    )}
                  />
                )
              }}
            />

            {/* Size selector */}
            <Field className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label htmlFor="size">Size *</Label>
              <Controller
                name="size"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!productId || !colorId}
                  >
                    <SelectTrigger
                      id="size"
                      className={errors.size ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a size..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {Object.values(ClothingSize).map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.size && (
                <span className="text-sm text-red-500">
                  {errors.size.message as string}
                </span>
              )}
            </Field>
          </FieldGroup>

          {/* Variant existence check banner */}
          {variantAllSelected && (
            <div
              className={`flex items-center gap-2 text-sm rounded-lg p-3 border ${
                isCheckingVariant
                  ? "border-border text-muted-foreground bg-muted"
                  : variantCheck?.exists
                  ? "border-destructive/30 text-destructive bg-destructive/10"
                  : "border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950"
              }`}
            >
              {isCheckingVariant ? (
                <span>Checking variant combination...</span>
              ) : variantCheck?.exists ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    This product + color + size combination already exists. 
                    {variantCheck?.variant?.sku && (
                      <strong className="block my-1">SKU: {variantCheck.variant.sku}</strong>
                    )}
                    Please choose a
                    different combination.
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>This is a new variant combination. You may proceed.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Variant Details */}
        <div className="border border-border bg-card rounded-2xl p-5 flex flex-col gap-4">
          <h1 className="font-semibold text-foreground text-center">Variant Details</h1>

          <Field className="flex flex-col gap-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              placeholder="e.g. SHIRT-BLK-M-001"
              {...register("sku")}
            />
            {errors.sku && (
              <span className="text-sm text-destructive">{errors.sku.message as string}</span>
            )}
          </Field>

          <FieldGroup className="flex flex-row flex-wrap gap-6">
            <Field className="flex flex-row items-center gap-3 flex-1 min-w-[200px]">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isActive"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <div className="flex flex-col">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-xs text-muted-foreground">
                  Only active variants will be visible to customers
                </p>
              </div>
            </Field>
          </FieldGroup>
        </div>

        {/* Inventory Details */}
        <div className="border border-border bg-card rounded-2xl p-5 flex flex-col gap-4">
          <h1 className="font-semibold text-foreground text-center">
            Inventory Details
          </h1>

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label htmlFor="quantity">Initial Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                {...register("quantity")}
              />
              {errors.quantity && (
                <span className="text-sm text-red-500">
                  {errors.quantity.message as string}
                </span>
              )}
            </Field>

            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                {...register("lowStockThreshold")}
              />
              {errors.lowStockThreshold && (
                <span className="text-sm text-red-500">
                  {errors.lowStockThreshold.message as string}
                </span>
              )}
            </Field>
          </FieldGroup>
        </div>

        {/* Actions */}
        <div className="flex flex-row gap-3 justify-end pb-6">
          <CancelButton onClick={() => router.push("/admin/inventory")} isPending={isPending} />
          <SaveButton
            isPending={isPending}
            disabled={variantAllSelected && variantCheck?.exists === true}
          />
        </div>
      </form>
    </div>
  )
}
