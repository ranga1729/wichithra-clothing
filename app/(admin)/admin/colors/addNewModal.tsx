import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Item } from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { en } from "@/lib/i18n/en";
import { colorSchema, ColorSchema, designSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { createColor } from "./action";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  fetchData: () => void;
}

export default function AddNewModal(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register, handleSubmit,
    getValues, reset,
    formState: { errors },
  } = useForm<ColorSchema>({
    resolver: zodResolver(colorSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      hexCode: "",
    },
  });

  const onSubmit = async (data: ColorSchema) => {
    try {
      setIsSubmitting(true);
      const newColor = getValues();
      const result = await createColor(newColor);

      if (result.success) {
        toast.success(en.design_created_successfully);
        reset();
        props.onOpenChange(false);
        props.fetchData()
      } else {
        toast.error(result.error || en.failed_to_create_design);
      }
    } catch (error) {
      toast.error(en.failed_to_create_design);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
  }

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
                <Label htmlFor="new-slug"> {en.hexCode} </Label>
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
                <Label htmlFor="preview"> {en.preview} </Label>
                <div id="preview" className="flex items-center justify-center h-full">
                  <div  className="w-9 h-9 rounded-full border border-neutral-400" style={{backgroundColor: `#${getValues().hexCode}`}}>
                  
                  </div>
                </div>
              </Field>
              
            </FieldGroup>

            
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <>
                  <LoaderCircle className="animate-spin w-8 h-8" /> {en.saving}
                </> : <>{en.save}</> }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              {en.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

}