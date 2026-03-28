"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CategorySchema, categorySchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { updateCategoryById } from "./action";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { en } from "@/lib/i18n/en";
import { Category } from "@/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTempFile, uploadTempFile } from "@/components/providers/supabase/storage";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: Category;
}

export default function EditModal(props: Props) {
  const queryClient = useQueryClient();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isFileLoading, setIsFileLoading] = useState(false);

  // Tracks a newly uploaded temp file path — null if no new file was uploaded
  const tempUploadPathRef = useRef<string | null>(null);

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

  useEffect(() => {
    if (props.selectedCategory && props.isModalOpen) {
      setValue("name", props.selectedCategory.name);
      setValue("slug", props.selectedCategory.slug);
      setValue("description", props.selectedCategory.description || "");
      setValue("sortOrder", props.selectedCategory.sortOrder || 0);
      setValue("sizeGuide", props.selectedCategory.sizeGuide || undefined);

      setFilePreview(props.selectedCategory.sizeGuide || null);
    }
  }, [props.selectedCategory?.id,props.selectedCategory?.sizeGuide, props.isModalOpen]);

  // Clean up form state when modal closes (but NOT storage — handleClose does that)
  useEffect(() => {
    if (!props.isModalOpen) {
      reset();
      setFilePreview(null);
    }
  }, [props.isModalOpen, reset]);

  const hasChanges = useMemo(() => {
    if (!props.selectedCategory) return false;
    return (
      currentFormData.name !== props.selectedCategory.name ||
      currentFormData.slug !== props.selectedCategory.slug ||
      currentFormData.description !== (props.selectedCategory.description || "") ||
      currentFormData.sortOrder !== (props.selectedCategory.sortOrder || 0) ||
      currentFormData.sizeGuide !== (props.selectedCategory.sizeGuide || "")
    );
  }, [currentFormData, props.selectedCategory]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (tempUploadPathRef.current) {
      await deleteTempFile(tempUploadPathRef.current).catch(() => null);
      tempUploadPathRef.current = null;
    }

    setIsFileLoading(true);
    try {
      const { path, url } = await uploadTempFile(file);
      tempUploadPathRef.current = path;
      setValue("sizeGuide", url, { shouldValidate: true });
      setFilePreview(url);
    } catch (error: any) {
      toast.error(error.message || en.failed_to_upload_image);
    } finally {
      setIsFileLoading(false);
    }
  };

  const handleRemoveFile = async () => {
    if (tempUploadPathRef.current) {
      try {
        await deleteTempFile(tempUploadPathRef.current);
        tempUploadPathRef.current = null;
      } catch (error: any) {
        toast.error(error.message || en.failed_to_remove_image);
        return;
      }
    }
    
    setValue("sizeGuide", "", { shouldValidate: true });
    setFilePreview(null);
  };

  const handleClose = () => {
    if (tempUploadPathRef.current) {
      deleteTempFile(tempUploadPathRef.current).catch(() => null);
      tempUploadPathRef.current = null;
    }
    props.onOpenChange(false);
    reset();
    setFilePreview(null);
  };

  // react queries
  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: (data: CategorySchema) => updateCategoryById(props.selectedCategory!.id, data),
    onSuccess: (response) => {
      if (response.success) {
        tempUploadPathRef.current = null;
        handleClose();
        queryClient.invalidateQueries({ queryKey: ["categories"] });
        toast.success(en.category_updated_successfully);
      } else {
        toast.error(response.error || en.category_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.category_update_failed);
    },
  });

  const onSubmit = (data: CategorySchema) => updateCategory(data);

  const isBusy = isPending || isFileLoading;

  const isExistingImage =
    filePreview !== null &&
    filePreview === props.selectedCategory?.sizeGuide &&
    tempUploadPathRef.current === null;

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{en.edit_category_title}</DialogTitle>
          <DialogDescription>{en.edit_category_subtitle}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-name">{en.name}</Label>
                <div className="flex flex-col">
                  <Input id="edit-name" placeholder="Name" {...register("name")} disabled={isBusy} />
                  {errors.name && <span className="text-sm text-red-500">{errors.name.message}</span>}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-slug">{en.slug}</Label>
                <div className="flex flex-col">
                  <Input id="edit-slug" placeholder="Slug" {...register("slug")} disabled={isBusy} />
                  {errors.slug && <span className="text-sm text-red-500">{errors.slug.message}</span>}
                </div>
              </Field>
            </FieldGroup>

            <Field className="flex flex-col gap-2">
              <Label htmlFor="edit-description">{en.description}</Label>
              <Textarea
                id="edit-description"
                placeholder="Type a description for this category"
                {...register("description")}
                disabled={isBusy}
              />
            </Field>

            <FieldGroup className="flex flex-col">
              <FieldGroup className="flex flex-row gap-4">
                <Field className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="edit-sortOrder">{en.sort_order}</Label>
                  <div className="flex flex-col">
                    <Input
                      id="edit-sortOrder"
                      type="number"
                      {...register("sortOrder", { valueAsNumber: true })}
                      disabled={isBusy}
                    />
                    {errors.sortOrder && <span className="text-sm text-red-500">{errors.sortOrder.message}</span>}
                  </div>
                </Field>
                <Field className="flex flex-col gap-2 flex-3">
                  <Label htmlFor="edit-sizeGuideImage">{en.size_guide_image}</Label>
                  <div>
                    <Input
                      id="edit-sizeGuideImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isBusy}
                    />
                    {isFileLoading && (
                      <span className="text-sm text-muted-foreground">Uploading...</span>
                    )}
                    {errors.sizeGuide && (
                      <span className="text-sm text-red-500">{errors.sizeGuide.message as string}</span>
                    )}
                  </div>
                </Field>
              </FieldGroup>

              {isFileLoading && (
                <div className="flex items-center justify-center mt-2 p-4 border rounded-lg">
                  <LoaderCircle className="animate-spin w-6 h-6 mr-2" />
                  <span>{en.loading}</span>
                </div>
              )}

              {filePreview && !isFileLoading && (
                <div className="relative mt-2 border rounded-lg p-2">
                  <img
                    src={filePreview}
                    alt="Size guide preview"
                    className="max-h-40 mx-auto rounded"
                  />
                  {isExistingImage && (
                    <span className="absolute top-2 left-2 text-xs bg-black/50 text-white rounded px-2 py-0.5">
                      Current image
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveFile}
                    disabled={isBusy}
                  >
                    {en.remove}
                  </Button>
                </div>
              )}
            </FieldGroup>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isBusy || !hasChanges} >
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
                  {en.saving}
                </>
              ) : (
                "Save Category"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
              {en.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}