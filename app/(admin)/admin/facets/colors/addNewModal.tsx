import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { en } from "@/lib/i18n/en";
import { colorSchema, ColorSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createColor, updateColorSwatch } from "./action";
import toast from "react-hot-toast";
import SaveButton from "@/components/SaveButton";
import CancelButton from "@/components/CancelButton";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddNewModal(props: Props) {
  const queryClient = useQueryClient();
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register, handleSubmit, watch,
    reset, formState: { errors },
  } = useForm<ColorSchema>({
    resolver: zodResolver(colorSchema) as any,
    mode: "onChange",
    defaultValues: {
      name: "",
      hexCode: "",
    },
  });

  const hexCode = watch("hexCode");

  const handleCancel = () => {
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
    props.onOpenChange(false);
    reset();
  }

  // react queries
  const {mutate: createNewColor, isPending } = useMutation({
    mutationFn: async (data: ColorSchema) => {
      const response = await createColor(data);
      if (response.success && selectedFile && response.data?.colorId) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const swatchRes = await updateColorSwatch(response.data.colorId, formData);
        if (!swatchRes.success) toast.error(swatchRes.error || en.failed_to_upload_image);
      }
      return response;
    },
    onSuccess: (response) => {
      if (response.success) {
        if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
        setSelectedFile(null);
        setFilePreview(null);
        queryClient.invalidateQueries({ queryKey: ['colors'] });
        toast.success(en.color_created_successfully);
        reset();
        props.onOpenChange(false);
      } else {
        toast.error(response.error || en.failed_to_create_color);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_create_color);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setSelectedFile(file);
    setFilePreview(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    if (filePreview && filePreview.startsWith("blob:")) URL.revokeObjectURL(filePreview);
    setSelectedFile(null);
    setFilePreview(null);
  };

  const onSubmit = (data: ColorSchema) => createNewColor(data);

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> {en.create_color_title} </DialogTitle>
          <DialogDescription>
            {en.create_color_subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4 items-center justify-center">
              <Field className="flex flex-col gap-2 flex-2">
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
                <Label htmlFor="new-slug"> {en.hexCode} </Label>
                <div className="flex flex-col">
                  <div className="relative">
                    <Item className="absolute left-1 top-1 p-1 m-0" variant={"default"} > # </Item>
                    <Input
                      id="new-slug"
                      placeholder="345678"
                      {...register("hexCode")}
                      disabled={isPending}
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
                    <div className="w-9 h-9 rounded-full border border-neutral-400" style={{ backgroundColor: hexCode ? `#${hexCode}` : 'transparent' }} />
                  )}
                </div>
              </Field>
              
            </FieldGroup>

            <FieldGroup className="flex flex-row gap-4 items-start">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="new-swatch-image"> Swatch Image </Label>
                <div className="flex flex-col gap-2">
                  <Input
                    id="new-swatch-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="cursor-pointer"
                    onChange={handleFileChange}
                    disabled={isPending}
                  />
                </div>
                {filePreview && (
                  <div className="flex flex-col gap-2 mt-2">
                    <img
                      src={filePreview}
                      alt="Swatch preview"
                      className="max-h-60 rounded object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isPending}
                    >
                      {en.remove}
                    </Button>
                  </div>
                )}
              </Field>
            </FieldGroup>
            
          </FieldGroup>

          <DialogFooter className="mt-6">
            <SaveButton isPending={isPending} />
            <CancelButton onClick={handleCancel} disabled={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

}