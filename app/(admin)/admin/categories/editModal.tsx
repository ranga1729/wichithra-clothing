import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySchema, categorySchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchSizeGuide, updateCategory } from "./action";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { en } from "@/lib/i18n/en";
import { Category } from "@/generated/prisma/client";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: Category;
}

// even though the file preview is working,
// if you remove the image b clicking on the "remove" button, it gets removed from the preview.
// but it deosn't get removed from the server/files

export default function EditModal(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [prevData, setPrevData] = useState<Category>();
  const [isLoadingSizeGuide, setIsLoadingSizeGuide] = useState(false);

  const {
    register, handleSubmit,
    setValue, reset, watch,
    formState: { errors },
  } = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      sizeGuide: undefined,
    },
  });

  const currentFormData = watch();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("sizeGuide", file, { shouldValidate: true });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    setValue("sizeGuide", undefined, { shouldValidate: true });
  };

  const getSizeGuide = async () => {
    try {
      if(props.selectedCategory && props.selectedCategory.sizeGuide) {
        setIsLoadingSizeGuide(true);
        const result = await fetchSizeGuide(props.selectedCategory.id);

        if(!result.success) {
          toast.error(result.error || en.messages.error_fetching_sizeguide);
          return null;
        }

        setFilePreview(result.data.sizeGuide);
        return result.data.sizeGuide;
      }
      return null;
    } catch (error:any) {
      toast.error(error.message || en.messages.error_fetching_sizeguide);
      return null;
    } finally {
      setIsLoadingSizeGuide(false);
    }
  }

  const hasChanges = useMemo(() => {
    if(!prevData) return false;

    const nameChanged = currentFormData.name !== prevData.name;
    const slugChanged = currentFormData.slug !== prevData.slug;
    const descriptionChanged = currentFormData.description !== prevData.description;
    const sortOrderChanged = currentFormData.sortOrder !== prevData.sortOrder;
    const fileChanged = currentFormData.sizeGuide instanceof File;

    return nameChanged || slugChanged || descriptionChanged || sortOrderChanged || fileChanged;
  }, [currentFormData, prevData])

  const onSubmit = async (data: CategorySchema) => {

    if (!hasChanges) {
      toast.error(en.messages.no_changes_detected);
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("id", prevData?.id || "");
      formData.append("name", data.name);
      formData.append("slug", data.slug);
      formData.append("description", data.description || "");
      formData.append("sortOrder", data.sortOrder?.toString() || "0");

      if (data.sizeGuide instanceof File) {
        formData.append("sizeGuide", data.sizeGuide);
      }

      const result = await updateCategory(prevData!.id, data);

      if (!result.success) {
        toast.error(result.error || en.messages.category_update_failed);
        reset();
        setFilePreview(null);
        props.onOpenChange(false);
        return;
      }

      toast.success(en.messages.category_updated_successfully);
      props.onOpenChange(false);
      reset();
      setFilePreview(null);
      setPrevData(undefined);

    } catch (error) {
      toast.error(en.messages.category_update_failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
    setFilePreview(null);
    setPrevData(undefined);
  }

  const handleFormSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

  useEffect(() => {
    const loadCategoryData = async () => {
      if (props.selectedCategory) {
        setValue("name", props.selectedCategory.name);
        setValue("slug", props.selectedCategory.slug);
        setValue("description", props.selectedCategory.description || "");
        setValue("sortOrder", props.selectedCategory.sortOrder || 0);
        
        await getSizeGuide();
        
        setPrevData(props.selectedCategory);
      }
    };

    loadCategoryData();
  }, [props.selectedCategory]);

  useEffect(() => {
    if (!props.isModalOpen) {
      reset();
      setFilePreview(null);
      setPrevData(undefined);
    }
  }, [props.isModalOpen, reset]);

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> {en.texts.category.edit_category_title} </DialogTitle>
          <DialogDescription>
            {en.texts.category.edit_category_subtitle}
          </DialogDescription>
        </DialogHeader>

        <div>
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-name"> {en.input_labels.name} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-name"
                    placeholder="Name"
                    {...register("name")}
                    disabled={isSubmitting || isLoadingSizeGuide}
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500">
                      {errors.name.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-slug"> {en.input_labels.slug} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-slug"
                    placeholder="Slug"
                    {...register("slug")}
                    disabled={isSubmitting || isLoadingSizeGuide}
                  />
                  {errors.slug && (
                    <span className="text-sm text-red-500">
                      {errors.slug.message as string}
                    </span>
                  )}
                </div>
              </Field>
            </FieldGroup>

            <Field className="flex flex-col gap-2">
              <Label htmlFor="edit-description"> {en.input_labels.description} </Label>
              <Textarea
                id="edit-description"
                placeholder="Type a description for this category"
                {...register("description")}
                disabled={isSubmitting || isLoadingSizeGuide}
              />
            </Field>

            <FieldGroup className="flex flex-col">
              <FieldGroup className="flex flex-row gap-4">
                <Field className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="edit-sortOrder"> {en.input_labels.sort_order} </Label>
                  <div className="flex flex-col">
                    <Input
                      id="edit-sortOrder"
                      type="number"
                      {...register("sortOrder", { valueAsNumber: true })}
                      disabled={isSubmitting || isLoadingSizeGuide}
                    />
                    {errors.sortOrder && (
                      <span className="text-sm text-red-500">
                        {errors.sortOrder.message as string}
                      </span>
                    )}
                  </div>
                </Field>
                <Field className="flex flex-col gap-2 flex-3">
                  <Label htmlFor="edit-sizeGuideImage"> {en.input_labels.size_guide_image} </Label>
                  <div>
                    <Input
                      id="edit-sizeGuideImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isSubmitting || isLoadingSizeGuide}
                    />
                    {errors.sizeGuide && (
                      <span className="text-sm text-red-500">
                        {errors.sizeGuide.message as string}
                      </span>
                    )}                
                  </div>
                </Field>
              </FieldGroup>
              
              {isLoadingSizeGuide && (
                <div className="flex items-center justify-center mt-2 p-4 border rounded-lg">
                  <LoaderCircle className="animate-spin w-6 h-6 mr-2" />
                  <span> {en.common.status.loading} </span>
                </div>
              )}
              
              {filePreview && !isLoadingSizeGuide && (
                <div className="relative mt-2 border rounded-lg p-2">
                  <img
                    src={filePreview}
                    alt="Size guide preview"
                    className="max-h-40 mx-auto rounded"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                  >
                    {en.common.buttons.remove}
                  </Button>
                </div>
              )}
            </FieldGroup>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button 
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting || !hasChanges || isLoadingSizeGuide}
            > 
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
                  {en.common.status.saving}
                </>
              ) : (
                "Save Category"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {en.common.buttons.cancel}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}