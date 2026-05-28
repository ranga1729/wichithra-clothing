"use client"

import { CustomerForm } from "@/components/custom/auth/customer-form";
import { AddressForm } from "@/components/custom/auth/address-form";
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
import { useMutation } from "@tanstack/react-query";

export default function Register() {
  const router = useRouter();
  
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

  const { mutate: register, isPending } = useMutation({
    mutationFn: (data: RegistrationForm) => registerUser(data),
    onSuccess: (result) => {
      if (result.success && result.message) {
        toast.success(result.message);
        router.push("/");
      } else {
        toast.error(result.message || en.registration_failed);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || en.registration_failed);
    }
  });

  const onSubmit = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      register(form.getValues());
    } else {
      toast.error(en.fill_all_required_fileds);
    }
  }

  return (
    <div className="flex flex-col gap-5 border bg-neutral-800 min-h-svh items-center justify-center px-15 py-10 md:px-30 md:py-5">
      <Image src={logo} alt={"Logo"} height={80} width={80} />
      <Card className="max-w-5xl w-5xl">
        <CardHeader className="flex flex-col items-center justify-start" >
          <ThemeToggler />
          <CardTitle className="text-center"> {en.register_title} </CardTitle>
          <CardDescription className="text-center"> {en.register_subtitle} </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col flex-wrap gap-7">
          <FieldGroup className="w-full flex flex-col md:flex-row gap-10 md:gap-7">
            <Field className="border p-3 rounded-md flex-1">
              <p className="text-center font-semibold"> {en.user_information} </p>
              <CustomerForm form={form} />
            </Field>
            <Field className="border p-3 rounded-md flex-1">
              <p className="text-center font-semibold"> {en.address_information} </p>
              <AddressForm form={form} />
            </Field>
          </FieldGroup>
          <FieldGroup className="flex items-center">
            <Field className="w-1/2">
              <Button disabled={isPending} size={"lg"} type="button" onClick={onSubmit}> 
                {isPending ? 
                  <>
                    <LoaderCircle className="animate-spin w-8 h-8" /> {en.loading}
                  </> : <>
                    {en.register}
                  </>
                }
              </Button>
              <FieldDescription className="text-center">
                {en.already_have_an_account} <Link href="/auth/login"> {en.signin} </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  )
}