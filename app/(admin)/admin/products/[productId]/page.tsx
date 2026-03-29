'use client'

import { basicProductInfoSchema, BasicProductInfoSchema, productSchema, ProductSchema } from "@/schemas/admin-schemas";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { changeBasicInfo, changeProductSizes, changeProductStatus, getProductById, toggleActiveStatus, toggleFeaturedStatus } from "../action";
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
import { useRouter } from "next/navigation";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<ProductSchema>();
  const [isLoading, setIsLoading] = useState(false);
  
  const params = useParams();
  const productId = params.productId?.toString();

  const router = useRouter()
  
  const {
    register,
    setValue, watch,
    formState: { errors },
  } = useForm<BasicProductInfoSchema>({
    resolver: zodResolver(basicProductInfoSchema),
    mode: "onChange",
    defaultValues: {
      id: product?.id,
      name: product?.name ||"",
      slug: product?.slug || "",
      brand: product?.brand || "",
      material: product?.material || "",
      careInstructions: product?.careInstructions || "",
      description: product?.description || "",
      basePrice: product?.basePrice || 0,
      discountPercentage: product?.discountPercentage || 0,
    },
  });
  
  const currentFormData = watch();


  const fetchData = async () => {
    try {
      setIsLoading(true);

      const response = await getProductById(productId!);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        setProduct(response.data.product)
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [productId])

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

  const handleSubmit = async () => {
    try {
      setIsLoading(true);

      const response = await changeBasicInfo(currentFormData);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        toast.success(response.message!);
        fetchData();
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
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

  const activeStatusToggler = async () => {
    try {
      setIsLoading(true);

      const response = await toggleActiveStatus(product!.id);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        toast.success(response.message!);
        fetchData();
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  } 

  const featuredStatustoggler = async () => {
    try {
      setIsLoading(true);

      const response = await toggleFeaturedStatus(product!.id);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        toast.success(response.message!);
        fetchData();
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const productStatusChanger = async (newStatus:ProductStatus) => {
    try {
      setIsLoading(true);
      
      const response = await changeProductStatus(product!.id, newStatus);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        toast.success(response.message!);
        fetchData();
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const ProductSizeChanger = async (newSizes: string[]) => {
    
    try {
      setIsLoading(true);
      
      const response = await changeProductSizes(product!.id, newSizes);

      if(!response.success && response.message) {
        toast.error(response.message);
      }
      
      if(response.success) {
        toast.success(response.message!);
        fetchData();
      }

    } catch(error:any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  const ImageCarousel = () => {
    return <Carousel
        opts={{
          align: "start",
        }}
        className="w-full sm:max-w-md md:max-w-lg lg:max-w-4xl"
      >
      <CarouselPrevious />
      <CarouselContent>
        {product?.productImages.map((image, index) => (
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
    <div>
      <h1 className="font-bold text-md text-neutral-600 text-center">Product Images</h1>
      <div className="flex items-center justify-center bg-neutral-200 dark:bg-neutral-600 py-3 rounded-2xl">
        <ImageCarousel />
      </div>

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
                  disabled= {isLoading}
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
                  disabled= {isLoading}
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
                  disabled= {isLoading}
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
                  disabled= {isLoading}
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
                  disabled={isLoading}
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
                  disabled= {isLoading}
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
                  disabled= {isLoading}
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
              <Button className="w-30" variant={"default"} disabled={hasDataChanged()} onClick={handleSubmit}>Save</Button>
              <Button className="w-30" variant={"default"} disabled={hasDataChanged()} onClick={handleReset}> Reset</Button>
            </div>
          </FieldGroup>
        </FieldGroup>
        

        <Separator className="bg-neutral-400" />

        <FieldGroup className="flex lg:flex-row">
          <IsActiveToggler isActive={product?.isActive} isLoading={isLoading} toggler={activeStatusToggler} />
          <IsFeaturedToggler isFeatured={product?.isFeatured} isLoading={isLoading} toggler={featuredStatustoggler} />
          <ProductStatusChanger productStatus={product?.status as ProductStatus} isLoading={isLoading} changer={productStatusChanger} />
        </FieldGroup>
      </div>

      <h1 className="font-bold text-md text-neutral-600 text-center">Product Mappings</h1>
      <div className="flex flex-row items-start justify-center border flex-wrap border-neutral-300 p-5 rounded-2xl gap-4">
        <ColorMapper colors={product?.productColors}  />
        <DesignMapper designs={product?.productDesigns} />
        <SizeMapper productSizes={product?.productSizes} sizeChanger={ProductSizeChanger} />
      </div>
    </div>
  )
}