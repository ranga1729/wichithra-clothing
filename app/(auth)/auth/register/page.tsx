"use client"

import { CustomerForm } from "@/components/custom/auth/customer-form"
import { AddressForm } from "@/components/custom/auth/address-form"
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { registrationSchema, type RegistrationForm } from "@/schemas/auth-schemas"
import toast from "react-hot-toast"
import { registerUser } from "./actions"
import { useRouter } from "next/navigation"
import { en } from "@/lib/i18n/en"
import { useMutation } from "@tanstack/react-query"
import { LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export default function Register() {
  const router = useRouter()

  const form = useForm<RegistrationForm>({
    resolver: zodResolver(registrationSchema),
    mode: "onChange",
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      mobilePhoneNumber: "",
      homePhoneNumber: "",
      houseNo: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      province: "",
      zipCode: "",
    },
  })

  const { mutate: register, isPending } = useMutation({
    mutationFn: (data: RegistrationForm) => registerUser(data),
    onSuccess: (result) => {
      if (result.success && result.message) {
        toast.success(result.message)
        router.push("/auth/login")
      } else {
        toast.error(result.message || en.registration_failed)
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.registration_failed)
    },
  })

  const onSubmit = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      register(form.getValues())
    } else {
      toast.error(en.fill_all_required_fileds)
    }
  }

  return (
    <div className="w-full max-w-2xl space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {en.register_title}
        </h1>
        <p className="text-muted-foreground">{en.register_subtitle}</p>
      </div>

      <div className="space-y-6">
        <FieldGroup className="w-full flex flex-col md:flex-row gap-6">
          <Field className="border border-border p-4 rounded-lg flex-1 space-y-4">
            <p className="text-center font-semibold text-foreground">
              {en.user_information}
            </p>
            <CustomerForm form={form} />
          </Field>
          <Field className="border border-border p-4 rounded-lg flex-1 space-y-4">
            <p className="text-center font-semibold text-foreground">
              {en.address_information}
            </p>
            <AddressForm form={form} />
          </Field>
        </FieldGroup>

        <Separator />

        <FieldGroup className="flex items-center">
          <Field className="w-full max-w-xs mx-auto space-y-4">
            <Button
              disabled={isPending}
              size="lg"
              type="button"
              onClick={onSubmit}
              className="w-full"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4" /> {en.loading}
                </>
              ) : (
                en.register
              )}
            </Button>
            <FieldDescription className="text-center">
              {en.already_have_an_account}{" "}
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:underline underline-offset-4"
              >
                {en.signin}
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>
    </div>
  )
}