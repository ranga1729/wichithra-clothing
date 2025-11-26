import { SignupForm } from "@/components/signup-form";
import reg from "../../../public/images/reg.jpg"
import Image from "next/image";
import { AddressForm } from "@/components/address-form";

export default function Register() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <SignupForm />
            {/* <AddressForm/> */}
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image src={reg} alt={"Registration side cover"} fill style={{ objectFit: 'cover' }} />
      </div>
    </div>
  )
}