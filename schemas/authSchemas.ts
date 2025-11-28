import * as z from "zod"

//schemas
export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(5, "Required")
})

export const personalDataSchema = z.object({
  firstName: z
    .string()
    .min(1, "Required")
    .regex(/^[a-zA-Z\s]+$/, "Only letters allowed"),
  lastName: z
    .string()
    .min(1, "Required")
    .regex(/^[a-zA-Z\s]+$/, "Only letters allowed"),
  email: z.email("Enter a valid email address"),
  password: z
    .string()
    .min(1, "Required")
    .min(8, "Must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must contain uppercase, lowercase, and number"
    ),
  confirmPassword: z
    .string()
    .min(1, "Retype your password"),
  mobile: z
    .string()
    .min(1, "Required")
    .regex(/^[0-9]{9}$/, "Must be 9 digits"),
  work: z
    .string()
    .regex(/^[0-9]{9}$/, "Must be 9 digits")
    .optional()
    .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const addressDataSchema = z.object({
  houseNo: z
    .string()
    .min(1, "Required"),
  addressLine1: z
    .string()
    .min(2, "Required"),
  addressLine2: z
    .string()
    .min(2, "Required"),
  city: z
  .string()
  .min(2, "Required"),
  province: z
    .string()
    .min(2, "Required"),
  zipCode: z
    .string()
    .min(2, "required")
    .regex(/^[0-9]{5}$/, "Must be 5 digits"),
})

export const registrationSchema = personalDataSchema.safeExtend(addressDataSchema.shape)


// types
export type LoginFormData = z.infer<typeof loginSchema>
export type PersonalDataForm = z.infer<typeof personalDataSchema>
export type AddressDataForm = z.infer<typeof addressDataSchema>
export type RegistrationForm = z.infer<typeof registrationSchema>