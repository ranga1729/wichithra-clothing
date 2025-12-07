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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"


interface Props {
  form: UseFormReturn<RegistrationForm>,
}

export const AddressForm = (props:Props) => {
  const { register, formState: {errors} } = props.form

  return (
    <form className={cn("flex flex-col gap-6")}>
      <FieldGroup className="gap-2 p-1">
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
      </FieldGroup>
    </form>
  )
}
