'use client'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldContent, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import SaveButton from "@/components/SaveButton"
import CancelButton from "@/components/CancelButton"
import { CreateCollectionSchema, createCollectionSchema } from "@/schemas/admin-schemas"
import { en } from "@/lib/i18n/en"
import toast from "react-hot-toast"
import { createCollection } from "./actions"

interface Props {
  isModalOpen: boolean
  onOpenChange: (open: boolean) => void
}

export default function CreateCollectionModal(props : Props) {
  const queryClient = useQueryClient()

  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm<CreateCollectionSchema>({
    resolver: zodResolver(createCollectionSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      slug: "",
      description: "",
    },
  })

  // React query to create a new collection
  const { mutate: CreateCollection, isPending } = useMutation({
    mutationFn: (data: CreateCollectionSchema) => createCollection(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["collections"] })
        toast.success(en.collection_created_successfully)
        reset()
        props.onOpenChange(false)
      } else {
        toast.error(response.error || en.failed_to_create_collection)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.failed_to_create_collection)
    },
  })

  const onSubmit = (data: CreateCollectionSchema) => CreateCollection(data)

  const handleCancel = () => {
    reset()
    props.onOpenChange(false)
  }

  return (
    <Dialog open={props.isModalOpen} onOpenChange={props.onOpenChange}>
      <DialogContent className="dark:bg-neutral-800 max-h-[90vh] overflow-y-auto">
        
        {/* Modal header */}
        <DialogHeader>
          <DialogTitle>{en.create_collection_title}</DialogTitle>
          <DialogDescription>{en.create_collection_subtitle}</DialogDescription>
        </DialogHeader>
        
        {/* Dialog content */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup className="flex flex-col gap-4">
            
            {/* Name input */}
            <Field orientation="vertical">
              <FieldContent>
                <FieldLabel htmlFor="name">{en.name} *</FieldLabel>
              </FieldContent>
              <div className="flex flex-col gap-1">
                <Input
                  id="name"
                  placeholder={en.collection_name_placeholder}
                  {...register("name")}
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
            </Field>

            {/* Slug input */}
            <Field orientation="vertical">
              <FieldContent>
                <FieldLabel htmlFor="slug">{en.slug} *</FieldLabel>
              </FieldContent>
              <div className="flex flex-col gap-1">
                <Input
                  id="slug"
                  placeholder={en.collection_slug_placeholder}
                  {...register("slug")}
                  aria-invalid={!!errors.slug}
                />
                {errors.slug && (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                )}
              </div>
            </Field>

            {/* Description input */}
            <Field orientation="vertical">
              <FieldContent>
                <FieldLabel htmlFor="description">{en.description}</FieldLabel>
              </FieldContent>
              <div className="flex flex-col gap-1">
                <Textarea
                  id="description"
                  placeholder={en.collection_description_placeholder}
                  {...register("description")}
                  rows={3}
                />
              </div>
            </Field>
          </FieldGroup>

          {/* Dialog footer */}
          <DialogFooter className="mt-6">
            <CancelButton onClick={handleCancel} isPending={isPending} />
            <SaveButton isPending={isPending} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
