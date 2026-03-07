"use client"

import { CustomerForm } from "@/components/custom/auth/customer-form";
import { AddressForm } from "@/components/custom/auth/address-form";
import { useState } from "react";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationForm
} from "@/schemas/auth-schemas"
import toast from "react-hot-toast";
import { registerUser } from "./actions";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.png"
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { ThemeToggler } from "@/components/providers/theme/theme-toggler";
import { en } from "@/lib/i18n/en";

export default function Register() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
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
    }
  })

  const onSubmit = async () => {
    const isValid = await form.trigger()

    if(isValid) {
      const data = form.getValues()

      setIsSubmitting(true);

      try {
        const result = await registerUser(data);

        if(result.success && result.message) {
          toast.success(result.message)
          router.push("/");
        } else {
          toast.error(result.message || en.messages.registration_failed);
        }
      } catch(error:any) {
        toast.error(error.message || en.messages.registration_failed);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error(en.messages.fill_all_required_fileds);
    }
  }

  return (
    <div className="flex flex-col gap-5 min-h-svh items-center justify-center px-15 py-10 md:px-30 md:py-5">
      <Image src={logo} alt={"Logo"} height={80} width={80} />
      <Card className="w-full">
        <CardHeader className="flex flex-col items-center justify-start" >
          <ThemeToggler />
          <CardTitle className="text-center"> {en.texts.register.title} </CardTitle>
          <CardDescription className="text-center"> {en.texts.register.subtitle} </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-wrap gap-7">
          <FieldGroup className="w-full flex flex-col md:flex-row gap-10 md:gap-7">
            <Field className="border p-3 rounded-md flex-1">
              <p className="text-center font-semibold"> {en.texts.register.user_information} </p>
              <CustomerForm form={form} />
            </Field>
            <Field className="border p-3 rounded-md flex-1">
              <p className="text-center font-semibold"> {en.texts.register.address_information} </p>
              <AddressForm form={form} />
            </Field>
          </FieldGroup>
          <FieldGroup className="flex items-center">
            <Field className="w-1/2">
              <Button disabled={isSubmitting} size={"lg"} type="button" onClick={onSubmit}> 
                {isSubmitting ? 
                  <>
                    <LoaderCircle className="animate-spin w-8 h-8" /> {en.common.status.loading}
                  </> : <>
                    {en.common.buttons.register}
                  </>
                }
              </Button>
              <FieldDescription className="text-center">
                {en.texts.register.already_have_an_account} <Link href="login"> {en.common.buttons.signin} </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}