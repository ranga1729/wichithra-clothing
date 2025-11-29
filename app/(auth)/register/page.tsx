"use client"

import { SignupForm } from "@/components/signup-form";
import reg from "../../../public/images/reg.jpg"
import Image from "next/image";
import { AddressForm } from "@/components/address-form";
import { useState } from "react";
import { Field, FieldDescription } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registrationSchema,
  type RegistrationForm
} from "@/schemas/authSchemas"
import toast from "react-hot-toast";
import { registerUser } from "./actions";
import { useRouter } from "next/navigation";


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
  <div className="grid min-h-svh lg:grid-cols-2">
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md overflow-hidden flex flex-col gap-4">

          <Field className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create your account</h1>
            <FieldDescription>* marks required fields</FieldDescription>
          </Field>

          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            <div className="w-full max-w-md shrink-0">
              <SignupForm form={form} onNext={handleNext} />
            </div>
            <div className="w-full max-w-md shrink-0">
              <AddressForm form={form} onBack={handleBack} onSubmit={onSubmit}/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="bg-muted relative hidden lg:block">
      <Image src={reg} alt={"Registration side cover"} fill style={{ objectFit: 'cover' }} />
    </div>
  </div>
)
}