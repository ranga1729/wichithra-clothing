import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { designSchema, DesignSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { updateDesignById } from "./action";
import toast from "react-hot-toast";
import { en } from "@/lib/i18n/en";
import { Design } from "@/generated/prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SaveButton from "@/components/SaveButton";
import CancelButton from "@/components/CancelButton";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDesign?: Design;
}

export default function EditModal(props: Props) {
  const queryClient = useQueryClient();
  const [prevData, setPrevData] = useState<Design>();

  const {
    register, handleSubmit,
    setValue, reset, watch,
    formState: { errors },
  } = useForm<DesignSchema>({
    resolver: zodResolver(designSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  const currentFormData = watch();

  const hasChanges = useMemo(() => {
    if(!prevData) return false;

    const nameChanged = currentFormData.name !== prevData.name;
    const slugChanged = currentFormData.slug !== prevData.slug;
    const descriptionChanged = currentFormData.description !== prevData.description;

    return nameChanged || slugChanged || descriptionChanged;
  }, [currentFormData, prevData])

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
  }

  useEffect(() => {
    const loadDesignData = async () => {
      if (props.selectedDesign) {
        setValue("name", props.selectedDesign.name);
        setValue("slug", props.selectedDesign.slug);
        setValue("description", props.selectedDesign.description || "");
                
        setPrevData(props.selectedDesign);
      }
    };

    loadDesignData();
  }, [props.selectedDesign]);

  // react query
  const { mutate: updateDesign, isPending } = useMutation({
    mutationFn: ({id, data}:{id: string, data: DesignSchema}) => updateDesignById(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['designs'] });
        toast.success(en.design_updated_successfully);
        reset();
        props.onOpenChange(false);
        setPrevData(undefined);
      } else {
        toast.error(response.error || en.design_update_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.design_update_failed);
    },
  });

  const onSubmit = (data: DesignSchema) => updateDesign({id: prevData?.id!, data: data})
  
  return (
    <Dialog open={props.isModalOpen} onOpenChange={handleCancel}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> {en.edit_design_title} </DialogTitle>
          <DialogDescription>
            {en.create_design_subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-name"> {en.name} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-name"
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
                <Label htmlFor="edit-slug"> {en.slug} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-slug"
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
              <Label htmlFor="edit-description"> {en.description} </Label>
              <Textarea
                id="edit-description"
                placeholder="Type a description for this design"
                {...register("description")}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <SaveButton isPending={isPending} disabled={isPending || !hasChanges} />
            <CancelButton onClick={handleCancel} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}