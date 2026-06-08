'use client'

import { use, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import SaveButton from "@/components/SaveButton"
import CancelButton from "@/components/CancelButton"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"
import { updateInventoryItemSchema, UpdateInventoryItemSchema } from "@/schemas/admin-schemas"
import { getInventoryItemByVariantId, updateInventoryItem } from "../actions"

export default function EditInventoryItem({
  params,
}: {
  params: Promise<{ productVariantId: string }>
}) {
  const { productVariantId } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInventoryItemSchema>({
    resolver: zodResolver(updateInventoryItemSchema) as any,
    defaultValues: {
      costPrice: undefined as any,
      sellingPrice: undefined as any,
      isActive: true,
      quantity: 0,
      lowStockThreshold: 5,
    },
  })

  // Load existing data
  const { data: item, isPending: isLoading } = useQuery({
    queryKey: ["inventoryItem", productVariantId],
    queryFn: async () => {
      const res = await getInventoryItemByVariantId(productVariantId)
      if (!res.success) {
        toast.error(res.error ?? en.failed_to_load_inventory_item)
        return null
      }
      return res.data
    },
    enabled: !!productVariantId,
  })

  // Populate form once data is loaded
  useEffect(() => {
    if (item) {
      reset({
        costPrice: item.variant.costPrice ?? undefined,
        sellingPrice: item.variant.sellingPrice,
        isActive: item.variant.isActive,
        quantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold ?? 5,
      })
    }
  }, [item, reset])

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (data: UpdateInventoryItemSchema) =>
      updateInventoryItem(productVariantId, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["inventory"] })
        toast.success(en.inventory_item_updated_successfully)
        router.push("/admin/inventory")
      } else {
        toast.error(response.error || en.failed_to_update_inventory_item)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_update_inventory_item)
    },
  })

  const onSubmit = (data: UpdateInventoryItemSchema) => {
    submit(data)
  }

  return (
    <div className="flex flex-col gap-5 w-4xl mx-auto">

      {/* header */}
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-xl text-neutral-700 dark:text-neutral-200">Edit Inventory Item</h1>
        <p className="text-sm text-neutral-500">
          Update the pricing, quantity, and status of this product variant.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* ── Read-only Variant Info ─────────────────────────────────── */}
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h1 className="font-semibold text-neutral-600 dark:text-neutral-300 text-center">Variant Info</h1>

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label>Category</Label>
              <Input
                value={isLoading ? "Loading..." : (item?.variant.product.category.name ?? "—")}
                disabled
                readOnly
              />
            </Field>

            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label>Product</Label>
              <Input
                value={isLoading ? "Loading..." : (item?.variant.product.name ?? "—")}
                disabled
                readOnly
              />
            </Field>
          </FieldGroup>

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label>Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={isLoading ? "Loading..." : (item?.variant.color.name ?? "—")}
                  disabled
                  readOnly
                />
                {item?.variant.color.hexCode && (
                  <span
                    className="h-8 w-8 shrink-0 rounded-full border border-neutral-400"
                    style={{ backgroundColor: `#${item.variant.color.hexCode}` }}
                  />
                )}
              </div>
            </Field>

            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label>Size</Label>
              <Input
                value={isLoading ? "Loading..." : (item?.variant.size.name ?? "—")}
                disabled
                readOnly
              />
            </Field>

            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label>SKU</Label>
              <Input
                value={isLoading ? "Loading..." : (item?.variant.sku ?? "—")}
                disabled
                readOnly
              />
            </Field>
          </FieldGroup>
        </div>

        {/* ── Variant Details ────────────────────────────────────────── */}
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h1 className="font-semibold text-neutral-600 dark:text-neutral-300 text-center">Variant Details</h1>

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

        {/* ── Inventory Details ──────────────────────────────────────── */}
        <div className="border border-neutral-300 rounded-2xl p-5 flex flex-col gap-4">
          <h1 className="font-semibold text-neutral-600 dark:text-neutral-300 text-center">
            Inventory Details
          </h1>

          <FieldGroup className="flex flex-row flex-wrap gap-4">
            <Field className="flex flex-col gap-2 flex-1 min-w-[180px]">
              <Label htmlFor="quantity">Quantity</Label>
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

        {/* ── Actions ────────────────────────────────────────────────── */}
        <div className="flex flex-row gap-3 justify-end pb-6">
          <CancelButton onClick={() => router.push("/admin/inventory")} isPending={isPending} />
          <SaveButton isPending={isPending || isLoading} />
        </div>
      </form>
    </div>
  )
}
