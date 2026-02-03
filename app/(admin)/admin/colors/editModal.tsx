'use client'

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { Color } from "@/generated/prisma/client";
import { en } from "@/lib/i18n/en";
import { colorSchema, ColorSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateColor } from "./action";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColor?: Color;
  fetchData: () => void;
}

export default function EditModal(props: Props) {
  const [prevData, setPrevData] = useState<Color>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register, handleSubmit,
    setValue, reset, watch,
    formState: { errors, isValid },
  } = useForm<ColorSchema>({
    resolver: zodResolver(colorSchema),
    mode: "onChange",
    defaultValues: {
      name: props.selectedColor?.name,
      hexCode: props.selectedColor?.hexCode!,
    },
  });

  const currentFormData = watch();

  const hasChanges = useMemo(() => {
    if(!prevData) return false;

    const nameChanged = currentFormData.name !== prevData.name;
    const hexCodechnaged = currentFormData.hexCode !== prevData.hexCode;

    return nameChanged || hexCodechnaged;
  }, [currentFormData, prevData])

  const onSubmit = async (data: ColorSchema) => {

    if (!hasChanges) {
      toast.error(en.messages.no_changes_detected);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await updateColor(prevData?.id!, data);

      if (!response.success) {
        toast.error(response.error || en.messages.color_update_failed);
        reset();
        props.onOpenChange(false);
        return;
      }

      toast.success(en.messages.color_updated_successfully);
      props.onOpenChange(false);
      reset();
      setPrevData(undefined);
      props.fetchData()

    } catch (error) {
      toast.error(en.messages.color_update_failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
    setPrevData(undefined);
  }

  useEffect(() => {
    setPrevData(props.selectedColor)
    setValue("name", props.selectedColor?.name!)
    setValue("hexCode", props.selectedColor?.hexCode!)
  }, [props.selectedColor])

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b-2 pb-2">
          <DialogTitle> {en.texts.color.create_color_title} </DialogTitle>
          <DialogDescription>
            {en.texts.color.create_color_subtitle}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-row gap-4 items-center justify-center">
            <Field className="flex flex-col gap-2 flex-2">
              <Label htmlFor="new-name"> {en.input_labels.name} </Label>
              <div className="flex flex-col">
                <Input
                  id="new-name"
                  placeholder="Name"
                  {...register("name")}
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <span className="text-sm text-red-500">
                    {errors.name.message as string}
                  </span>
                )}
              </div>
            </Field>
            <Field className="flex flex-col gap-2 flex-1">
              <Label htmlFor="new-slug"> {en.input_labels.hexCode} </Label>
              <div className="flex flex-col">
                <div className="relative">
                  <Item className="absolute left-1 top-1 p-1 m-0" variant={"default"} > # </Item>
                  <Input
                    id="new-slug"
                    placeholder="345678"
                    {...register("hexCode")}
                    disabled={isSubmitting}
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
              <Label htmlFor="preview"> {en.input_labels.preview} </Label>
              <div id="preview" className="flex items-center justify-center h-full">
                <div  className="w-9 h-9 rounded-full border border-neutral-400" style={{backgroundColor: `#${currentFormData.hexCode}`}}>
                
                </div>
              </div>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting || !hasChanges || !isValid}>
              {isSubmitting ? <>
                  <LoaderCircle className="animate-spin w-8 h-8" /> {en.common.status.saving}
                </> : <>{en.common.buttons.save}</>}
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
        </form>
      </DialogContent>
    </Dialog>
  )
}