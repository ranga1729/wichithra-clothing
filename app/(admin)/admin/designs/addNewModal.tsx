import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { designSchema, DesignSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDesign } from "./action";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { en } from "@/lib/i18n/en";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SaveButton from "@/components/SaveButton";
import CancelButton from "@/components/CancelButton";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddNewModal(props: Props) {
  const queryClient = useQueryClient();

  const {
    register, handleSubmit,
    getValues, reset,
    formState: { errors },
  } = useForm<DesignSchema>({
    resolver: zodResolver(designSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  });

  // const onSubmit = async (data: DesignSchema) => {
  //   try {
  //     setIsSubmitting(true);
  //     const newDesign = getValues();
  //     const result = await createDesign(newDesign);

  //     if (result.success) {
  //       toast.success(en.design_created_successfully);
  //       reset();
  //       props.onOpenChange(false);
  //     } else {
  //       toast.error(result.error || en.failed_to_create_design);
  //     }
  //   } catch (error) {
  //     toast.error(en.failed_to_create_design);
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
  }

  // react queries
  const {mutate: createNewColor, isPending } = useMutation({
    mutationFn: (data: DesignSchema) => createDesign(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['designs'] });
        toast.success(en.design_created_successfully);
        reset();
        props.onOpenChange(false);
      } else {
        toast.error(response.error || en.failed_to_create_design);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_create_design);
    }
  });

  const onSubmit = (data: DesignSchema) => createNewColor(data);

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> {en.create_design_title} </DialogTitle>
          <DialogDescription>
            {en.create_design_subtitle}
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
                placeholder="Type a description for this new design"
                {...register("description")}
                disabled={isPending}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <SaveButton isPending={isPending} />
            <CancelButton onClick={handleCancel} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}