import { LoginForm } from "@/components/login-form";
import Image from "next/image";
import login from "../../../public/images/login.jpg"

export default function Login() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image src={login} alt={"Login side cover"} fill style={{ objectFit: 'cover' }} />
      </div>
    </div>
  )
}