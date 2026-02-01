import { cn } from "@/lib/utils"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Controller, UseFormReturn } from "react-hook-form"
import { RegistrationForm } from "@/schemas/authSchemas"
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
    <form className={cn("flex flex-col gap-6")}>
      <FieldGroup className="gap-2 p-1">
        <div className="flex flex-row gap-3">
          <Field className="gap-1">
            <FieldLabel htmlFor="houseNo"> {en.input_labels.house_number_required} </FieldLabel>
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
            <FieldLabel htmlFor="zipCode"> {en.input_labels.zipcode_required} </FieldLabel>
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
          <FieldLabel htmlFor="addressLine1"> {en.input_labels.address_line_1_required} </FieldLabel>
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
          <FieldLabel htmlFor="addressLine2"> {en.input_labels.address_line_2_required} </FieldLabel>
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
            <FieldLabel htmlFor="city"> {en.input_labels.nearest_city_required} </FieldLabel>
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
            <FieldLabel htmlFor="province"> {en.input_labels.province_required} </FieldLabel>
            <div className="flex flex-col gap-0">
              <Controller
                name="province"
                control={control}
                render={({field}) => (
                  <div>
                    <CustomSelect 
                      placeholder={"Select your Province"} 
                      options={provinces} 
                      value={field.value}
                      onValueChange={field.onChange}
                      ariaInvalid={errors.province ? "true" : "false"}
                    />

                    {errors.province && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.province.message}
                      </p>
                    )}
                  </div>
                )}
              />
              
              {/* <Input 
                id="province" type="text" placeholder="Western" 
                {...register("province")}
                aria-invalid={errors.province ? "true" : "false"}
              /> */}
            </div>
          </Field>
        </div>
      </FieldGroup>
    </form>
  )
}
