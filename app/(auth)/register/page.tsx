"use client"

import { SignupForm } from "@/components/signup-form";
import reg from "../../../public/images/reg.jpg"
import Image from "next/image";
import { AddressForm } from "@/components/address-form";
import { useState } from "react";
import { Field, FieldDescription } from "@/components/ui/field";
import { AddressData, PersonalData } from "@/lib/types";

export default function Register() {
  const [step, setStep] = useState(1);
  const [personalData, setPersonalData] = useState<PersonalData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobile: "",
    work: ""
  });
  const [addressData, setAddressData] = useState<AddressData>({
    houseNo: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    province: "",
    zipCode: ""
  });

  const handlePersonalDataChange = (e:any) => {
    setPersonalData({
      ...personalData, [e.target.name]:e.target.value
    });
  };

  const handleAddressDataChange = (e:any) => {
    setAddressData({
      ...addressData, [e.target.name]:e.target.value
    });
  };

  const handleNext = () => {
    setStep(2);
  }

  const handleBack = () => {
    setStep(1);
  }

  const handleConfirm = () => {
    console.log(personalData)
    console.log(addressData)
    //setStep(1)
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
              <SignupForm onNext={handleNext} formData={personalData} onChange={handlePersonalDataChange}/>
            </div>
            <div className="w-full max-w-md shrink-0">
              <AddressForm formData={addressData} onChange={handleAddressDataChange} onBack={handleBack} onConfirm={handleConfirm}/>
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