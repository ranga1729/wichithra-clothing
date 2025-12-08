import { cn } from "@/lib/utils"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RegistrationForm } from "@/schemas/authSchemas"
import { UseFormReturn } from "react-hook-form"
import { Item } from "@/components/ui/item"

interface Props {
  form: UseFormReturn<RegistrationForm>
}

export const CustomerForm = (props:Props) => {
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
                <Item className="p-1 text-center font-semibold h-9" variant={"default"} >+94</Item>
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
                <Item className="p-1 text-center font-semibold h-9" variant={"default"}>+94</Item>
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
      </FieldGroup>
    </form>
  )
}
