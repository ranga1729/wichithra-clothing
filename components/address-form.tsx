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
import { ArrowLeftIcon, Check, Loader2Icon } from "lucide-react"
import { UseFormReturn } from "react-hook-form"
import { RegistrationForm } from "@/schemas/authSchemas"

interface Props {
  form: UseFormReturn<RegistrationForm>,
  onBack: () => void,
  onSubmit: () => void,
}

export const AddressForm = (props:Props) => {
  const { register, formState: {errors, isSubmitting, isValid} } = props.form

  return (
    <form className={cn("flex flex-col gap-6")}>
      <FieldGroup className="gap-2">
        <div className="flex flex-row gap-3">
          <Field className="gap-1">
            <FieldLabel htmlFor="houseNo">House No. *</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="houseNo" type="text" placeholder="123/4"
                {...register("houseNo")}
                aria-invalid={errors.houseNo ? "true" : "false"}
              />
              {errors.houseNo && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.houseNo.message}
                </p>
              )}
            </div>
          </Field>
          <Field className="gap-1">
            <FieldLabel htmlFor="zipCode">Zip Code *</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="zipCode" type="text" 
                placeholder="10100"
                {...register("zipCode")}
                aria-invalid={errors.zipCode ? "true" : "false"}
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.zipCode.message}
                </p>
              )}
            </div>
          </Field>
        </div>

        <Field className="gap-1">
          <FieldLabel htmlFor="addressLine1">Addresss Line - 1 *</FieldLabel>
          <div className="flex flex-col gap-0">
            <Input 
              id="addressLine1" type="text" 
              placeholder="Main Street"
              {...register("addressLine1")}
              aria-invalid={errors.addressLine1 ? "true" : "false"}
            />
            {errors.addressLine1 && (
              <p className="text-sm text-red-600 mt-1">
                {errors.addressLine1.message}
              </p>
            )}
          </div>
        </Field>
        <Field className="gap-1">
          <FieldLabel htmlFor="addressLine2">Address Line - 2 *</FieldLabel>
          <div className="flex flex-col gap-0">
            <Input 
              id="addressLine2" type="text" 
              {...register("addressLine2")}
              aria-invalid={errors.addressLine2 ? "true" : "false"}
            />
            {errors.addressLine2 && (
              <p className="text-sm text-red-600 mt-1">
                {errors.addressLine2.message}
              </p>
            )}
          </div>
        </Field>

        <div className="flex flex-row gap-3">
          <Field className="gap-1">
            <FieldLabel htmlFor="city">Nearest City *</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input
                id="city" type="text" placeholder="Colombo"
                {...register("city")}
                aria-invalid={errors.city ? "true" : "false"} 
              />
              {errors.city && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
          </Field>

          <Field className="gap-1">
            <FieldLabel htmlFor="province">Province *</FieldLabel>
            <div className="flex flex-col gap-0">
              <Input 
                id="province" type="text" placeholder="Western" 
                {...register("province")}
                aria-invalid={errors.province ? "true" : "false"}
              />
              {errors.province && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.province.message}
                </p>
              )}
            </div>
          </Field>
        </div>
        <Field className="flex flex-row mt-3">
          <Field>
            <Button onClick={props.onBack} type="button" variant={"outline"} > <ArrowLeftIcon /> Back</Button>
          </Field>
          <Field>
            <Button onClick={props.onSubmit} type="button" 
            > 
              {!isSubmitting ? 
                <><Loader2Icon className="animate-spin w-12 h-12"/>Registering...</> : <><Check /> Register</>
              }
              
            </Button>
          </Field>
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
