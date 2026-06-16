'use client'

import { AgeGroupSchema, basicProductInfoSchema, BasicProductInfoSchema, GenderSchema } from "@/schemas/admin-schemas";
import { useParams } from "next/navigation"
import { useEffect, useState } from "react";
import { changeBasicInfo, changeProductStatus, getProductById, toggleFeaturedStatus, updateSizeGuide, removeSizeGuide } from "../action";
import toast from "react-hot-toast";
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
import IsFeaturedToggler from "@/components/custom/general/IsFeaturedToggler";
import ProductStatusChanger from "@/components/custom/general/ProductStatusChanger";
import { ProductStatus } from "@/generated/prisma/enums";
import { Slider } from "@/components/ui/slider";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatLabel } from "@/lib/utils";
import { getCategorySelectorData } from "../../facets/categories/action";
import { Eye, Loader2 } from "lucide-react";
import ProductImageCarousel from "@/components/custom/general/product-image-carousel";
import { useBreadcrumbStore } from "@/lib/zustand-stores/use-breadcrum-store";

export default function ProductDetailPage() {  
  const params = useParams();
  const productId = params.productId?.toString();
  const queryClient = useQueryClient();
  const setDynamicLabel = useBreadcrumbStore((state) => state.setDynamicLabel);
  
  const [sizeGuidePreview, setSizeGuidePreview] = useState<string | null>(null);


  // react queries
  const { data:product, isPending, error, isError } = useQuery({
    queryKey: ['products', productId],
    queryFn: async () => {
      const response = await getProductById(productId!);
      if(!response.success) {
        throw new Error(response.error || en.failed_to_fetch_data);
      }
      return response.data.product;
    },
    placeholderData: (prevdata) => prevdata
  })
  
  const {
    register,
    setValue, watch,
    formState: { errors },
  } = useForm<BasicProductInfoSchema>({
    resolver: zodResolver(basicProductInfoSchema) as any,
    mode: "onChange",
    defaultValues: {
      id: product?.id,
      name: product?.name || "",
      slug: product?.slug || "",
      ageGroup: product?.ageGroup || "",
      gender: product?.gender || "",
      category: product?.category || undefined,
      brand: product?.brand || "",
      material: product?.material || "",
      careInstructions: product?.careInstructions || "",
      description: product?.description || "",
      discountPercentage: product?.discountPercentage ?? 0,
      metaTitle: product?.metaTitle || "",
      metaDescription: product?.metaDescription || "",
    },
  });
  
  const currentFormData = watch();

  const loadCategoryData = async () => {
    if (product) {
      setValue("id", product.id);
      setValue("name", product.name);
      setValue("slug", product.slug);
      setValue("brand", product.brand);
      setValue("gender", product.gender);
      setValue("ageGroup", product.ageGroup);
      setValue("category", product.category);
      setValue("material", product.material);
      setValue("careInstructions", product.careInstructions);
      setValue("description", product.description);
      setValue("discountPercentage", product.discountPercentage);
      setValue("metaTitle", product.metaTitle ?? "");
      setValue("metaDescription", product.metaDescription ?? "");
      setSizeGuidePreview(product.sizeGuide ?? null);
    }
  };

  useEffect(() => {
    loadCategoryData();
  }, [product]);

  const handleReset = () => {
    loadCategoryData();
  }

  useEffect(() => {
    if(product?.name) {
      setDynamicLabel(product.name)
    }
  })


  const hasDataChanged = () => {
    if (!product) return true;
    return (
      currentFormData.name === product.name &&
      currentFormData.slug === product.slug &&
      (currentFormData.brand ?? "") === (product.brand ?? "") &&
      (currentFormData.material ?? "") === (product.material ?? "") &&
      (currentFormData.careInstructions ?? "") === (product.careInstructions ?? "") &&
      currentFormData.description === product.description &&
      Number(currentFormData.discountPercentage) === Number(product.discountPercentage) &&
      currentFormData.ageGroup === product.ageGroup &&
      currentFormData.gender === product.gender &&
      currentFormData.category?.id === product.category?.id &&
      (currentFormData.metaTitle ?? "") === (product.metaTitle ?? "") &&
      (currentFormData.metaDescription ?? "") === (product.metaDescription ?? "")
    );
  }

  const handleSelectorChange = (name: keyof BasicProductInfoSchema, value: string) => {
    setValue(name, value as any)
  }

  const handleCategoryChange = (val: string) => {
    const selected = categorySelectorData?.find((c: any) => c.slug === val)
    if (selected) setValue("category", { id: selected.id, name: selected.name, slug: selected.slug })
  }

  const handleSizeGuideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadSizeGuide(file);
    e.target.value = "";
  };

  const handleSizeGuideRemove = () => removeSizeGuideImage();

  const { mutate: uploadSizeGuide, isPending: isSizeGuideUploading } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await updateSizeGuide(productId!, formData);
      if (!response.success) throw new Error(response.error || en.failed_to_upload_image);
      return response.data.imageUrl as string;
    },
    onSuccess: (imageUrl) => {
      queryClient.setQueryData(["products", productId], (old: any) =>
        old ? { ...old, sizeGuide: imageUrl } : old
      );
      setSizeGuidePreview(imageUrl);
      toast.success(en.product_updated_successfully);
    },
    onError: (error: Error) => toast.error(error.message || en.failed_to_upload_image),
  });

  const { mutate: removeSizeGuideImage, isPending: isDeletingSizeGuide } = useMutation({
    mutationFn: async () => {
      const response = await removeSizeGuide(productId!);
      if (!response.success) throw new Error(response.error || en.failed_to_remove_image);
    },
    onSuccess: () => {
      queryClient.setQueryData(["products", productId], (old: any) =>
        old ? { ...old, sizeGuide: null } : old
      );
      setSizeGuidePreview(null);
      toast.success(en.product_updated_successfully);
    },
    onError: (error: Error) => toast.error(error.message || en.failed_to_remove_image),
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
    mutationFn: (newStatus:ProductStatus) => changeProductStatus(product?.id!, newStatus),
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

  const { data : categorySelectorData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategorySelectorData()
      if(!response.success) {
        toast.error(response.error ?? en.failed_to_load_category_filter_data)
      }
      return response.data
    },
    placeholderData: (prevdata) => prevdata
  })

  useEffect(() => {
    if (isError && error) {
      toast.error(error.message);
    }
  }, [error, isError])

  return (
    <div className="flex flex-col gap-5">
      <ProductImageCarousel productId={productId!} productImages={product?.productImages ?? []} />

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
            </FieldGroup>
            <FieldGroup className="flex flex-row flex-wrap gap-4">
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
            
            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="category"> {en.category} </Label>
                <Select value={currentFormData.category?.slug} onValueChange={(val) => handleCategoryChange(val)}>
                  <SelectTrigger id="category" className="w-40">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {categorySelectorData && categorySelectorData.map((category:any) => (
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
                    <SelectValue placeholder="Select category" />
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
              <Field className="flex flex-col gap-2 flex-1 ">
                <div className="flex items-center justify-start gap-2">
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
            </FieldGroup>

            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-metatitle"> {en.meta_title} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-metatitle"
                    placeholder={en.meta_title}
                    {...register("metaTitle")}
                    disabled={isPending}
                  />
                  {errors.metaTitle && (
                    <span className="text-sm text-red-500">
                      {errors.metaTitle.message as string}
                    </span>
                  )}
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup className="flex flex-row flex-wrap gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-metadescription"> {en.meta_description} </Label>
                <div className="flex flex-col">
                  <Textarea
                    id="edit-metadescription"
                    placeholder={en.meta_description}
                    {...register("metaDescription")}
                    disabled={isPending}
                  />
                  {errors.metaDescription && (
                    <span className="text-sm text-red-500">
                      {errors.metaDescription.message as string}
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

            <Separator className="bg-neutral-400" />

            <FieldGroup className="flex lg:flex-row">
              <IsFeaturedToggler isFeatured={product?.isFeatured} isLoading={isPending} toggler={() => featuredStatustoggler(product!.id)} />
              <ProductStatusChanger productStatus={product?.status as ProductStatus} isLoading={isPending} changer={productStatusChanger} />
            </FieldGroup>

            <Separator className="bg-neutral-400" />
            
            <FieldGroup className="flex flex-col gap-2">
              <Field className="flex flex-col gap-2">
                <Label htmlFor="edit-sizeguide"> {en.size_guide_image} </Label>
                <Input
                  id="edit-sizeguide"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/jpg"
                  onChange={handleSizeGuideFileChange}
                  disabled={isPending || isSizeGuideUploading}
                />
                {isSizeGuideUploading && (
                  <span className="text-sm text-muted-foreground">{en.loading}</span>
                )}
                {sizeGuidePreview && (
                  <div className="flex flex-col gap-2 mt-2">
                    <img
                      src={sizeGuidePreview}
                      alt="Size guide preview"
                      className="max-h-48 rounded-lg object-contain border border-neutral-300"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit"
                        onClick={() => window.open(sizeGuidePreview, "_blank")}
                      >
                        <Eye size={14} className="mr-1" /> View
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="w-fit"
                        onClick={handleSizeGuideRemove}
                        disabled={isDeletingSizeGuide}
                      >
                        {isDeletingSizeGuide && <Loader2 size={14} className="animate-spin mr-1" />}
                        {en.remove}
                      </Button>
                    </div>
                  </div>
                )}
              </Field>
            </FieldGroup>
          </FieldGroup>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Separator className="bg-neutral-100"/>          
        <h1 className="font-bold text-md text-neutral-600 text-center">Product Mappings</h1>
        <div className="flex flex-row items-start justify-center flex-wrap p-5 rounded-2xl gap-4">
          <ColorMapper variants={product?.variants}  />
          <DesignMapper designs={product?.productDesigns} />
          <SizeMapper variants={product?.variants} />
        </div>
      </div> 
    </div>
  )
}