import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RegistrationForm } from "@/schemas/auth-schemas"
import { UseFormReturn } from "react-hook-form"
import { Item } from "@/components/ui/item"
import { en } from "@/lib/i18n/en"

interface Props {
  form: UseFormReturn<RegistrationForm>
}

export const CustomerForm = (props:Props) => {
  const {register, formState: {errors} } = props.form;

  return ( 
    <FieldGroup className="gap-4">
      <div className="flex flex-row gap-3">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="firstName"> {en.firstname_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input 
              id="firstName" type="text" placeholder="John" 
              {...register("firstName")}
              aria-invalid = {errors.firstName ? "true" : "false"}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">
                {errors.firstName.message}
              </p>
            )}
          </div>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="lastName"> {en.lastname_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input 
              id="lastName" type="text" placeholder="Doe"
              {...register("lastName")}
              aria-invalid = {errors.lastName ? "true" : "false"}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </Field>
      </div>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="email"> {en.email_required} </FieldLabel>
        <div className="flex flex-col gap-1">
          <Input 
            id="email" type="email" placeholder="johndoe@example.com"
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
      </Field>
      
      <div className="flex flex-row gap-3">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="password"> {en.password} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input 
              id="password" type="password"
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="confirm-password"> {en.confirm_password} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input 
              id="confirm-password" type="password"
              {...register("confirmPassword")}
              aria-invalid={errors.confirmPassword ? "true" : "false"}
            />
            {errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </Field>
      </div>

      <div className="flex flex-row gap-3">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="mobilePhoneNumber"> {en.contact_mobile_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center">
              <Item className="p-1 text-center font-semibold h-9" variant={"default"} > {en.country_code} </Item>
              <Input 
                id="mobilePhoneNumber" type="text" 
                placeholder="771234567"
                {...register("mobilePhoneNumber")}
                aria-invalid={errors.mobilePhoneNumber ? "true" : "false"}
              />
            </div>
            {errors.mobilePhoneNumber && (
              <p className="text-sm text-destructive">
                {errors.mobilePhoneNumber.message}
              </p>
            )} 
          </div>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="homePhoneNumber"> {en.contact_home} </FieldLabel>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row items-center">
              <Item className="p-1 text-center font-semibold h-9" variant={"default"}> {en.country_code} </Item>
              <Input 
                id="homePhoneNumber" type="text"
                placeholder="112345678"
                {...register("homePhoneNumber")}
                aria-invalid={errors.homePhoneNumber ? "true" : "false"}
              />
            </div>
            {errors.homePhoneNumber && (
              <p className="text-sm text-destructive">
                {errors.homePhoneNumber.message}
              </p>
            )}
          </div>
        </Field>
      </div>
    </FieldGroup>
  )
}
