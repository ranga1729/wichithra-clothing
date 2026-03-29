'use client'

import { basicProductInfoSchema, BasicProductInfoSchema } from "@/schemas/admin-schemas";
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

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddNewModal(props: Props) {

  const {
    register,
    setValue, watch, handleSubmit,
    formState: { errors },
  } = useForm<BasicProductInfoSchema>({
    resolver: zodResolver(basicProductInfoSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      brand: "",
      material: "",
      careInstructions: "",
      description: "",
      basePrice: 0,
      discountPercentage: 0,
    },
  });

  const currentFormData = watch();

  const onSubmit = () => {
    console.log("test: ", currentFormData)
  }
  
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
                    //disabled= {isLoading}
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
                    //disabled= {isLoading}
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
                    //disabled= {isLoading}
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
                    //disabled= {isLoading}
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
                <Label htmlFor="edit-baseprice"> {en.base_price} (LKR) </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-baseprice"
                    type="number"
                    step={0.01}
                    placeholder={en.base_price}
                    {...register("basePrice", {valueAsNumber: true})}
                    //disabled={isLoading}
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
                    value={[currentFormData.discountPercentage!]}
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
                  //disabled= {isLoading}
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
                  //disabled= {isLoading}
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
        </form>
        
        <DialogFooter className="mt-6">
            <SaveButton onclick={onSubmit} />
            <CancelButton onClick={() => props.onOpenChange(false)} />
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}