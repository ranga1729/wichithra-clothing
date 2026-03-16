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
import { createCategory } from "./action";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
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

  const {
    register, handleSubmit,
    setValue, reset,
    formState: { errors },
  } = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      sizeGuide: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("sizeGuide", file, { shouldValidate: true });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFilePreview(null);
    setValue("sizeGuide", undefined);
  };

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
  }

  // react query
  const { mutate: createNewCategory, isPending } = useMutation({
    mutationFn: (data: CategorySchema) => createCategory(data),
    onSuccess: (response) => {
      if (response.success) {
        console.log(response.message)
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
                    {errors.sizeGuide && (
                      <span className="text-sm text-red-500">
                        {errors.sizeGuide.message as string}
                      </span>
                    )}                
                  </div>
                </Field>
              </FieldGroup>
              {filePreview && (
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
            <CancelButton disabled={isPending} onClick={handleCancel} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}