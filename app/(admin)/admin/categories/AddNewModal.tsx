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

interface Props {
  isModalOpen: boolean;
  onOpenChange: (open:boolean) => void;
}

export default function AddNewModal(props: Props) {
  const {
    register, getValues, setValue,
    formState: { errors }
  } = useForm<CategorySchema>({
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      sortOrder: 0,
      sizeGuide: ""
    }
  })

  const handleSave = () => {
    const values = getValues();
    console.log("Add new: ", values)
  }

  // configure RHF to hanlde modal data
  // make a server action to create a new cat
  // name and slug is required. show error data when submit

  // try to figure out a way to sizeguide input to accept images and the submit it as a string
  // try to save the image in a code name ex: "cat-202405"
  // save this code-nam in the database as a string
  // save the image into a folder in the local project



  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
        <DialogContent className="dark:bg-neutral-800">
          <DialogHeader>
            <DialogTitle>Create New Category</DialogTitle>
            <DialogDescription>
              Enter the details for the new product category here.
            </DialogDescription>
          </DialogHeader>
          
          <FieldGroup className="flex flex-col gap-2">
            <FieldGroup className="flex flex-row">
              <Field className="flex flex-col gap-2">
                <Label htmlFor="new-name">Name *</Label>
                <Input 
                  id="new-name" placeholder="Name"
                  {...register("name")}
                />
              </Field>
              <Field className="flex flex-col gap-2">
                <Label htmlFor="new-slug">Slug *</Label>
                <Input 
                  id="new-slug" placeholder="Slug"
                  {...register("slug")}
                />
              </Field>
            </FieldGroup>
            

            <Field className="flex flex-col gap-2">
              <Label htmlFor="new-description">Description</Label>
              <Textarea 
                id="new-description" 
                placeholder="Type a description for this new category" 
                {...register("description")}
              />
            </Field>

            <FieldGroup className="flex flex-row">
              <Field className="flex flex-col gap-2 flex-1">
                <Label htmlFor="new-sortOrder">Sort order</Label>
                <Input 
                  id="new-sortOrder" 
                  type="number" 
                  {...register("sortOrder")}
                />
              </Field>
              <Field className="flex flex-col gap-2 flex-4">
                <Label htmlFor="new-sizeGuideImage">Size guide image</Label>
                <Input 
                  id="new-sizeGuideImage"
                  type="file"
                  accept="image/*"
                {...register("sizeGuide")}
              />
              </Field>
            </FieldGroup>

          </FieldGroup>
          
          <DialogFooter>
            <Button type="button" onClick={handleSave}>Save Category</Button>
            <Button type="button" onClick={() => props.onOpenChange(false)}>Cancel</Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>
  )
}