"use client"

import { LoginForm as LoginUI } from "@/components/custom/auth/login-form";
import { LoginForm, loginSchema } from "@/schemas/auth-schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { loginUser } from "./actions";
import { useRouter } from "next/navigation";
import logo from "@/public/images/logo.png"
import Image from "next/image";
import { en } from "@/lib/i18n/en";

export default function Login() {
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: ""
    }
  })

  const onSubmit = async() => {
    const isValid = await form.trigger();
    
    if(isValid) {
      const data = form.getValues();

      try {
        const result = await loginUser(data);

        if(result.success) {
          toast.success(result.message)
          router.push("/")
        } else {
          toast.error(result.message || en.messages.registration_failed);
        }
      } catch(error:any) {
        toast.error(error.message);
      }
    } else {
      toast.error(en.messages.fill_all_required_fileds);
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm flex flex-col gap-5 items-center justify-center">
        <Image src={logo} alt={"Logo"} height={80} width={80} />
        <LoginUI form={form} onSubmit={onSubmit} />
      </div>
    </div>
  )
}