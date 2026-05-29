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
import { Separator } from "@/components/ui/separator"
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
import { useDebounce } from "@/hooks/useDebounce"
import {
  checkVariantExists,
  createInventoryItem,
  getColorSelectorData,
  getProductSelectorData,
  getSizeSelectorData,
} from "./../actions"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { getCategorySelectorData } from "../../categories/action"

export default function AddNewInventoryItem() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [productSearch, setProductSearch] = useState<string>("")
  const [colorSearch, setColorSearch] = useState<string>("")

  const debouncedProductSearch = useDebounce(productSearch, 400)

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
      sizeId: "",
      sku: "",
      costPrice: undefined as any,
      sellingPrice: undefined as any,
      isActive: true,
      quantity: 0,
      lowStockThreshold: 5,
    },
  })

  const { productId, colorId, sizeId } = watch()

  // Reset dependent fields when product changes
  useEffect(() => {
    setValue("colorId", "")
    setValue("sizeId", "")
    setColorSearch("")
  }, [productId, setValue])

  // Reset size when color changes
  useEffect(() => {
    setValue("sizeId", "")
  }, [colorId, setValue])

  // ─── Queries ─────────────────────────────────────────────────────────────

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
    queryKey: ["productSelector", { categoryFilter, search: debouncedProductSearch }],
    queryFn: async () => {
      const res = await getProductSelectorData(
        categoryFilter || undefined,
        debouncedProductSearch || undefined
      )
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

  const { data: sizes } = useQuery({
    queryKey: ["sizeSelector"],
    queryFn: async () => {
      const res = await getSizeSelectorData()
      if (!res.success) toast.error(res.error ?? en.data_retrieval_failed)
      return res.data ?? []
    },
  })

  const { data: variantCheck, isFetching: isCheckingVariant } = useQuery({
    queryKey: ["variantCheck", productId, colorId, sizeId],
    queryFn: async () => {
      const res = await checkVariantExists(productId, colorId, sizeId)
      return res.data
    },
    enabled: !!(productId && colorId && sizeId),
  })

  const filteredColors = ((colors as any[]) ?? []).filter((c) =>
    c.name.toLowerCase().includes(colorSearch.toLowerCase())
  )

  // ─── Mutation ─────────────────────────────────────────────────────────────

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

  const variantAllSelected = !!(productId && colorId && sizeId)

  return (
    <div className="flex flex-col gap-5 w-4xl mx-auto border border-red-500">
      
      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-xl text-neutral-700 dark:text-neutral-200">
          Add New Inventory Item
        </h1>
        <p className="text-sm text-neutral-500">
          Select a product, color, and size to create a new product variant with inventory.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* ── Variant Selection ─────────────────────────────────────────── */}
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-neutral-600 dark:text-neutral-300">Variant Selection</h2>
          <Separator className="bg-neutral-200" />

          {/* Category filter + Product search */}
          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label>Filter by Category</Label>
              <Select
                value={categoryFilter || "__all__"}
                onValueChange={(val) => {
                  setCategoryFilter(val === "__all__" ? "" : val)
                  setValue("productId", "")
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__all__">All categories</SelectItem>
                    {((categories as any[]) ?? []).map((c: any) => (
                      <SelectItem key={c.id} value={c.slug}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>

            <Field className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label>Search Product</Label>
              <Input
                placeholder="Type to search products..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </Field>
          </FieldGroup>

          {/* Product selector */}
          <Field className="flex flex-col gap-2">
            <Label htmlFor="productId">Product *</Label>
            <Controller
              name="productId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(val) => {
                    field.onChange(val)
                  }}
                >
                  <SelectTrigger
                    id="productId"
                    className={errors.productId ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {((products as any[]) ?? []).length === 0 ? (
                        <div className="py-2 px-3 text-sm text-neutral-500">
                          No products found
                        </div>
                      ) : (
                        ((products as any[]) ?? []).map((p: any) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.productId && (
              <span className="text-sm text-red-500">
                {errors.productId.message as string}
              </span>
            )}
          </Field>

          {/* Color search + Size */}
          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label>Search Color</Label>
              <Input
                placeholder="Filter colors..."
                value={colorSearch}
                onChange={(e) => setColorSearch(e.target.value)}
                disabled={!productId}
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            {/* Color selector */}
            <Field className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label htmlFor="colorId">Color *</Label>
              <Controller
                name="colorId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!productId}
                  >
                    <SelectTrigger
                      id="colorId"
                      className={errors.colorId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a color..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {filteredColors.length === 0 ? (
                          <div className="py-2 px-3 text-sm text-neutral-500">
                            No colors found
                          </div>
                        ) : (
                          filteredColors.map((c: any) => (
                            <SelectItem key={c.id} value={c.id}>
                              <span className="flex items-center gap-2">
                                {c.hexCode && (
                                  <span
                                    className="h-3 w-3 shrink-0 rounded-full border border-neutral-400"
                                    style={{ backgroundColor: `#${c.hexCode}` }}
                                  />
                                )}
                                {c.name}
                              </span>
                            </SelectItem>
                          ))
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.colorId && (
                <span className="text-sm text-red-500">
                  {errors.colorId.message as string}
                </span>
              )}
            </Field>

            {/* Size selector */}
            <Field className="flex flex-col gap-2 flex-1 min-w-[200px]">
              <Label htmlFor="sizeId">Size *</Label>
              <Controller
                name="sizeId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!productId || !colorId}
                  >
                    <SelectTrigger
                      id="sizeId"
                      className={errors.sizeId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select a size..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {((sizes as any[]) ?? []).map((s: any) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.sizeId && (
                <span className="text-sm text-red-500">
                  {errors.sizeId.message as string}
                </span>
              )}
            </Field>
          </FieldGroup>

          {/* Variant existence check banner */}
          {variantAllSelected && (
            <div
              className={`flex items-center gap-2 text-sm rounded-lg p-3 border ${
                isCheckingVariant
                  ? "border-neutral-300 text-neutral-500 bg-neutral-50 dark:bg-neutral-800"
                  : variantCheck?.exists
                  ? "border-red-300 text-red-700 bg-red-50 dark:bg-red-950"
                  : "border-green-300 text-green-700 bg-green-50 dark:bg-green-950"
              }`}
            >
              {isCheckingVariant ? (
                <span>Checking variant combination...</span>
              ) : variantCheck?.exists ? (
                <>
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    This product + color + size combination already exists. Please choose a
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

        {/* ── Variant Details ───────────────────────────────────────────── */}
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-neutral-600 dark:text-neutral-300">Variant Details</h2>
          <Separator className="bg-neutral-200" />

          <Field className="flex flex-col gap-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              placeholder="e.g. SHIRT-BLK-M-001"
              {...register("sku")}
            />
            {errors.sku && (
              <span className="text-sm text-red-500">{errors.sku.message as string}</span>
            )}
          </Field>

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label htmlFor="sellingPrice">Selling Price (LKR) *</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("sellingPrice")}
              />
              {errors.sellingPrice && (
                <span className="text-sm text-red-500">
                  {errors.sellingPrice.message as string}
                </span>
              )}
            </Field>

            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label htmlFor="costPrice">Cost Price (LKR)</Label>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register("costPrice")}
              />
              {errors.costPrice && (
                <span className="text-sm text-red-500">
                  {errors.costPrice.message as string}
                </span>
              )}
            </Field>
          </FieldGroup>

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
                <p className="text-xs text-neutral-500">
                  Only active variants will be visible to customers
                </p>
              </div>
            </Field>
          </FieldGroup>
        </div>

        {/* ── Inventory Details ─────────────────────────────────────────── */}
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h2 className="font-semibold text-neutral-600 dark:text-neutral-300">
            Inventory Details
          </h2>
          <Separator className="bg-neutral-200" />

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

        {/* ── Actions ───────────────────────────────────────────────────── */}
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
