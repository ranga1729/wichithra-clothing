import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { designSchema, DesignSchema } from "@/schemas/admin-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { updateDesign } from "./action";
import toast from "react-hot-toast";
import { LoaderCircle } from "lucide-react";
import { Design } from "@/types/common-types";
import { en } from "@/lib/i18n/en";

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDesign?: Design;
}

export default function EditModal(props: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const onSubmit = async (data: DesignSchema) => {

    if (!hasChanges) {
      toast.error("No changes detected");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("id", prevData?.id || "");
      formData.append("name", data.name);
      formData.append("slug", data.slug);

      const result = await updateDesign(prevData!.id, data);

      if (!result.success) {
        toast.error(result.error || en.messages.design_update_failed);
        reset();
        props.onOpenChange(false);
      }

      toast.success(en.messages.design_update_successfully);
      props.onOpenChange(false);
      reset();
      setPrevData(undefined);

    } catch (error) {
      toast.error(en.messages.design_update_failed);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    props.onOpenChange(false);
    reset();
    setPrevData(undefined);
  }

  const handleFormSubmit = (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(onSubmit)();
  };

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

  useEffect(() => {
    if (!props.isModalOpen) {
      reset();
      setPrevData(undefined);
    }
  }, [props.isModalOpen, reset]);

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle> {en.texts.design.create_design_title} </DialogTitle>
          <DialogDescription>
            {en.texts.design.create_design_subtitle}
          </DialogDescription>
        </DialogHeader>

        <div>
          <FieldGroup className="flex flex-col gap-4">
            <FieldGroup className="flex flex-row gap-4">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="edit-name"> {en.input_labels.name} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-name"
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
                <Label htmlFor="edit-slug"> {en.input_labels.slug} </Label>
                <div className="flex flex-col">
                  <Input
                    id="edit-slug"
                    placeholder="Slug"
                    {...register("slug")}
                    disabled={isSubmitting}
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
              <Label htmlFor="edit-description"> {en.input_labels.description} </Label>
              <Textarea
                id="edit-description"
                placeholder="Type a description for this design"
                {...register("description")}
                disabled={isSubmitting}
              />
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button 
              type="button"
              onClick={handleFormSubmit}
              disabled={isSubmitting || !hasChanges}
            > 
              {isSubmitting ? (
                <>
                  <LoaderCircle className="animate-spin w-4 h-4 mr-2" /> {en.common.status.saving}
                </>
              ) : (
                "Save Design"
              )}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}