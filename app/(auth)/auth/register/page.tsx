"use client"

import { useState } from "react"
import { CustomerForm } from "@/components/custom/auth/customer-form"
import { AddressForm } from "@/components/custom/auth/address-form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  registrationSchema,
  type RegistrationForm,
} from "@/schemas/auth-schemas"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast";
import { registerUser } from "./actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import { en } from "@/lib/i18n/en";
import { useMutation } from "@tanstack/react-query";

const STEPS = [
  { id: 1, label: "Personal Info" },
  { id: 2, label: "Address" },
]

export default function Register() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")

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

  const handleNext = async () => {
    if (currentStep === 1) {
      const isValid = await form.trigger([
        "firstName",
        "lastName",
        "email",
        "password",
        "confirmPassword",
        "mobilePhoneNumber",
        "homePhoneNumber",
      ])
      if (isValid) {
        setDirection("forward")
        setCurrentStep(2)
      } else {
        toast.error(en.fill_all_required_fileds)
      }
    }
  }

  const handleBack = () => {
    setDirection("backward")
    setCurrentStep(1)
  }

  const onSubmit = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      register(form.getValues())
    } else {
      toast.error(en.fill_all_required_fileds)
    }
  }

  const progressValue = (currentStep / STEPS.length) * 100

  return (
    <div className="w-full max-w-lg space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {en.register_title}
        </h1>
        <p className="text-muted-foreground">{en.register_subtitle}</p>
      </div>

      {/* Step Progress */}
      <div className="space-y-4">
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between">
          {STEPS.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2 text-sm font-medium ${
                currentStep >= step.id
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-3 h-3" />
                ) : (
                  step.id
                )}
              </div>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-80">
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <span>{en.user_information}</span>
            </div>
            <CustomerForm form={form} />
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-1 h-4 bg-primary rounded-full" />
              <span>{en.address_information}</span>
            </div>
            <AddressForm form={form} />
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col gap-4">
        {currentStep === 1 ? (
          <Button
            type="button"
            size="lg"
            onClick={handleNext}
            className="w-full"
          >
            Continue
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              type="button"
              size="lg"
              variant="outline"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={onSubmit}
              disabled={isPending}
              className="flex-1"
            >
              {isPending ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4" /> {en.loading}
                </>
              ) : (
                <>
                  {en.register}
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {en.already_have_an_account}{" "}
          <Link
            href="/auth/login"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {en.signin}
          </Link>
        </p>
      </div>
    </div>
  )
}