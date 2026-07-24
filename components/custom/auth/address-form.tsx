import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, UseFormReturn } from "react-hook-form"
import { RegistrationForm } from "@/schemas/auth-schemas"
import CustomSelect, { CustomSelectOptions } from "../general/CustomSelect"
import { en } from "@/lib/i18n/en"

interface Props {
  form: UseFormReturn<RegistrationForm>,
}

export const AddressForm = (props:Props) => {
  const { register, formState: {errors}, control } = props.form

  const provinces:CustomSelectOptions[] = [
    { value: "central", name: "Central Province" },
    { value: "eastern", name: "Eastern Province" },
    { value: "north-central", name: "North Central Province" },
    { value: "northern", name: "Northern Province" },
    { value: "north-western", name: "North Western Province" },
    { value: "sabaragamuwa", name: "Sabaragamuwa Province" },
    { value: "southern", name: "Southern Province" },
    { value: "uva", name: "Uva Province" },
    { value: "western", name: "Western Province" },
  ];

  return (
    <FieldGroup className="gap-4">
      <div className="flex flex-row gap-3">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="houseNo"> {en.house_number_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input 
              id="houseNo" type="text" placeholder="123/4"
              {...register("houseNo")}
              aria-invalid={errors.houseNo ? "true" : "false"}
            />
            {errors.houseNo && (
              <p className="text-sm text-destructive">
                {errors.houseNo.message}
              </p>
            )}
          </div>
        </Field>
        <Field className="gap-1.5">
          <FieldLabel htmlFor="zipCode"> {en.zipcode_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input 
              id="zipCode" type="text" 
              placeholder="10100"
              {...register("zipCode")}
              aria-invalid={errors.zipCode ? "true" : "false"}
            />
            {errors.zipCode && (
              <p className="text-sm text-destructive">
                {errors.zipCode.message}
              </p>
            )}
          </div>
        </Field>
      </div>

      <Field className="gap-1.5">
        <FieldLabel htmlFor="addressLine1"> {en.address_line_1_required} </FieldLabel>
        <div className="flex flex-col gap-1">
          <Input 
            id="addressLine1" type="text" 
            placeholder="Main Street"
            {...register("addressLine1")}
            aria-invalid={errors.addressLine1 ? "true" : "false"}
          />
          {errors.addressLine1 && (
            <p className="text-sm text-destructive">
              {errors.addressLine1.message}
            </p>
          )}
        </div>
      </Field>
      <Field className="gap-1.5">
        <FieldLabel htmlFor="addressLine2"> {en.address_line_2_required} </FieldLabel>
        <div className="flex flex-col gap-1">
          <Input 
            id="addressLine2" type="text" 
            {...register("addressLine2")}
            aria-invalid={errors.addressLine2 ? "true" : "false"}
          />
          {errors.addressLine2 && (
            <p className="text-sm text-destructive">
              {errors.addressLine2.message}
            </p>
          )}
        </div>
      </Field>

      <div className="flex flex-row gap-3">
        <Field className="gap-1.5">
          <FieldLabel htmlFor="city"> {en.nearest_city_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Input
              id="city" type="text" placeholder="Colombo"
              {...register("city")}
              aria-invalid={errors.city ? "true" : "false"} 
            />
            {errors.city && (
              <p className="text-sm text-destructive">
                {errors.city.message}
              </p>
            )}
          </div>
        </Field>

        <Field className="gap-1.5">
          <FieldLabel htmlFor="province"> {en.province_required} </FieldLabel>
          <div className="flex flex-col gap-1">
            <Controller
              name="province"
              control={control}
              render={({field}) => (
                <div>
                  <CustomSelect 
                    placeholder={"Select your Province"} 
                    optionsObject={provinces}
                    value={field.value}
                    onValueChange={field.onChange}
                    ariaInvalid={errors.province ? "true" : "false"}
                  />

                  {errors.province && (
                    <p className="text-sm text-destructive">
                      {errors.province.message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </Field>
      </div>
    </FieldGroup>
  )
}