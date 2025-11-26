"use client"

import { SignupForm } from "@/components/signup-form";
import reg from "../../../public/images/reg.jpg"
import Image from "next/image";
import { AddressForm } from "@/components/address-form";
import { useState } from "react";

export default function Register() {
  const [ step, setStep ] = useState(1);

  const handleNext = () => {
    setStep(2);
  }

  const handleBack = () => {
    setStep(1);
  }

  const handleConfirm = () => {
    alert("Form submitted successfully!");
    setStep(1)
  }

  return (
  <div className="grid min-h-svh lg:grid-cols-2">
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
          >
            <div className="w-full max-w-md shrink-0">
              <SignupForm onNext={handleNext} />
            </div>
            <div className="w-full max-w-md shrink-0">
              <AddressForm onBack={handleBack} onConfirm={handleConfirm}/>
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