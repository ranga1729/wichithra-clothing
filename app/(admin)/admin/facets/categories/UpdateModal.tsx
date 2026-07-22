"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { updateCategoryById } from "./action";
import { uploadTempFile, deleteTempFile } from "@/components/providers/supabase/storage";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { en } from "@/lib/i18n/en";
import { Category } from "@/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCategorySchema, UpdateCategorySchema } from "@/schemas/admin-schemas";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCategory?: Category;
}

export default function UpdateModal(props: Props) {
  const queryClient = useQueryClient();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [sizeGuideMarkedForRemoval, setSizeGuideMarkedForRemoval] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register, handleSubmit,
    setValue, reset, watch,
    formState: { errors },
  } = useForm<UpdateCategorySchema>({
    resolver: zodResolver(updateCategorySchema),
    mode: "onChange",
    defaultValues: {
      id: "",
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      isActive: true,
    },
  });

  const currentFormData = watch();

  useEffect(() => {
    if (props.selectedCategory && props.isModalOpen) {
      setValue("id", props.selectedCategory.id);
      setValue("name", props.selectedCategory.name);
      setValue("slug", props.selectedCategory.slug);
      setValue("description", props.selectedCategory.description || "");
      setValue("sortOrder", props.selectedCategory.sortOrder || 0);
      setValue("isActive", props.selectedCategory.isActive);
      setValue("sizeGuide", props.selectedCategory.sizeGuide || null);
      setFilePreview(props.selectedCategory.sizeGuide || null);
      setTempPath(null);
      setSizeGuideMarkedForRemoval(false);
    }
  }, [props.selectedCategory?.id, props.selectedCategory?.sizeGuide, props.isModalOpen]);

  useEffect(() => {
    if (!props.isModalOpen) {
      reset();
      setFilePreview(null);
      setTempPath(null);
      setSizeGuideMarkedForRemoval(false);
    }
  }, [props.isModalOpen, reset]);

  const hasChanges = useMemo(() => {
    if (!props.selectedCategory) return false;
    const sizeGuideChanged = tempPath !== null || sizeGuideMarkedForRemoval;
    return (
      currentFormData.name !== props.selectedCategory.name ||
      currentFormData.slug !== props.selectedCategory.slug ||
      currentFormData.description !== (props.selectedCategory.description || "") ||
      currentFormData.sortOrder !== (props.selectedCategory.sortOrder || 0) ||
      sizeGuideChanged
    );
  }, [currentFormData, props.selectedCategory, tempPath, sizeGuideMarkedForRemoval]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { path, url } = await uploadTempFile(file);
      if (tempPath) {
        deleteTempFile(tempPath).catch(() => null);
      }
      setTempPath(path);
      setFilePreview(url);
      setValue("sizeGuide", url, { shouldDirty: true });
      setSizeGuideMarkedForRemoval(false);
    } catch (err: any) {
      toast.error(err.message || en.failed_to_upload_image);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = () => {
    if (tempPath) {
      deleteTempFile(tempPath).catch(() => null);
    }
    setTempPath(null);
    setFilePreview(null);
    setValue("sizeGuide", null, { shouldDirty: true });
    if (props.selectedCategory?.sizeGuide) setSizeGuideMarkedForRemoval(true);
  };

  const handleClose = () => {
    if (tempPath) {
      deleteTempFile(tempPath).catch(() => null);
    }
    setTempPath(null);
    setSizeGuideMarkedForRemoval(false);
    props.onOpenChange(false);
    reset();
    setFilePreview(null);
  };

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: (data: UpdateCategorySchema) => updateCategoryById(data),
    onSuccess: (response) => {
      if (response.success) {
        setTempPath(null);
        setSizeGuideMarkedForRemoval(false);
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

  const onSubmit = (data: UpdateCategorySchema) => updateCategory(data);

  const isBusy = isPending || isUploading;

  const isExistingImage =
    filePreview !== null &&
    filePreview === props.selectedCategory?.sizeGuide &&
    tempPath === null;

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
                  </div>
                </Field>
              </FieldGroup>

              {isUploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <LoaderCircle className="animate-spin w-4 h-4" />
                  Uploading...
                </div>
              )}
              {filePreview && !isUploading && (
                <div className="relative mt-2 border rounded-lg p-2">
                  <img
                    src={filePreview}
                    alt="Size guide preview"
                    className="max-h-60 mx-auto rounded object-contain"
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
