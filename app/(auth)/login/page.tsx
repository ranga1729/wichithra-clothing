"use client"

import { LoginForm as LoginUI } from "@/components/login-form";
import Image from "next/image";
import login from "../../../public/images/login.jpg"
import { LoginForm, loginSchema } from "@/schemas/authSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { loginUser } from "./actions";
import { useRouter } from "next/navigation";

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
      const loadingToast = toast.loading("Logging in...");

      try {
        const result = await loginUser(data);
        toast.dismiss(loadingToast);

        if(result.success) {
          toast.success(result.message)
          console.log("ttttt")
          router.push("/")
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
          <div className="w-full max-w-xs">
            <LoginUI form={form} onSubmit={onSubmit} />
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image src={login} alt={"Login side cover"} fill style={{ objectFit: 'cover' }} />
      </div>
    </div>
  )
}