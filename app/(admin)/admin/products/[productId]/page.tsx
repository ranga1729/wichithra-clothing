'use client'

import { basicProductInfoSchema, BasicProductInfoSchema, productSchema, ProductSchema } from "@/schemas/admin-schemas";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { changeBasicInfo, changeProductSizes, changeProductStatus, getProductById, getProducts, toggleActiveStatus, toggleFeaturedStatus } from "../action";
import toast from "react-hot-toast";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { en } from "@/lib/i18n/en";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator"
import ColorMapper from "@/components/custom/general/ColorMapper";
import SizeMapper from "@/components/custom/general/SizeMapper";
import DesignMapper from "@/components/custom/general/DesignMapper";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import IsActiveToggler from "@/components/custom/general/IsActiveToggler";
import IsFeaturedToggler from "@/components/custom/general/IsFeaturedToggler";
import ProductStatusChanger from "@/components/custom/general/ProductStatusChanger";
import { ProductStatus } from "@/generated/prisma/enums";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProductDetailPage() {  
  const params = useParams();
  const productId = params.productId?.toString();
  const queryClient = useQueryClient();

  // react queries
  const { data:product, isPending, error, isError } = useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await getProductById(productId!);
      if(!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data);
      }
      console.log(response.data.product)
      return response.data.product
    },
    placeholderData: (prevdata) => prevdata
  })
  
  const {
    register,
    setValue, watch,
    formState: { errors },
  } = useForm<BasicProductInfoSchema>({
    resolver: zodResolver(basicProductInfoSchema),
    mode: "onChange",
    defaultValues: {
      id: product?.id,
      name: product?.name || "",
      slug: product?.slug || "",
      brand: product?.brand || "",
      material: product?.material || "",
      careInstructions: product?.careInstructions || "",
      description: product?.description || "",
      basePrice: product?.basePrice || 0,
      discountPercentage: (product?.discountPercentage || 0) as number,
    },
  });
  
  const currentFormData = watch();

  const loadCategoryData = async () => {
    if (product) {
      setValue("id", product.id);
      setValue("name", product.name);
      setValue("slug", product.slug);
      setValue("brand", product.brand);
      setValue("material", product.material);
      setValue("careInstructions", product.careInstructions);
      setValue("description", product.description);
      setValue("basePrice", product.basePrice)
      setValue("discountPercentage", product.discountPercentage)
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, [product]);

  const handleReset = () => {
    loadCategoryData();
  }

  const hasDataChanged = () => {
    if(
      currentFormData.name != product?.name ||
      currentFormData.slug != product.slug ||
      currentFormData.brand != product.brand ||
      currentFormData.material != product.material ||
      currentFormData.careInstructions != product.careInstructions ||
      currentFormData.description != product.description ||
      Number(currentFormData.basePrice) != product?.basePrice ||
      Number(currentFormData.discountPercentage) != product.discountPercentage
    ) {
      return false;
    }
    return true;
  }

  // react queries
  const { mutate: activeStatusToggler } = useMutation({
    mutationFn: (id: string) => toggleActiveStatus(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(en.product_updated_successfully);
      } else {
        toast.error(response.error || en.product_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.category_update_failed);
    },
  });

  const { mutate: featuredStatustoggler } = useMutation({
    mutationFn: (id: string) => toggleFeaturedStatus(id),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(en.product_updated_successfully);
      } else {
        toast.error(response.error || en.product_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.category_update_failed);
    },
  });

  const { mutate: productStatusChanger } = useMutation({
    mutationFn: (newStatus:ProductStatus) => changeProductStatus(product.id, newStatus),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(en.product_updated_successfully);
      } else {
        toast.error(response.error || en.product_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.category_update_failed);
    },
  });

  const { mutate: handleSubmit } = useMutation({
    mutationFn: () => changeBasicInfo(currentFormData),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(en.product_updated_successfully);
      } else {
        toast.error(response.error || en.product_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.category_update_failed);
    },
  });

  const { mutate: ProductSizeChanger } = useMutation({
    mutationFn: (newSizes: string[]) => changeProductSizes(product.id, newSizes),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["products"] });
        toast.success(en.product_updated_successfully);
      } else {
        toast.error(response.error || en.product_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.category_update_failed);
    },
  });

  // const ProductSizeChanger = async (newSizes: string[]) => {
  //   try {
  //     const response = await changeProductSizes(product!.id, newSizes);

  //     if(!response.success && response.message) {
  //       toast.error(response.message);
  //     }
      
  //     if(response.success) {
  //       toast.success(response.message!);
  //     }

  //   } catch(error:any) {
  //     toast.error(error.message)
  //   }
  // }

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [error, isError])

  const ImageCarousel = () => {
    return <Carousel
        opts={{
          align: "start",
        }}
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-4xl"
      >
      <CarouselPrevious />
      <CarouselContent>
        {product?.productImages.map((image:any, index:number) => (
          <CarouselItem key={index} className="basis-1/2 lg:basis-1/4">
            <div className="p-1">
              <Card className="p-0.5 bg-neutral-400 dark:bg-neutral-700">
                <CardContent className="flex aspect-square items-center justify-center m-0 p-0">
                  <Image src={image.imageUrl} alt={"test"} width={1200} height={1200} className="rounded-xl" />
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselNext />
    </Carousel>
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-md text-neutral-600 text-center">Product Images</h1>
        <div className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-600 py-3 rounded-2xl">
          <ImageCarousel />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-bold text-md text-neutral-600 text-center">Product Information</h1>
        <div className="flex flex-col items-center justify-center border border-neutral-300 p-5 rounded-2xl gap-4">
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
            </FieldGroup>
            <FieldGroup className="flex flex-row flex-wrap gap-4">
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
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-baseprice"> {en.base_price} </Label>
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
              <Field className="flex flex-col gap-2 flex-1">
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
            <FieldGroup className="flex items-end justify-center">
              <div className="flex flex-row gap-3">
                <Button className="w-30" variant={"default"} disabled={hasDataChanged()} onClick={() => handleSubmit()}>Save</Button>
                <Button className="w-30" variant={"default"} disabled={hasDataChanged()} onClick={() => handleReset()}> Reset</Button>
              </div>
            </FieldGroup>
          </FieldGroup>
          

          <Separator className="bg-neutral-400" />

          <FieldGroup className="flex lg:flex-row">
            <IsActiveToggler isActive={product?.isActive} isLoading={isPending} toggler={() => activeStatusToggler(product!.id)} />
            <IsFeaturedToggler isFeatured={product?.isFeatured} isLoading={isPending} toggler={() => featuredStatustoggler(product!.id)} />
            <ProductStatusChanger productStatus={product?.status as ProductStatus} isLoading={isPending} changer={productStatusChanger} />
          </FieldGroup>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Separator className="bg-neutral-100"/>          
        <h1 className="font-bold text-md text-neutral-600 text-center">Product Mappings</h1>
        <div className="flex flex-row items-start justify-center flex-wrap p-5 rounded-2xl gap-4">
          <ColorMapper colors={product?.productColors}  />
          <DesignMapper designs={product?.productDesigns} />
          <SizeMapper productSizes={product?.productSizes} sizeChanger={ProductSizeChanger} />
        </div>
      </div> 
    </div>
  )
}