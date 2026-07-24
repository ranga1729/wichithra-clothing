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
import { LoginForm as Login_Form } from "@/schemas/auth-schemas"
import { en } from "@/lib/i18n/en"

interface Props {
  form: UseFormReturn<Login_Form>
  onSubmit: () => void
  isPending: boolean
}

export const LoginForm = (props: Props) => {
  const [passwordVisibility, setPasswordVisibility] = useState<boolean>(false)
  const {
    register,
    formState: { errors },
  } = props.form

  return (
    <div className="w-full space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {en.login_title}
        </h1>
        <p className="text-muted-foreground">{en.login_subtitle}</p>
      </div>

      <form className={cn("flex flex-col gap-6")}>
        <FieldGroup className="gap-4">
          <Field className="gap-2">
            <FieldLabel htmlFor="email">{en.email}</FieldLabel>
            <div className="flex flex-col gap-1">
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && (
                <p className="text-sm text-destructive text-left">
                  {errors.email.message}
                </p>
              )}
            </div>
          </Field>

          <Field className="gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="password">{en.password}</FieldLabel>
              <Link
                className="text-sm text-primary hover:underline underline-offset-4"
                href={"/#"}
              >
                {en.forgot_password}
              </Link>
            </div>
            <div className="flex flex-col gap-1">
              <div className="relative">
                <Input
                  id="password"
                  type={passwordVisibility ? "text" : "password"}
                  className="pr-10"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPasswordVisibility(!passwordVisibility)}
                  className="absolute right-0.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={
                    passwordVisibility ? "Hide password" : "Show password"
                  }
                >
                  {passwordVisibility ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive text-left">
                  {errors.password.message}
                </p>
              )}
            </div>
          </Field>

          <Field className="pt-2">
            <Button
              type="button"
              size="lg"
              onClick={props.onSubmit}
              disabled={props.isPending}
              className="w-full"
            >
              {props.isPending ? (
                <>
                  <LoaderCircle className="animate-spin h-4 w-4" />{" "}
                  {en.loading}
                </>
              ) : (
                en.login
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {en.dont_have_an_account}{" "}
          <Link
            href="/auth/register"
            className="font-medium text-primary hover:underline underline-offset-4"
          >
            {en.signup}
          </Link>
        </p>
      </div>
    </div>
  )
}