'use client'

import { AgeGroupSchema, basicProductInfoSchema, BasicProductInfoSchema, GenderSchema } from "@/schemas/admin-schemas";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { en } from "@/lib/i18n/en";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SaveButton from "@/components/SaveButton";
import CancelButton from "@/components/CancelButton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNewProduct } from "./action";
import toast from "react-hot-toast";
import { AgeGroup, GenderTarget } from "@/generated/prisma/enums";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getCategorySelectorData } from "../categories/action";
import { formatLabel } from "@/lib/utils";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddNewModal(props: Props) {
  const queryClient = useQueryClient();

  const {
    register, reset,
    setValue, watch, handleSubmit,
    formState: { errors },
  } = useForm<BasicProductInfoSchema>({
    resolver: zodResolver(basicProductInfoSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      brand: "",
      gender: GenderTarget.UNISEX,
      ageGroup: AgeGroup.ADULT,
      material: "",
      careInstructions: "",
      description: "",
      basePrice: 0,
      discountPercentage: 0,
    },
  });

  const currentFormData = watch();

  const handleSelectorChange = (name: keyof BasicProductInfoSchema, value: string) => {
    setValue(name, value as any);
  };

  const handleCategoryChange = (val: string) => {
    const selected = categorySelectorData?.find((c: any) => c.slug === val);
    if (selected) setValue("category", { id: selected.id, name: selected.name, slug: selected.slug });
  };

  const { data: categorySelectorData } = useQuery({
    queryKey: ["categorySelectorData"],
    queryFn: async () => {
      const response = await getCategorySelectorData();
      if (!response.success) {
        toast.error(response.error ?? en.failed_to_load_category_filter_data);
      }
      return response.data;
    },
    placeholderData: (prevdata) => prevdata,
  });

  //react queries
  const { mutate: createProduct, isPending } = useMutation({
    mutationFn: (data: BasicProductInfoSchema) => createNewProduct(data),
    onSuccess: (response) => {
      if(response.success) {
        queryClient.invalidateQueries({ queryKey: ["products"]});
        toast.success(en.product_created_successfully);
        reset();
        props.onOpenChange(false);
      } else {
        toast.error(response.error || en.failed_to_create_product);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_create_product);
    }
  }) 

  const onSubmit = (data: BasicProductInfoSchema) => createProduct(data)
  
  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> {en.create_category_title} </DialogTitle>
          <DialogDescription>
            {en.create_category_subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup >
            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-name"> {en.name} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-name"
                    placeholder={en.name}
                    {...register("name")}
                    disabled= {isPending}
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500">
                      {errors.name.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-slug"> {en.slug} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-slug"
                    placeholder={en.slug}
                    {...register("slug")}
                    disabled= {isPending}
                  />
                  {errors.slug && (
                    <span className="text-sm text-red-500">
                      {errors.slug.message as string}
                    </span>
                  )}
                </div>
              </Field>
            </FieldGroup>
            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-brand"> {en.brand} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-brand"
                    placeholder={en.brand}
                    {...register("brand")}
                    disabled= {isPending}
                  />
                  {errors.brand && (
                    <span className="text-sm text-red-500">
                      {errors.brand.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-material"> {en.material} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-material"
                    placeholder={en.material}
                    {...register("material")}
                    disabled= {isPending}
                  />
                  {errors.material && (
                    <span className="text-sm text-red-500">
                      {errors.material.message as string}
                    </span>
                  )}
                </div>
              </Field>
            </FieldGroup>
            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="category"> {en.category} </Label>
                <Select value={currentFormData.category?.slug} onValueChange={(val) => handleCategoryChange(val)}>
                  <SelectTrigger id="category" className="w-40">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categorySelectorData && categorySelectorData.map((category: any) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {formatLabel(category.name)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="gender">{en.gender}</Label>
                <Select value={currentFormData.gender} onValueChange={(val) => handleSelectorChange("gender", val)}>
                  <SelectTrigger id="gender" className="w-40">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {GenderSchema.options.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {formatLabel(gender)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="ageGroup">{en.ageGroup}</Label>
                <Select value={currentFormData.ageGroup} onValueChange={(val) => handleSelectorChange("ageGroup", val)}>
                  <SelectTrigger id="ageGroup" className="w-40">
                    <SelectValue placeholder="Select age group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {AgeGroupSchema.options.map((group) => (
                        <SelectItem key={group} value={group}>
                          {formatLabel(group)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-baseprice"> {en.base_price} (LKR) </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-baseprice"
                    type="number"
                    step={0.01}
                    placeholder={en.base_price}
                    {...register("basePrice", {valueAsNumber: true})}
                    disabled={isPending}
                  />
                  {errors.basePrice && (
                    <span className="text-sm text-red-500">
                      {errors.basePrice.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-2 items-center justify-center">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="slider-demo-temperature">{en.discount_precentage}</Label>
                    <span className="text-muted-foreground text-sm">
                      {currentFormData.discountPercentage + "%"}
                    </span>
                  </div>
                  <Slider 
                    id="discount-percentage-handle"
                    value={[currentFormData.discountPercentage as number]}
                    min={0}
                    max={100}
                    step={1}
                    className="mx-auto w-full max-w-xs border border-neutral-500 rounded-2xl"
                    onValueChange={(value) => setValue("discountPercentage", value[0])}
                  />
              </Field>
            </FieldGroup>
            <FieldGroup className="flex lg:flex-row sm:flex-col">
            <Field className="flex flex-col gap-2">
              <Label htmlFor="edit-careinstructions"> {en.careInstructions} </Label>
              <div className="flex flex-col">
                <Textarea
                  id="edit-careinstructions"
                  placeholder="Care instruction for this product"
                  {...register("careInstructions")}
                  disabled= {isPending}
                />
                {errors.careInstructions && (
                  <span className="text-sm text-red-500">
                    {errors.careInstructions.message as string}
                  </span>
                )}
              </div>
            </Field>
            <Field className="flex flex-col gap-2">
              <Label htmlFor="edit-description"> {en.description} </Label>
              <div> 
                <Textarea
                  id="edit-description"
                  placeholder="Description of this product"
                  {...register("description")}
                  disabled= {isPending}
                />
                {errors.description && (
                  <span className="text-sm text-red-500">
                    {errors.description.message as string}
                  </span>
                )}
              </div> 
            </Field>
          </FieldGroup>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <SaveButton isPending={isPending} />
            <CancelButton onClick={() => props.onOpenChange(false)} isPending={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}