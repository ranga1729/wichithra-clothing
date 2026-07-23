'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Color } from "@/generated/prisma/client";
import { en } from "@/lib/i18n/en";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { updateColorById } from "./action";
import { uploadTempFile, deleteTempFile } from "@/components/providers/supabase/storage";
import toast from "react-hot-toast";
import { updateColorSchema, UpdateColorSchema } from "@/schemas/admin-schemas";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColor?: Color;
}

export default function UpdateModal(props: Props) {
  const queryClient = useQueryClient();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [tempPath, setTempPath] = useState<string | null>(null);
  const [swatchMarkedForRemoval, setSwatchMarkedForRemoval] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register, handleSubmit,
    setValue, reset, watch,
    formState: { errors, isValid },
  } = useForm<UpdateColorSchema>({
    resolver: zodResolver(updateColorSchema) as any,
    mode: "onChange",
    defaultValues: {
      id: "",
      name: "",
      hexCode: "",
      isActive: true,
      swatchImageUrl: null,
    },
  });

  const currentFormData = watch();

  useEffect(() => {
    if (props.selectedColor && props.isModalOpen) {
      setValue("id", props.selectedColor.id);
      setValue("name", props.selectedColor.name);
      setValue("hexCode", props.selectedColor.hexCode ?? "");
      setValue("isActive", props.selectedColor.isActive);
      setValue("swatchImageUrl", props.selectedColor.swatchImageUrl || null);
      setFilePreview(props.selectedColor.swatchImageUrl || null);
      setTempPath(null);
      setSwatchMarkedForRemoval(false);
    }
  }, [props.selectedColor?.id, props.selectedColor?.swatchImageUrl, props.isModalOpen]);

  useEffect(() => {
    if (!props.isModalOpen) {
      reset();
      setFilePreview(null);
      setTempPath(null);
      setSwatchMarkedForRemoval(false);
    }
  }, [props.isModalOpen, reset]);

  const hasChanges = useMemo(() => {
    if (!props.selectedColor) return false;
    const nameChanged = currentFormData.name !== props.selectedColor.name;
    const hexCodeChanged = currentFormData.hexCode !== (props.selectedColor.hexCode ?? "");
    const swatchChanged = tempPath !== null || swatchMarkedForRemoval;
    return nameChanged || hexCodeChanged || swatchChanged;
  }, [currentFormData, props.selectedColor, tempPath, swatchMarkedForRemoval]);

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
      setValue("swatchImageUrl", url, { shouldDirty: true });
      setSwatchMarkedForRemoval(false);
    } catch (err: any) {
      toast.error(err.message || en.failed_to_upload_image);
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveSwatch = () => {
    if (tempPath) {
      deleteTempFile(tempPath).catch(() => null);
    }
    setTempPath(null);
    setFilePreview(null);
    setValue("swatchImageUrl", null, { shouldDirty: true });
    if (props.selectedColor?.swatchImageUrl) setSwatchMarkedForRemoval(true);
  };

  const handleClose = () => {
    if (tempPath) {
      deleteTempFile(tempPath).catch(() => null);
    }
    setTempPath(null);
    setSwatchMarkedForRemoval(false);
    props.onOpenChange(false);
    reset();
    setFilePreview(null);
  };

  const { mutate: updateColor, isPending } = useMutation({
    mutationFn: (data: UpdateColorSchema) => updateColorById(data),
    onSuccess: (response) => {
      if (response.success) {
        setTempPath(null);
        setSwatchMarkedForRemoval(false);
        handleClose();
        queryClient.invalidateQueries({ queryKey: ['colors'] });
        toast.success(en.color_updated_successfully);
      } else {
        toast.error(response.error || en.color_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.color_update_failed);
    },
  });

  const onSubmit = (data: UpdateColorSchema) => updateColor(data);

  const isBusy = isPending || isUploading;

  const isExistingImage =
    filePreview !== null &&
    filePreview === props.selectedColor?.swatchImageUrl &&
    tempPath === null;

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b-2 pb-2">
          <DialogTitle> {en.edit_color_title} </DialogTitle>
          <DialogDescription>
            {en.edit_color_subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4 items-center justify-center">
              <Field className="flex flex-col gap-2 flex-2">
                <Label htmlFor="edit-name"> {en.name} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-name"
                    placeholder="Name"
                    {...register("name")}
                    disabled={isBusy}
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500">
                      {errors.name.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-hexCode"> {en.hexCode} </Label>
                <div className="flex flex-col">
                  <div className="relative">
                    <Item className="absolute left-1 top-1 p-1 m-0" variant={"default"} > # </Item>
                    <Input
                      id="edit-hexCode"
                      placeholder="345678"
                      {...register("hexCode")}
                      disabled={isBusy}
                      className="pl-6"
                    />
                  </div>
                  {errors.hexCode && (
                    <span className="text-sm text-red-500">
                      {errors.hexCode.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 w-fit">
                <Label htmlFor="preview"> {en.preview} </Label>
                <div id="preview" className="flex items-center justify-center h-full">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="swatch preview"
                      className="w-9 h-9 rounded-sm border border-neutral-400 object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full border border-neutral-400" style={{ backgroundColor: currentFormData.hexCode ? `#${currentFormData.hexCode}` : 'transparent' }} />
                  )}
                </div>
              </Field>
            </FieldGroup>

            <FieldGroup className="flex flex-row gap-4 items-start">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-swatch-image"> Swatch Image </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="edit-swatch-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isBusy}
                  />
                </div>
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
                      alt="Swatch preview"
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
                      onClick={handleRemoveSwatch}
                      disabled={isBusy}
                    >
                      {en.remove}
                    </Button>
                  </div>
                )}
              </Field>
            </FieldGroup>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isPending || !hasChanges || !isValid}>
              {isPending ? <>
                  <LoaderCircle className="animate-spin w-8 h-8" /> {en.saving}
                </> : <>{en.save}</> }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              {en.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
