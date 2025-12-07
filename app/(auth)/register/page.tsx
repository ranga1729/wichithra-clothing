"use client"

import { SignupForm } from "@/components/signup-form";
import { AddressForm } from "@/components/address-form";
import { useState } from "react";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationForm
} from "@/schemas/authSchemas"
import toast from "react-hot-toast";
import { registerUser } from "./actions";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.png"
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { isValid } from "zod/v3";
import Link from "next/link";


export default function Register() {
  const [step, setStep] = useState(1);
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

  const handleNext = async () => {
    const fieldsToValidate: (keyof RegistrationForm)[] = [
      "firstName",
      "lastName", 
      "email",
      "password",
      "confirmPassword",
      "mobilePhoneNumber",
      "homePhoneNumber"
    ]

    const isValid = await form.trigger(fieldsToValidate)
    
    if (isValid) {
      setStep(2)
    } else {
      toast.error("Fill all required fields");
    }
  }

  const handleBack = () => {
    setStep(1);
  }

  const onSubmit = async () => {
    const addressToValidate: (keyof RegistrationForm)[] = [
      "houseNo",
      "addressLine1",
      "addressLine2",
      "city",
      "province",
      "zipCode"
    ]

    const isValid = await form.trigger(addressToValidate)

    if(isValid) {
      const data = form.getValues()

      const loadingToast = toast.loading("Creating your account...");

      try {
        const result = await registerUser(data);
        toast.dismiss(loadingToast);

        if(result.success) {
          toast.success(result.message)
          router.push("/");
        } else {
          toast.error(result.message || "Registration failed");
        }
      } catch(error:any) {
        toast.dismiss(loadingToast);
        toast.error(error.message);
        console.error("Registration error:", error);
      }
    } else {
      toast.error("Please fill all required fields");
    }
  }

  return (
    <div className="flex flex-col gap-5 min-h-svh items-center justify-center p-6 md:p-10">
      <Image src={logo} alt={"Logo"} height={80} width={80} />
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-center">Create an account</CardTitle>
          <CardDescription className="text-center">
            Enter your information below to create your account
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full flex flex-col flex-wrap gap-7">
          <FieldGroup className="w-full flex flex-row">
            <Field className="border p-3 rounded-md">
              <SignupForm form={form} />
            </Field>
            <Field className="border p-3 rounded-md">
              <AddressForm form={form} />
            </Field>
          </FieldGroup>
          <FieldGroup className="flex items-center">
            <Field className="w-1/2">
              <Button type="button"> 
                {form ? 
                  <>Registering...</> : <><Check /> Register</>
                }
              </Button>
              <FieldDescription className="text-center">
                Already have an account? <Link href="login">Sign in</Link>
              </FieldDescription>
            </Field>
            
          </FieldGroup>
      </CardContent>
    </Card>
  </div>
  )
}