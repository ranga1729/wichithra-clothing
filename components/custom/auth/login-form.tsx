"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Eye, EyeOff, LoaderCircle } from "lucide-react"
import { useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { LoginForm as Login_Form } from "@/schemas/authSchemas"
import { ThemeToggler } from "@/components/theme/theme-toggler"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { en } from "@/lib/i18n/en"

interface Props {
  form: UseFormReturn<Login_Form>,
  onSubmit: () => void,
}

export const LoginForm = (props: Props) => {
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false)

  const { register, formState: {errors, isSubmitting} } = props.form

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col items-center justify-start">
        <ThemeToggler />
        <CardTitle className="text-center"> {en.texts.login.title} </CardTitle>
        <CardDescription> {en.texts.login.subtitle} </CardDescription>
      </CardHeader>
      <CardContent>
        <form className={cn("flex flex-col gap-6")}>
          <FieldGroup className="gap-3 p-1">
            <Field className="gap-1">
              <FieldLabel htmlFor="email"> {en.input_labels.email} </FieldLabel>
              <div className="flex flex-col gap-0">
                <Input 
                  id="email" type="email" 
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1 text-left">
                    {errors.email.message}
                  </p>
                )}
              </div>
            </Field>

            <Field className="gap-2">
              <div className="flex items-center">
                <FieldLabel htmlFor="password"> {en.input_labels.password} </FieldLabel>
              </div>
              <div className="flex flex-col gap-0">
                <div className="relative">
                  <Input 
                    id="password" 
                    type={passwordVisibility ? "text":"password"}
                    className="pr-10"
                    {...register("password")}
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <Button
                    type="button"
                    variant={"ghost"} size={"icon-sm"}
                    onClick={() => setPasswordVisibility(!passwordVisibility)}
                    className="absolute right-0.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    aria-label={passwordVisibility ? "Hide password" : "Show password"}
                  > 
                    {passwordVisibility ? (
                      <Eye className="h-5 w-5" />
                    ) : (
                      <EyeOff className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1 text-left">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <FieldDescription className="text-center">
                <Link className="text-sm underline-offset-4 hover:underline text-center" href={"/#"}>
                  {en.texts.login.forgot_password}
                </Link>
              </FieldDescription>
            </Field>

            <Field>
              <Button type="button" size={"lg"} onClick={props.onSubmit}>
                {isSubmitting ? <><LoaderCircle className="animate-spin w-12 h-12"/> {en.common.status.loading} </> : <>{en.common.buttons.login}</> } 
              </Button>
            </Field>

            {/* <FieldSeparator>Or continue with</FieldSeparator> */}
            <Field>
              {/* <Button variant="outline" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                    fill="currentColor"
                  />
                </svg>
                Login with GitHub
              </Button> */}
              <FieldDescription className="text-center">
                {en.texts.login.dont_have_an_account} {" "}
                <Link className="underline underline-offset-4" href={"/register"}>
                  {en.common.buttons.signup}
                </Link>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}
