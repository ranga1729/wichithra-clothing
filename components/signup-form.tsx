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
import { ArrowRightIcon } from "lucide-react"
import { Item } from "./ui/item"
import { RegistrationForm } from "@/schemas/authSchemas"
import { UseFormReturn } from "react-hook-form"

interface Props {
  form: UseFormReturn<RegistrationForm>
  onNext: () => void,
}

export const SignupForm = (props:Props) => {
  const {register, formState: {errors} } = props.form;

  return (
    <form className={cn("flex flex-col gap-6")}>
      <FieldGroup className="gap-2 p-1">
        <div className="flex flex-row gap-3">
          <Field className="gap-1">
            <FieldLabel htmlFor="name">First Name *</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="firstName" type="text" placeholder="John" 
                {...register("firstName")}
                aria-invalid = {errors.firstName ? "true" : "false"}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="name">Last Name *</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="lastName" type="text" placeholder="Doe"
                {...register("lastName")}
                aria-invalid = {errors.lastName ? "true" : "false"}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </Field>
        </div>

        <Field className="gap-1">
          <FieldLabel htmlFor="email">Email *</FieldLabel>
          <div className="flex flex-col gap-0">
            <Input 
              id="email" type="email" placeholder="johndoe@example.com"
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
        </Field>
        
        <div className="flex flex-row gap-3">
          <Field className="gap-1">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="password" type="password"
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="confirm-password">Confirm Password</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="confirm-password" type="password"
                {...register("confirmPassword")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </Field>
        </div>

        <div className="flex flex-row gap-3">
          <Field className="gap-1">
            <FieldLabel htmlFor="mobilePhoneNumber">Contact(Mobile) *</FieldLabel>
            <div className="flex flex-col gap-0">
              <div className="flex flex-row items-center">
                <Item className="w-15 p-2 text-center font-semibold h-9" variant={"outline"} >+94</Item>
                <Input 
                  id="mobilePhoneNumber" type="text" size={50} 
                  placeholder="771234567"
                  {...register("mobilePhoneNumber")}
                  aria-invalid={errors.mobilePhoneNumber ? "true" : "false"}
                />
              </div>
              {errors.mobilePhoneNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.mobilePhoneNumber.message}
                </p>
              )} 
            </div>
          </Field>
          <Field className="gap-1">
            <FieldLabel htmlFor="homePhoneNumber">Contact(Home)</FieldLabel>
            <div className="flex flex-col gap-0">
              <div className="flex flex-row items-center">
                <Item className="w-15 p-2 text-center font-semibold h-9" variant={"outline"}>+94</Item>
                <Input 
                  id="homePhoneNumber" type="text"
                  placeholder="112345678"
                  {...register("homePhoneNumber")}
                  aria-invalid={errors.homePhoneNumber ? "true" : "false"}
                />
              </div>
              {errors.homePhoneNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.homePhoneNumber.message}
                </p>
              )}
            </div>
          </Field>
        </div>
        
        <Field className="mt-3">
          <Button onClick={props.onNext} type="button"> Next<ArrowRightIcon/> </Button>
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
            Sign up with GitHub
          </Button> */}
          <FieldDescription className="px-6 text-center">
            Already have an account? <Link href="login">Sign in</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
