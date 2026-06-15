import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { categorySchema, CategorySchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createCategory, updateCategorySizeGuide } from "./action";
import toast from "react-hot-toast";
import { en } from "@/lib/i18n/en";
import SaveButton from "@/components/SaveButton";
import CancelButton from "@/components/CancelButton";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddNewModal(props: Props) {
  const queryClient = useQueryClient();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register, handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if(!file) return;
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const handleClose = () => {
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    props.onOpenChange(false);
    reset();
  }

  const { mutate: createNewCategory, isPending } = useMutation({
    mutationFn: async (data: CategorySchema) => {
      const response = await createCategory(data);
      if (response.success && selectedFile && response.data?.categoryId) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const sizeGuideRes = await updateCategorySizeGuide(response.data.categoryId, formData);
        if (!sizeGuideRes.success) toast.error(sizeGuideRes.error || en.failed_to_upload_image);
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
        setSelectedFile(null);
        setFilePreview(null);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        toast.success(en.category_created_successfully);
        reset();
        props.onOpenChange(false);
      } else {
        toast.error(response.error || en.failed_to_create_category);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_create_category);
    }
  })

  const onSubmit = (data: CategorySchema) => createNewCategory(data);

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
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="new-name"> {en.name} </Label>
                <div className="flex flex-col">
                  <Input
                    id="new-name"
                    placeholder="Name"
                    {...register("name")}
                    disabled={isPending}
                  />
                  {errors.name && (
                    <span className="text-sm text-red-500">
                      {errors.name.message as string}
                    </span>
                  )}
                </div>
              </Field>
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="new-slug"> {en.slug} </Label>
                <div className="flex flex-col">
                  <Input
                    id="new-slug"
                    placeholder="Slug"
                    {...register("slug")}
                    disabled={isPending}
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
              <Label htmlFor="new-description"> {en.description} </Label>
              <Textarea
                id="new-description"
                placeholder="Type a description for this new category"
                {...register("description")}
                disabled={isPending}
              />
            </Field>

            <FieldGroup className="flex flex-col">
              <FieldGroup className="flex flex-row">
                <Field className="flex flex-col gap-2 flex-1">
                  <Label htmlFor="new-sortOrder"> {en.sort_order} </Label>
                  <div className="flex flex-col">
                    <Input
                      id="new-sortOrder"
                      type="number"
                      {...register("sortOrder", { valueAsNumber: true })}
                      disabled={isPending}
                    />
                    {errors.sortOrder && (
                      <span className="text-sm text-red-500">
                        {errors.sortOrder.message as string}
                      </span>
                    )}
                  </div>
                </Field>
                <Field className="flex flex-col gap-2 flex-3">
                  <Label htmlFor="new-sizeGuideImage"> {en.size_guide_image} </Label>
                  <div>
                    <Input
                      id="new-sizeGuideImage"
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isPending}
                    />
                  </div>
                </Field>
              </FieldGroup>
              {filePreview && (
                <div className="relative mt-2 border rounded-lg p-2">
                  <img
                    src={filePreview}
                    alt="Size guide preview"
                    className="max-h-60 mx-auto rounded object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveFile}
                    disabled={isPending}
                  >
                    {en.remove}
                  </Button>
                </div>
              )}
            </FieldGroup>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <SaveButton isPending={isPending} />
            <CancelButton disabled={isPending} onClick={handleClose} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}